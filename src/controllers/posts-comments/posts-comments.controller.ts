import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import { ApiError } from '@/exceptions';
import {
  CommentsService,
  PostsCommentsService,
  TokensService,
} from '@/services';
import { getAuthorizationToken, paginator } from '@/shared';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PostsCommentsDto } from './dto/posts-comments.dto';

@Controller('posts')
export class PostsCommentsController {
  constructor(
    private readonly postsCommentsService: PostsCommentsService,
    private readonly commentsService: CommentsService,
    private readonly tokensService: TokensService,
    private readonly configService: ConfigService,
  ) {}

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('id', ParseIntPipe) postId: number,
    @Body() body: PostsCommentsDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const accessToken = getAuthorizationToken(req);

    const tokenData = this.tokensService.validateAccess(accessToken);

    if (!tokenData || typeof tokenData === 'string') {
      return ApiError.BadRequest('Invalid Authorization token');
    }
    const { id: userId } = tokenData;
    const comment = await this.commentsService.create({
      userId,
      ...body,
    });
    await this.postsCommentsService.create({
      postId,
      commentId: comment.id,
    });

    return res.status(HttpStatus.CREATED).send(comment);
  }

  @Get(':id/comments')
  async getCommentsPost(
    @Param('id', ParseIntPipe) postId: number,
    @Req() req: Request,
    @Query('per_page') perPage = 10,
    @Query('page') page = 0,
  ) {
    const { totalCount, count, comments } =
      await this.postsCommentsService.getPostComments({
        id: postId,
        page: Number(page),
        perPage: Number(perPage),
      });

    const pagination = paginator({
      totalCount,
      count,
      req,
      route: `/posts/${postId}/comments`,
      page: Number(page),
      perPage: Number(perPage),
      apiUrl: this.configService.get<string>('API_URL'),
    });

    return { ...pagination, comments };
  }

  @Delete(':id/comments/:cid')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id', ParseIntPipe) postId: string,
    @Param('cid', ParseIntPipe) commentId: number,
  ) {
    const comment = await this.postsCommentsService.delete({
      postId: Number(postId),
      commentId: Number(commentId),
    });

    return comment;
  }
}
