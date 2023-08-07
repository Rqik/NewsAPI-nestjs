import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import { ApiError } from '@/exceptions';
import { TokensService } from '@/services';
import { AuthorsService } from '@/services/authors/authors.service';
import { getAuthorizationToken, paginator } from '@/shared';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthorDto } from './dto/author.dto';

@Controller('authors')
export class AuthorsController {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly configService: ConfigService,
    private readonly tokensService: TokensService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: AuthorDto, @Res() res: Response) {
    const result = await this.authorsService.create({
      ...body,
      userId: res.locals.user.id,
    });

    return result;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AuthorDto,
    @Res() res: Response,
  ) {
    return this.authorsService.update({
      ...body,
      id,
      userId: res.locals.user.id,
    });
  }

  @Get()
  async getAll(
    @Req() req: Request,
    @Query('per_page') perPage = 10,
    @Query('page') page = 0,
  ) {
    const { totalCount, count, authors } = await this.authorsService.getAll({
      page,
      perPage,
    });

    const pagination = paginator({
      totalCount,
      count,
      req,
      route: '/authors',
      page: Number(page),
      perPage: Number(perPage),
      apiUrl: this.configService.get<string>('API_URL'),
    });

    return { ...pagination, data: authors };
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.authorsService.getOne(id);

    if (!result) {
      return ApiError.AuthorNotFound();
    }

    return result;
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    const result = await this.authorsService.delete(id);

    if (!result) {
      return ApiError.AuthorNotFound();
    }

    return result;
  }
}
