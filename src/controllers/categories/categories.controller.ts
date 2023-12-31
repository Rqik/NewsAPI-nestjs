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
import { Request } from 'express';

import { ApiError } from '@/exceptions';
import { CategoriesService } from '@/services/categories/categories.service';
import { paginator } from '@/shared';

import { JwtAdminGuard } from '../auth/jwt-admin.guard';
import { CategoryDto } from './dto/category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(JwtAdminGuard)
  async create(@Body() body: CategoryDto) {
    return this.categoriesService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAdminGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CategoryDto,
  ) {
    const categoryUpdated = await this.categoriesService.update({
      id,
      ...body,
    });

    return categoryUpdated;
  }

  @Get()
  async getAll(
    @Req() req: Request,
    @Query('per_page') perPage = '10',
    @Query('page') page = '0',
  ) {
    const { totalCount, count, categories } =
      await this.categoriesService.getAll({
        page: Number(page),
        perPage: Number(perPage),
      });

    const pagination = paginator({
      totalCount,
      count,
      req,
      route: '/categories',
      page: Number(page),
      perPage: Number(perPage),
      apiUrl: this.configService.get<string>('API_URL'),
    });

    return { ...pagination, data: categories };
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const category = await this.categoriesService.getOne(id);

    if (!category) {
      return ApiError.CategoryNotFound();
    }

    return category;
  }

  @Delete(':id')
  @UseGuards(JwtAdminGuard)
  async delete(@Param('id', ParseIntPipe) id: number) {
    const category = await this.categoriesService.delete(id);

    if (!category) {
      return ApiError.CategoryNotFound();
    }

    return category;
  }
}
