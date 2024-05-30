import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

/**
 * Custom JWT (JSON Web Token) authentication guard.
 * Extends `AuthGuard` from `@nestjs/passport`.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Override method to customize the handling of the request.
   * @param err - Error encountered during authentication.
   * @param user - User object if authentication is successful.
   * @returns User object if authentication is successful, otherwise undefined.
   */
  handleRequest(err: unknown, user: any, info: any) {
    if (err) {
      if (info instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      if (info) {
        throw new UnauthorizedException(info.message);
      } else {
        new UnauthorizedException('Unauthorized');
      }
    }
    if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
