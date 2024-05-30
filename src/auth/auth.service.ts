import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersService } from 'src/users/users.service';
import { EncryptionService } from '@app/encryption';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { RandomizeService } from '@app/randomize';
import { LoginDto } from './dto/login-user.dto';
import { MailerService } from '@nestjs-modules/mailer';
import {
  IForgetPasswordPayload,
  ILoginTokenPayload,
  IRegisterTokenPayload,
} from './auth.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';

/**
 * AuthService handles the authentication and authorization logic.
 */
@Injectable()
export class AuthService {
  private readonly REGISTER_EXPIRED_TIME: string | number = '5m';
  private readonly ACCESS_EXPIRED_TIME: string | number = '30d';
  private readonly REFRESH_EXPIRED_TIME: string | number = '30d';
  private readonly FORGET_PASSWORD_EXPIRED_TIME: string | number = '5m';
  private readonly ACCESS_TOKEN_SECRET: string;
  private readonly REFRESH_TOKEN_SECRET: string;
  private readonly REGISTER_TOKEN_SECRET: string;
  private readonly FORGET_PASSWORD_TOKEN_SECRET: string;

  constructor(
    private readonly usersServices: UsersService,
    private readonly encryptionService: EncryptionService,
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    protected readonly mailerService: MailerService,
    protected readonly randomizeService: RandomizeService,
  ) {
    this.ACCESS_TOKEN_SECRET = configService.get<string>('ACCESS_TOKEN_SECRET');
    this.REFRESH_TOKEN_SECRET = configService.get<string>(
      'REFRESH_TOKEN_SECRET',
    );
    this.REGISTER_TOKEN_SECRET = configService.get<string>(
      'REGISTER_TOKEN_SECRET',
    );
    this.FORGET_PASSWORD_TOKEN_SECRET = configService.get<string>(
      'FORGET_PASSWORD_TOKEN_SECRET',
    );
  }

  /**
   * Registers a new user and sends a verification email.
   * @param registerDto - Data Transfer Object containing user registration information.
   * @returns A message indicating registration success.
   */
  async register(registerDto: RegisterUserDto): Promise<{ message: string }> {
    const user = await this.usersServices.register(registerDto);

    const tokenPayload: IRegisterTokenPayload = {
      id: user.id,
    };

    const token = this.jwtService.sign(tokenPayload, {
      secret: this.REGISTER_TOKEN_SECRET,
      expiresIn: this.REGISTER_EXPIRED_TIME,
    });

    const webUrl = this.configService.get<string>('WEB_URL');
    const webVerifyRoute = this.configService.get<string>('WEB_VERIFY_ROUTE');
    const confirmationLink = `${webUrl}/${webVerifyRoute}/${token}`;

    this.mailerService.sendMail({
      template: 'email/register',
      to: registerDto.email,
      subject: 'Registration Email',
      context: {
        confirmationLink,
        user,
      },
    });

    return { message: 'Registration Success' };
  }

  /**
   * Verifies the user's email using the provided token.
   * @param token - The verification token sent to the user's email.
   * @returns Login tokens if the email verification is successful.
   */
  async verifyEmail(token: string) {
    const credential: IRegisterTokenPayload = this.jwtService.verify(token, {
      secret: this.REGISTER_TOKEN_SECRET,
    });

    const user = await this.usersServices.findOne(credential.id);

    this.usersServices.update(credential.id, {
      emailVerifiedAt: Date.now(),
    });

    return this.createLoginToken(user);
  }

  /**
   * Authenticates a user using their email and password.
   * @param loginDto - Data Transfer Object containing login information.
   * @returns Access and refresh tokens if authentication is successful.
   * @throws BadRequestException if the credentials are invalid or the user is not verified.
   */
  async login(loginDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const userCheck = await this.usersServices.findOneByEmail(loginDto.email);

    if (
      !userCheck ||
      !this.encryptionService.match(loginDto.password, userCheck.password)
    ) {
      throw new BadRequestException('Invalid credential');
    }

    if (!userCheck.emailVerifiedAt) {
      throw new BadRequestException('User is not verified');
    }

    return this.createLoginToken(userCheck);
  }

  /**
   * Initiates the password reset process by sending an email with a reset link.
   * @param forgetPasswordDto - Data Transfer Object containing the user's email.
   * @returns A message indicating the email has been sent.
   */
  async forgetPassword(
    forgetPasswordDto: ForgetPasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersServices.findOneByEmail(
      forgetPasswordDto.email,
    );

    const tokenPayload: IForgetPasswordPayload = {
      id: user.id,
    };

    const token = this.jwtService.sign(tokenPayload, {
      secret: this.FORGET_PASSWORD_TOKEN_SECRET,
      expiresIn: this.FORGET_PASSWORD_EXPIRED_TIME,
    });

    const webUrl = this.configService.get<string>('WEB_URL');
    const forgetPasswordRoute = this.configService.get<string>(
      'WEB_FORGET_PASSWORD_ROUTE',
    );
    const redirectLink = `${webUrl}/${forgetPasswordRoute}/${token}`;

    this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset Password',
      context: {
        redirectLink,
        user,
      },
      template: 'email/forget-password',
    });

    return { message: 'Email Sended' };
  }

  /**
   * Resets the user's password using the provided token and new password.
   * @param token - The token sent to the user's email for password reset.
   * @param resetPassword - Data Transfer Object containing the new password.
   */
  async resetPassword(
    token: string,
    resetPassword: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const credential: IForgetPasswordPayload = this.jwtService.verify(token, {
      secret: this.FORGET_PASSWORD_TOKEN_SECRET,
    });

    this.usersServices.update(
      credential.id,
      {
        password: resetPassword.password,
      },
      'Fail to update Password',
    );

    return { message: 'Password has been updated' };
  }

  /**
   * Refreshes the access token using the provided refresh token.
   * @param refreshTokenDto - Data Transfer Object containing the refresh token.
   * @returns New access and refresh tokens.
   */
  async refreshToken({ refreshToken }: RefreshTokenDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const credential: ILoginTokenPayload = this.jwtService.verify(
      refreshToken,
      { secret: this.REFRESH_TOKEN_SECRET },
    );

    const userCheck = await this.usersServices.findOne(credential.id);

    return this.createLoginToken(userCheck);
  }

  /**
   * Creates access and refresh tokens for the user.
   * @param payload - The user object for which to create tokens.
   * @returns Access and refresh tokens.
   */
  createLoginToken(payload: User): {
    accessToken: string;
    refreshToken: string;
  } {
    const tokenPayload: ILoginTokenPayload = {
      id: payload.id,
      email: payload.email,
      username: payload.username,
    };
    return {
      accessToken: this.jwtService.sign(tokenPayload, {
        secret: this.ACCESS_TOKEN_SECRET,
        expiresIn: this.ACCESS_EXPIRED_TIME,
      }),
      refreshToken: this.jwtService.sign(tokenPayload, {
        secret: this.REFRESH_TOKEN_SECRET,
        expiresIn: this.REFRESH_EXPIRED_TIME,
      }),
    };
  }
}
