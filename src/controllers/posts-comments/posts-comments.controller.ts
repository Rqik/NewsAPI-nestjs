import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import {
  CommentsService,
  PostsCommentsService,
  TokensService,
} from '@/services';
import { paginator } from '@/shared';

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
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Param('id') postId: string,
    @Body() body: PostsCommentsDto,
    @Res() res: Response,
  ) {
    const accessToken = getAuthorizationToken(req);

    const tokenData = this.tokensService.validateAccess(accessToken);

    if (!tokenData || typeof tokenData === 'string') {
      throw new ApiError.BadRequest('Invalid Authorization token');
    }
    const { id: userId } = tokenData;
    const comment = await this.commentsService.create({
      userId,
      ...body,
    });
    await this.postsCommentsService.create({
      postId: Number(postId),
      commentId: comment.id,
    });

    return res.status(HttpStatus.CREATED).send(comment);
  }

  @Get(':id/comments')
  async getCommentsPost(
    @Param('id') postId: string,
    @Req() req: Request,
    @Query('per_page') perPage = 10,
    @Query('page') page = 0,
  ) {
    const { totalCount, count, comments } =
      await this.postsCommentsService.getPostComments(
        { id: postId },
        {
          page: Number(page),
          perPage: Number(perPage),
        },
      );

    const pagination = paginator({
      totalCount,
      count,
      req,
      route: `/posts/${postId}/comments`,
      page: Number(page),
      perPage: Number(perPage),
      apiUrl: this.configService.get('apiUrl'),
    });

    return { ...pagination, comments };
  }

  @Delete(':id/comments/:cid')
  @UseGuards(AuthGuard('jwt'))
  async delete(@Param('id') postId: string, @Param('cid') commentId: string) {
    const comment = await this.postsCommentsService.delete({
      postId: Number(postId),
      commentId: Number(commentId),
    });

    return comment;
  }
}
