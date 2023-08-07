import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';
import { ApiError } from '@/exceptions';

import { TagsService } from '../tags';

@Injectable()
export class PostsTagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tagsService: TagsService,
  ) {}

  async create({ postId, tagId }: { postId: number; tagId: number }) {
    await this.prisma.postsOnTags.create({
      data: {
        fk_post_id: postId,
        fk_tag_id: tagId,
      },
    });
  }

  async getPostTags(id: number) {
    const rows = await this.prisma.postsOnTags.findMany({
      where: {
        fk_post_id: id,
      },
    });

    const tIds = rows.map((el) => el.fk_tag_id);

    const tags = await this.tagsService.getTags({ tIds });

    return tags;
  }

  async getPostFilteredTags(id: number) {
    const data = await this.prisma.postsOnTags.findMany({
      where: { fk_post_id: id },
    });

    const tIds = data.map((el) => el.fk_tag_id);

    const tags = await this.tagsService.getTags({ tIds });

    return tags;
  }

  async delete({ postId, tagId }: { postId: number; tagId: number }) {
    const isBelongs = await this.checkPostBelongsTags({ postId, tagId });

    if (isBelongs) {
      const data = await this.prisma.postsOnTags.delete({
        where: {
          fk_post_id_fk_tag_id: {
            fk_post_id: postId,
            fk_tag_id: tagId,
          },
        },
      });

      return data;
    }

    return ApiError.TagNotFound();
  }

  private async checkPostBelongsTags({
    postId,
    tagId,
  }: {
    postId: number;
    tagId: number;
  }) {
    const data = await this.prisma.postsOnTags.findMany({
      where: {
        fk_post_id: postId,
        fk_tag_id: tagId,
      },
    });

    return data.length > 0;
  }
}
