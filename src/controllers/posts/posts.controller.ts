import {
  Body,
  Controller,
  Delete,
  Get,
  Next,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { NextFunction, Request, Response } from 'express';

import { ApiError } from '@/exceptions';
import { AuthorsService, FileService, PostsService } from '@/services';
import { HttpStatuses, isError, paginator } from '@/shared';

import { JwtAdminGuard } from '../auth/jwt-admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostDto } from './dto/post.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly authorsService: AuthorsService,
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainImg', maxCount: 1 },
      { name: 'otherImgs' },
    ]),
  )
  async create(
    @Body() body: PostDto,
    @Res() res: Response,
    @Next() next: NextFunction,
    @UploadedFiles()
    files: {
      mainImg?: Express.Multer.File[];
      otherImgs?: Express.Multer.File[];
    },
  ) {
    const { mainImg, otherImgs } = files || {};

    const mainNameImg = this.fileService.savePostImage(mainImg) || [];
    if (isError(mainNameImg)) return next(mainNameImg);

    const otherNameImgs = this.fileService.savePostImage(otherImgs) || [];
    if (isError(otherNameImgs)) return next(otherNameImgs);

    const author = await this.authorsService.getByUserId(res.locals.user.id);
    if (isError(author)) return next(author);

    if (author === null || Number(body.authorId) !== author.id)
      return next(ApiError.UnauthorizeError());

    const post = await this.postsService.create({
      ...body,
      mainImg: mainNameImg[0],
      otherImgs: otherNameImgs,
    });

    return res.status(HttpStatuses.CREATED_201).send(post);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainImg', maxCount: 1 },
      { name: 'otherImgs' },
    ]),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: PostDto,
    @Next() next: NextFunction,
    @Res() res: Response,
    @UploadedFiles()
    files: {
      mainImg?: Express.Multer.File[];
      otherImgs?: Express.Multer.File[];
    },
  ) {
    const { mainImg, otherImgs } = files;
    const mainNameImg = this.fileService.savePostImage(mainImg) || [];
    if (isError(mainNameImg)) return next(mainNameImg);

    const otherNameImgs = this.fileService.savePostImage(otherImgs) || [];
    if (isError(otherNameImgs)) return next(otherNameImgs);

    const author = await this.authorsService.getByUserId(res.locals.user.id);
    if (isError(author)) return next(author);

    if (author === null || Number(body.authorId) !== author.id)
      return next(ApiError.UnauthorizeError());

    const post = await this.postsService.update({
      ...body,
      id,
      mainImg: mainNameImg[0],
      otherImgs: otherNameImgs,
    });

    return res.status(HttpStatuses.OK_200).send(post);
  }

  @Get()
  async getAll(
    @Query()
    query: {
      created_at?: string;
      created_at__lt?: string;
      created_at__gt?: string;
      category?: string;
      title?: string;
      body?: string;
      categories__in?: string;
      categories__all?: string;
      tag?: string;
      tags__in?: string;
      tags__all?: string;
      page?: string;
      per_page?: string;
    },
    @Req() req: Request,
  ) {
    const { per_page: perPage = 10, page = 0 } = query;

    const { totalCount, count, posts } = await this.postsService.getAll(query, {
      page: Number(page),
      perPage: Number(perPage),
    });

    const pagination = paginator({
      totalCount,
      count,
      req,
      route: '/posts',
      page: Number(page),
      perPage: Number(perPage),
      apiUrl: this.configService.get<string>('YOUR_API_URL'), // Получение значения из ConfigService
    });

    return { ...pagination, data: posts };
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const post = await this.postsService.getOne(id);

    return post;
  }

  @Delete(':id')
  @UseGuards(JwtAdminGuard)
  async delete(@Param('id', ParseIntPipe) id: number) {
    const post = await this.postsService.delete(id);

    return post;
  }
}
