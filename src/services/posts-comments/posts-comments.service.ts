import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import { CommentsService } from '../comments';

@Injectable()
export class PostsCommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commentsService: CommentsService,
  ) {}

  async create({ commentId, postId }: { commentId: number; postId: number }) {
    const connect = await this.prisma.postsOnComments.create({
      data: {
        fk_comment_id: commentId,
        fk_post_id: postId,
      },
    });

    return connect;
  }

  async getPostComments({
    id,
    page,
    perPage,
  }: {
    id: number;
    page: number;
    perPage: number;
  }) {
    const rows = await this.prisma.postsOnComments.findMany({
      where: { fk_post_id: id },
    });
    const commentIds = rows.map((el) => el.fk_comment_id);
    const { totalCount, count, comments } =
      await this.commentsService.getComments({ commentIds, page, perPage });

    return { totalCount, count, comments };
  }

  async delete({ postId, commentId }: { postId: number; commentId: number }) {
    await this.prisma.postsOnComments.delete({
      where: {
        fk_comment_id_fk_post_id: {
          fk_comment_id: commentId,
          fk_post_id: postId,
        },
      },
    });

    const comment = await this.commentsService.delete({ id: commentId });

    return comment;
  }
}
