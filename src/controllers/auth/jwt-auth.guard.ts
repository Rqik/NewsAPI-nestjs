import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

import { ApiError } from '@/exceptions';

export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    try {
      const authHeader = req.headers.authorization;
      const [bearer, token] = authHeader.split();
      if (bearer !== 'Bearer' || !token) {
        throw ApiError.UnauthorizeError();
      }
      const user = this.jwtService.verify(token);
      res.locals.user = user;

      return true;
    } catch (error) {
      throw ApiError.UnauthorizeError();
    }
  }
}
