import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { TokensService, UsersService } from '@/services';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly tokensService: TokensService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCurrentAuth(@Res() res: Response) {
    const result = await this.usersService.getById({ id: res.locals.user.id });

    return result;
  }
}
