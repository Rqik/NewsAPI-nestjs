import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

import { ApiError } from '@/exceptions';
import { TokensService } from '@/services';
import { getAuthorizationToken } from '@/shared';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private tokensService: TokensService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    try {
      const token = getAuthorizationToken(req);

      const userDto = this.tokensService.validateAccess(token);

      res.locals.user = userDto;

      return true;
    } catch (error) {
      throw ApiError.UnauthorizeError();
    }
  }
}
