import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Next,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import ms from 'ms';

import { ApiError } from '@/exceptions';
import { FileService, TokensService, UsersService } from '@/services';
import { getAuthorizationToken, isError, paginator } from '@/shared';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly fileService: FileService,
    private readonly tokensService: TokensService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  async create(
    @Body() body: UserDto,
    @Res() res: Response,
    @UploadedFile() avatar,
    @Next() next: NextFunction,
  ) {
    const { firstName, lastName, login, password, email } = body;

    const avatarName = this.fileService.saveAvatar(avatar);

    if (isError(avatarName)) return next(avatarName);

    const userData = await this.usersService.registration({
      password,
      login,
      avatar: 'avatarName',
      lastName,
      firstName,
      email,
    });

    if (isError(userData)) return next(userData);

    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: ms(this.configService.get('JWT_REFRESH_EXPIRES_IN') as string),
      httpOnly: true,
    });

    return res.status(HttpStatus.CREATED).send({ result: userData });
  }

  @Put(':id')
  async update(
    @Body() body: UpdateUserDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.usersService.update({ ...body, id });

    return result;
  }

  @Put(':login')
  async partialUpdate(
    @Param('login') login: string,
    @Body() body: UpdateUserDto,
  ) {
    const result = await this.usersService.partialUpdate({
      ...body,
      login,
    });

    return result;
  }

  @Get()
  async getAll(
    @Req() req: Request,
    @Query('per_page') perPage = 10,
    @Query('page') page = 0,
  ) {
    const { totalCount, users, count } = await this.usersService.getAll({
      page: Number(page),
      perPage: Number(perPage),
    });

    const pagination = paginator({
      totalCount,
      count,
      req,
      route: '/users',
      page: Number(page),
      perPage: Number(perPage),
      apiUrl: this.configService.get<string>('API_URL'),
    });

    return { ...pagination, data: users };
  }

  @Get(':login')
  async getOne(@Param('login') login: string) {
    const result = await this.usersService.getOne({ login });

    return result;
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  async getCurrentAuth(@Res() res: Response) {
    const result = await this.usersService.getById({ id: res.locals.user.id });

    return res.send(result);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    console.log(id);

    const result = await this.usersService.delete({ id });
    console.log(result);

    return result;
  }
}
