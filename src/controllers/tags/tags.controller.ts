import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import { TagsService } from '@/services';
import { paginator } from '@/shared';

import { TagDto } from './dto/tag.dto';

@Controller('tags')
export class TagsController {
  constructor(
    private readonly tagsService: TagsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async create(@Body() body: TagDto, @Res() res: Response) {
    const tag = await this.tagsService.create(body);

    return res.status(HttpStatus.CREATED).send(tag);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: TagDto) {
    const tag = await this.tagsService.update({ ...body, id });

    return tag;
  }

  @Get()
  async getAll(
    @Res() res: Response,
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
  async getOne(@Param('id') id: number) {
    const tag = await this.tagsService.getOne({ id });

    return tag;
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    const removedTag = await this.tagsService.delete({ id });

    return removedTag;
  }
}
