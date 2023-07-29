import {
  Body,
  Controller,
  Get,
  Next,
  Param,
  Post,
  Redirect,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import ms from 'ms';

import { ApiError } from '@/exceptions';
import { UsersService } from '@/services/users/users.service';

import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private usersService: UsersService) {}

  @Post('login')
  async login(@Body() body: AuthDto, @Res() res: Response, @Next() next: any) {
    const userData = await this.usersService.login(body);

    if (userData instanceof ApiError) {
      return next(userData);
    }

    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: ms(config.jwtRefreshExpireIn as string),
      httpOnly: true,
    });

    return res.json(userData);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const { refreshToken } = req.cookies;
    const token = await this.usersService.logout(refreshToken);
    res.clearCookie('refreshToken');

    return res.json(token);
  }

  @Get('activate/:link')
  @Redirect(config.clientUrl || 'https://ya.ru/')
  async activate(@Param('link') link: string) {
    await this.usersService.activate(link);
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response, @Next() next: any) {
    const { refreshToken } = req.cookies;
    const userData = await this.usersService.refresh(refreshToken);
    if (userData instanceof ApiError) {
      next(userData);
    } else {
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: ms(config.jwtRefreshExpireIn as string),
        httpOnly: true,
      });
      res.json(userData);
    }
  }
}
