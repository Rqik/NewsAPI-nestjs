import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

import { ApiError } from '@/exceptions';
import { TokensService } from '@/services';
import { getAuthorizationToken } from '@/shared';

@Injectable()
export class JwtAdminGuard implements CanActivate {
  constructor(private tokensService: TokensService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    try {
      const token = getAuthorizationToken(req);

      if (!token) throw ApiError.NotFound();

      const userDto = this.tokensService.validateAccess(token);

      if (!userDto || typeof userDto !== 'object') {
        throw ApiError.NotFound();
      }

      if (!userDto?.isAdmin || !userDto.isActivated) {
        throw ApiError.NotFound();
      }

      res.locals.user = userDto;

      return true;
    } catch (error) {
      throw ApiError.UnauthorizeError();
    }
  }
}
