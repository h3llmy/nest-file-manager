import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from '../../users/entities/user.entity';

/**
 * Guard to check permissions for accessing routes.
 * Implements `CanActivate` interface from `@nestjs/common`.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Method to determine whether the user has the required permissions to access the route.
   * @param context - ExecutionContext object containing request context.
   * @returns A boolean indicating whether the user has permission to access the route.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Retrieve required permissions from route handler or controller class metadata
    const requiredPermission = this.reflector.getAllAndOverride<string[]>(
      'permission',
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are set, allow access
    if (!requiredPermission) {
      return true;
    }

    // // Extract user information from the request
    const { user } = context.switchToHttp().getRequest<{ user: User }>();

    // If 'authorize' permission is required, check if user exists
    if (requiredPermission.includes('Authorize')) {
      return !!user;
    }

    if (!user) throw new UnauthorizedException('Unauthorized');

    // Check if user has any of the required roles
    return requiredPermission.some((role) => user?.role?.includes(role));
  }
}
