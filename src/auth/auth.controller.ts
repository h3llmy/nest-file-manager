import { Controller, Post, Body, Param, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiCreatedResponse,
  ApiUnprocessableEntityResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  BasicErrorSchema,
  AuthTokenSchema,
  BasicSuccessSchema,
} from '@app/common';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: BasicSuccessSchema,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation Error',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        error: {
          type: 'object',
          properties: {
            username: {
              type: 'array',
              items: { type: 'string' },
            },
            email: {
              type: 'array',
              items: { type: 'string' },
            },
            password: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'User already exists',
    type: BasicErrorSchema,
  })
  register(
    @Body() createAuthDto: RegisterUserDto,
  ): Promise<BasicSuccessSchema> {
    return this.authService.register(createAuthDto);
  }

  @Post('verify-email/:token')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiParam({ name: 'token', description: 'Email verification token' })
  @ApiCreatedResponse({
    description: 'Email verified successfully',
    type: AuthTokenSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid token',
    type: BasicErrorSchema,
  })
  @ApiBadRequestResponse({
    description: 'User already verified',
    type: BasicErrorSchema,
  })
  verifyEmail(@Param('token') token: string): Promise<AuthTokenSchema> {
    return this.authService.verifyEmail(token);
  }

  @Post('login')
  @ApiCreatedResponse({
    description: 'Email verified successfully',
    type: AuthTokenSchema,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: BasicErrorSchema,
  })
  @ApiBadRequestResponse({
    description: 'User already verified',
    type: BasicErrorSchema,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation Error',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        error: {
          type: 'object',
          properties: {
            email: {
              type: 'array',
              items: { type: 'string' },
            },
            password: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Login a user' })
  login(@Body() loginDto: LoginDto): Promise<AuthTokenSchema> {
    return this.authService.login(loginDto);
  }

  @Post('forget-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiCreatedResponse({
    description: 'Email sent successfully',
    type: BasicSuccessSchema,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation Error',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        error: {
          type: 'object',
          properties: {
            email: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: BasicErrorSchema,
  })
  forgetPassword(
    @Body() forgetPasswordDto: ForgetPasswordDto,
  ): Promise<BasicSuccessSchema> {
    return this.authService.forgetPassword(forgetPasswordDto);
  }

  @Put('reset-password/:token')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiParam({ name: 'token', description: 'Password reset token' })
  @ApiCreatedResponse({
    description: 'Password reset successful',
    type: BasicSuccessSchema,
  })
  @ApiBadRequestResponse({
    description: 'failed to reset password',
    type: BasicErrorSchema,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation Error',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        error: {
          type: 'object',
          properties: {
            password: { type: 'string' },
            confirmPassword: { type: 'string' },
          },
        },
      },
    },
  })
  resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<BasicSuccessSchema> {
    return this.authService.resetPassword(token, resetPasswordDto);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiCreatedResponse({
    description: 'Refresh token successful',
    type: AuthTokenSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid token',
    type: BasicErrorSchema,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation Error',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        error: {
          type: 'object',
          properties: {
            refreshToken: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: BasicErrorSchema,
  })
  refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthTokenSchema> {
    return this.authService.refreshToken(refreshTokenDto);
  }
}
