import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { ApiError } from '@/exceptions';
import { AuthorsService } from '@/services/authors/authors.service';
import { paginator } from '@/shared';

import { AuthorDto } from './dto/author.dto';

@Controller('authors')
export class AuthorsController {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async create(@Body() body: AuthorDto) {
    const result = await this.authorsService.create(body);

    return result;
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: AuthorDto) {
    const result = await this.authorsService.update({ ...body, id });

    return result;
  }

  @Get()
  async getAll(
    @Res() req: Request,
    @Query('per_page') perPage = '10',
    @Query('page') page = '0',
  ) {
    const { totalCount, count, authors } = await this.authorsService.getAll({
      page: Number(page),
      perPage: Number(perPage),
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
  async getOne(@Param('id') id: number) {
    const result = await this.authorsService.getOne(id);

    if (!result) {
      return ApiError.AuthorNotFound();
    }

    return result;
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    const result = await this.authorsService.delete(id);

    if (!result) {
      return ApiError.AuthorNotFound();
    }

    return result;
  }
}
