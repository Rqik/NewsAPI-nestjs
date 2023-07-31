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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';

import { ApiError } from '@/exceptions';
import {
  AuthorsService,
  FileService,
  PostsDraftsService,
  PostsService,
} from '@/services';
import { paginator } from '@/shared';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostsDraftsDto } from './dto/posts-drafts.dto';

@Controller('posts')
export class PostsDraftsController {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly fileService: FileService,
    private readonly postsDraftsService: PostsDraftsService,
    private readonly postsService: PostsService,
    private readonly configService: ConfigService,
  ) {}

  @Post(':id/drafts')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainImg', maxCount: 1 },
      { name: 'otherImgs' },
    ]),
  )
  async create(
    @Param('id') postId: string,
    @Body() body: PostsDraftsDto,
    @Res() res: Response,
    @UploadedFiles()
    files: {
      mainImg?: Express.Multer.File[];
      otherImgs?: Express.Multer.File[];
    },
  ) {
    const { mainImg, otherImgs } = files || {};

    const author = await this.authorValidate(res.locals.user.id, res);
    if (!author) {
      return ApiError.AuthorNotFound();
    }

    const mainNameImg = this.fileService.savePostImage(mainImg) || [];
    if (mainNameImg instanceof ApiError) {
      throw new HttpException(mainNameImg, HttpStatus.BAD_REQUEST);
    }

    const otherNameImgs = this.fileService.savePostImage(otherImgs) || [];
    if (otherNameImgs instanceof ApiError) {
      throw new HttpException(otherNameImgs, HttpStatus.BAD_REQUEST);
    }

    const draft = await this.postsDraftsService.create({
      ...body,
      postId: Number(postId),
      authorId: author.id,
      mainImg: mainNameImg[0],
      otherImgs: otherNameImgs,
    });

    return res.status(HttpStatus.CREATED).send(draft);
  }

  @Put(':id/drafts/:did')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainImg', maxCount: 1 },
      { name: 'otherImgs' },
    ]),
  )
  async update(
    @Param('id') postId: number,
    @Param('did') draftId: number,
    @Body() body: PostsDraftsDto,
    @Req() req: Request,
    @Res() res: Response,
    @UploadedFiles()
    files: {
      mainImg?: Express.Multer.File[];
      otherImgs?: Express.Multer.File[];
    },
  ) {
    const { mainImg, otherImgs } = files || {};

    const author = await this.authorsService.getByUserId(res.locals.user.id);

    const post = await this.postsService.getOne(postId);
    if (post instanceof ApiError) {
      return post;
    }
    if (!author || !post || post.author?.id !== author.id) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    const mainNameImg = this.fileService.savePostImage(mainImg) || [];
    if (mainNameImg instanceof ApiError) {
      throw new HttpException(mainNameImg, HttpStatus.BAD_REQUEST);
    }

    const otherNameImgs = this.fileService.savePostImage(otherImgs) || [];
    if (otherNameImgs instanceof ApiError) {
      throw new HttpException(otherNameImgs, HttpStatus.BAD_REQUEST);
    }

    const result = await this.postsDraftsService.update({
      ...body,
      postId,
      draftId,
      authorId: author.id,
      mainImg: mainNameImg[0],
      otherImgs: otherNameImgs,
    });

    return result;
  }

  @Get(':id/drafts')
  async getAll(
    @Param('id') postId: number,
    @Res() res: Response,
    @Req() req: Request,
    @Query('per_page') perPage = 10,
    @Query('page') page = 0,
  ) {
    const author = await this.authorValidate(res.locals.user.id, res);
    if (!author) {
      throw new HttpException('Author not found', HttpStatus.NOT_FOUND);
    }

    const { totalCount, count, drafts } =
      await this.postsDraftsService.getDraftsPost(
        { postId, authorId: author.id },
        { page: Number(page), perPage: Number(perPage) },
      );

    const pagination = paginator({
      totalCount,
      count,
      req,
      route: `/posts/${postId}/drafts`,
      page: Number(page),
      perPage: Number(perPage),
      apiUrl: this.configService.get<string>('API_URL'),
    });

    return { ...pagination, drafts };
  }

  @Get(':id/drafts/:did')
  async getOne(
    @Param('id') postId: number,
    @Param('did') draftId: number,
    @Res() res: Response,
  ) {
    const author = await this.authorValidate(res.locals.user.id, res);
    if (!author) {
      throw new HttpException('Author not found', HttpStatus.NOT_FOUND);
    }

    const result = await this.postsDraftsService.getOne({
      postId,
      draftId,
      // authorId: author.id,
    });

    return result;
  }

  @Delete(':id/drafts/:did')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') postId: number,
    @Param('did') draftId: number,
    @Res() res: Response,
  ) {
    await this.authorValidate(res.locals.user.id, res);
    const result = await this.postsDraftsService.delete({
      postId,
      draftId,
    });

    return result;
  }

  @Post(':id/drafts/:did/publish')
  @UseGuards(JwtAuthGuard)
  async publish(
    @Param('id') postId: number,
    @Param('did') draftId: number,
    @Res() res: Response,
  ) {
    const author = await this.authorValidate(res.locals.user.id, res);
    if (!author) {
      throw new HttpException('Author not found', HttpStatus.NOT_FOUND);
    }

    const result = await this.postsDraftsService.publish({
      postId,
      draftId,
    });

    return result;
  }

  private async authorValidate(userId: number, res: Response) {
    if (res.locals.user.id !== userId) {
      return null;
    }

    const author = await this.authorsService.getByUserId(userId);

    if (author instanceof ApiError || author === null) {
      return null;
    }

    return author;
  }
}
