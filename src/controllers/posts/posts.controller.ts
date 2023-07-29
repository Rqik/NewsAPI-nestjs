import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

import { ApiError } from '@/exceptions';
import { AuthorsService, FileService, PostsService } from '@/services';
import { paginator } from '@/shared';

import { PostDto } from './dto/post.dto';
import { UpdatePostDto } from './dto/updatePost.dto';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly authorsService: AuthorsService,
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainImg', maxCount: 1 },
      { name: 'otherImgs' },
    ]),
  )
  async create(
    @Body() body: PostDto,
    @UploadedFiles()
    files: {
      mainImg?: Express.Multer.File[];
      otherImgs?: Express.Multer.File[];
    },
  ) {
    const { mainImg, otherImgs } = files || {};

    const mainNameImg = this.fileService.savePostImage(mainImg) || [];
    if (mainNameImg instanceof ApiError) {
      throw mainNameImg;
    }
    const otherNameImgs = this.fileService.savePostImage(otherImgs) || [];
    if (otherNameImgs instanceof ApiError) {
      throw mainNameImg;
    }

    const author = await this.authorsService.getByUserId({
      id: res.locals.user.id,
    });
    if (author instanceof ApiError) {
      throw author;
    }
    if (author === null || Number(body.authorId) !== author.id) {
      return ApiError.BadRequest('Not valid author id');
    }

    const post = await this.postsService.create({
      ...body,
      mainImg: mainNameImg[0],
      otherImgs: otherNameImgs,
    });

    return post;
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainImg', maxCount: 1 },
      { name: 'otherImgs' },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() body: PostDto,
    @UploadedFiles()
    files: {
      mainImg?: Express.Multer.File[];
      otherImgs?: Express.Multer.File[];
    },
  ) {
    const mainNameImg = this.fileService.savePostImage(mainImg) || [];
    if (mainNameImg instanceof ApiError) {
      throw mainNameImg;
    }
    const otherNameImgs = this.fileService.savePostImage(otherImgs) || [];
    if (otherNameImgs instanceof ApiError) {
      throw otherNameImgs;
    }

    const post = await this.postsService.update({
      ...body,
      id: Number(id),
      mainImg: mainNameImg[0],
      otherImgs: otherNameImgs,
    });

    return post;
  }

  @Patch(':id')
  async partialUpdate(@Param('id') id: string, @Body() body: UpdatePostDto) {
    const post = await this.postsService.partialUpdate({ ...body, id });

    return post;
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
      req, // Необходимо передать объект запроса для пагинации
      route: '/posts',
      page: Number(page),
      perPage: Number(perPage),
      apiUrl: this.configService.get<string>('YOUR_API_URL'), // Получение значения из ConfigService
    });

    return { ...pagination, data: posts };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const post = await this.postsService.getOne({ id });

    return post;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const post = await this.postsService.delete({ id });

    return post;
  }
}
