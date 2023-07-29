import { Injectable } from '@nestjs/common';
import { Comment } from '@prisma/client';

import { PrismaService } from '@/database/prisma.service';
import { IdDto } from '@/dtos/id.dto';

import { CommentDto } from './dto/comment.dto';

export interface CommentConverted {
  id: number;
  userId: number;
  createdAt: Date;
  body: string;
}
@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(commentDto: CommentDto): Promise<CommentConverted> {
    const { userId, body } = commentDto;
    const comment = await this.prisma.comment.create({
      data: {
        fk_user_id: userId,
        body,
      },
    });

    return this.convertCase(comment);
  }

  async getComments(
    commentIds: number[],
    page: number,
    perPage: number,
  ): Promise<{
    totalCount: number;
    count: number;
    comments: CommentConverted[];
  }> {
    const [totalCount, data] = await this.prisma.$transaction([
      this.prisma.comment.count({
        where: {
          comment_id: { in: commentIds },
        },
      }),
      this.prisma.comment.findMany({
        where: {
          comment_id: { in: commentIds },
        },
        skip: page * perPage,
        take: perPage,
      }),
    ]);

    const comments = data.map((comment) => this.convertCase(comment));

    return { totalCount, count: data.length, comments };
  }

  async delete({ id }: IdDto): Promise<CommentConverted> {
    const comment = await this.prisma.comment.delete({
      where: {
        comment_id: id,
      },
    });

    return this.convertCase(comment);
  }

  // eslint-disable-next-line class-methods-use-this
  private convertCase(comment: Comment): CommentConverted {
    return {
      id: comment.comment_id,
      userId: comment.fk_user_id,
      createdAt: comment.created_at,
      body: comment.body,
    };
  }
}
