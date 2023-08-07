import {
  Body,
  Controller,
  Get,
  Next,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import ms from 'ms';

import { UsersService } from '@/services';
import { isError } from '@/shared';

import { AuthDto } from './dto/auth.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  async login(@Body() body: AuthDto, @Res() res: Response, @Next() next: any) {
    const userData = await this.usersService.login(body);

    if (isError(userData)) return next(userData);

    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN')),
      httpOnly: true,
    });

    return res.json(userData);
  }

  @Put('password')
  async changePassword(
    @Body() body: ChangePasswordDto,
    @Res() res: Response,
    @Next() next: any,
  ) {
    const result = await this.usersService.changePassword({
      ...body,
      email: res.locals.user?.email,
    });

    if (isError(result)) {
      return next(result);
    }

    return res.send(result);
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const { refreshToken } = req.cookies;
    const token = await this.usersService.logout(refreshToken);
    res.clearCookie('refreshToken');

    return res.json(token);
  }

  @Get('activate/:link')
  async activate(@Param('link') link: string) {
    const user = await this.usersService.activate(link);

    return user;
  }

  @Get('refresh')
  async refresh(@Req() req: Request, @Res() res: Response, @Next() next: any) {
    const { refreshToken } = req.cookies;
    const userData = await this.usersService.refresh(refreshToken);

    if (isError(userData)) return next(userData);

    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN')),
      httpOnly: true,
    });

    return res.json(userData);
  }
}
