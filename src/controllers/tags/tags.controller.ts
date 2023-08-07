import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
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

import { TagsService } from '@/services';
import { paginator } from '@/shared';

import { JwtAdminGuard } from '../auth/jwt-admin.guard';
import { TagDto } from './dto/tag.dto';

@Controller('tags')
export class TagsController {
  constructor(
    private readonly tagsService: TagsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(JwtAdminGuard)
  async create(@Body() body: TagDto, @Res() res: Response) {
    const tag = await this.tagsService.create(body);

    return res.status(HttpStatus.CREATED).send(tag);
  }

  @Put(':id')
  @UseGuards(JwtAdminGuard)
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: TagDto) {
    return this.tagsService.update({ ...body, id });
  }

  @Get()
  async getAll(
    @Req() req: Request,
    @Query('per_page') perPage = 10,
    @Query('page') page = 0,
  ) {
    const { totalCount, tags, count } = await this.tagsService.getAll({
      page: Number(page),
      perPage: Number(perPage),
    });

    const pagination = paginator({
      totalCount,
      count,
      req,
      route: '/tags',
      page: Number(page),
      perPage: Number(perPage),
      apiUrl: this.configService.get<string>('API_URL'),
    });

    return { ...pagination, data: tags };
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.getOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAdminGuard)
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.delete(id);
  }
}
