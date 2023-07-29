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
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import ms from 'ms';

import { ApiError } from '@/exceptions';
import { UsersService } from '@/services';

import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  async login(@Body() body: AuthDto, @Res() res: Response, @Next() next: any) {
    const userData = await this.usersService.login(body);

    if (userData instanceof ApiError) {
      return next(userData);
    }

    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN')),
      httpOnly: true,
    });

    return res.json(userData);
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const { refreshToken } = req.cookies;
    const token = await this.usersService.logout(refreshToken);
    res.clearCookie('refreshToken');

    return res.json(token);
  }

  @Get('activate/:link')
  async activate(@Res() res: Response, @Param('link') link: string) {
    await this.usersService.activate(link);
    res.redirect(this.configService.get('CLIENT_URL', 'https://ya.ru/'));
  }

  @Get('refresh')
  async refresh(@Req() req: Request, @Res() res: Response, @Next() next: any) {
    const { refreshToken } = req.cookies;
    const userData = await this.usersService.refresh(refreshToken);
    if (userData instanceof ApiError) {
      next(userData);
    } else {
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN')),
        httpOnly: true,
      });
      res.json(userData);
    }
  }
}
