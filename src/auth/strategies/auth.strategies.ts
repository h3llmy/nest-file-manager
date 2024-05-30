import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { ILoginTokenPayload } from '../auth.interface';

/**
 * JWT (JSON Web Token) authentication strategy.
 * Extends `PassportStrategy` from `@nestjs/passport`.
 */
@Injectable()
export class JwtStrategies extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
    } as StrategyOptions);
  }

  /**
   * Method to validate the payload extracted from the JWT token.
   * @param payload - Payload extracted from the JWT token.
   * @returns User object if validation is successful.
   * @throws UnauthorizedException if the token is invalid.
   */
  async validate(payload: ILoginTokenPayload) {
    // Validate the user based on the payload data
    return await this.userService.findOne(payload.id);
  }
}
