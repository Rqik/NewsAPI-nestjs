import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import ms from 'ms';

import { ApiError } from '@/exceptions';
import { FileService, TokensService, UsersService } from '@/services';
import { getAuthorizationToken, paginator } from '@/shared';

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
  ) {
    const { firstName, lastName, login, password, email } = body;

    const avatarName = this.fileService.saveAvatar(avatar);

    if (avatarName instanceof ApiError) {
      throw new HttpException(avatar, HttpStatus.BAD_REQUEST);
    }

    const userData = await this.usersService.registration({
      password,
      login,
      avatar: avatarName,
      lastName,
      firstName,
      email,
    });

    if (userData instanceof ApiError) {
      return userData;
    }
    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: ms(this.configService.get('jwtRefreshExpireIn') as string),
      httpOnly: true,
    });

    return res.status(HttpStatus.CREATED).send({ result: userData });
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: UserDto) {
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
    if (result === null) {
      throw new HttpException(
        `User ${login} not found`,
        HttpStatus.BAD_REQUEST,
      );
    } else {
      return result;
    }
  }

  @Get('current')
  async getCurrentAuth(@Req() req: Request) {
    const accessToken = getAuthorizationToken(req);
    const tokenData = this.tokensService.validateAccess(accessToken);

    if (tokenData === null || typeof tokenData === 'string') {
      throw new HttpException(
        'Invalid Authorization token',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { id } = tokenData as JwtPayload;
    const result = await this.usersService.getById({ id });

    if (result === null) {
      throw new HttpException(`User ${id} not found`, HttpStatus.BAD_REQUEST);
    } else {
      return result;
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    const result = await this.usersService.delete({ id });

    return result;
  }
}
