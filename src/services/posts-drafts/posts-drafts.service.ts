import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';
import { ApiError } from '@/exceptions';

import { DraftsService } from '../drafts';
import { PostsService } from '../posts';

const tableName = 'posts_drafts';

@Injectable()
export class PostsDraftsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly draftsService: DraftsService,
    private readonly postsService: PostsService,
  ) {}

  async create({
    postId,
    authorId,
    body,
    title,
    categoryId,
    mainImg,
    otherImgs = [],
  }: {
    postId: number;
    authorId: number;
    body: string;
    title: string;
    categoryId: number;
    mainImg: string;
    otherImgs: string[];
  }) {
    const draft = await this.draftsService.create({
      body,
      authorId,
      title,
      categoryId,
      mainImg,
      otherImgs,
    });

    await this.prisma.postsOnDrafts.create({
      data: {
        fk_draft_id: draft.id,
        fk_post_id: postId,
      },
    });

    return draft;
  }

  async getDraftsPost(
    { postId, authorId }: { postId: number; authorId: number },
    { page, perPage }: { page: number; perPage: number },
  ) {
    const rows = await this.prisma.postsOnDrafts.findMany({
      where: {
        fk_post_id: postId,
      },
    });
    const dIds = rows.map((el) => el.fk_draft_id);
    const { totalCount, count, drafts } = await this.draftsService.getDrafts(
      { dIds, authorId },
      { page, perPage },
    );

    return { totalCount, count, drafts };
  }

  async delete({ postId, draftId }: { postId: number; draftId: number }) {
    const queryPostTags = `DELETE
                           FROM post_${tableName}
                           WHERE fk_post_id = $1 AND fk_draft_id = $2`;
    const isBelongs = await this.checkPostBelongsDraft({ postId, draftId });

    if (isBelongs) {
      // await db.query(queryPostTags, [postId, draftId]);
      // const removedDraft = await this.draftsService.delete({ id: draftId });
      // return removedDraft;
    }

    return ApiError.BadRequest('Tag not found');
  }

  async update({
    postId,
    draftId,
    body,
    authorId,
    title,
    categoryId,
    mainImg,
    otherImgs = [],
  }: {
    postId: number;
    draftId: number;
    authorId: number;
    body: string;
    title: string;
    categoryId: number;
    mainImg: string;
    otherImgs: string[];
  }) {
    const isBelongs = await this.checkPostBelongsDraft({ postId, draftId });

    if (isBelongs) {
      const draft = await this.draftsService.update({
        id: draftId,
        body,
        authorId,
        title,
        categoryId,
        mainImg,
        otherImgs,
      });

      return draft;
    }

    return ApiError.BadRequest('Not found drafts');
  }

  async getOne({ postId, draftId }: { postId: number; draftId: number }) {
    const isBelongs = await this.checkPostBelongsDraft({ postId, draftId });

    if (isBelongs) {
      const draft = await this.draftsService.getOne(draftId);

      return draft;
    }

    return ApiError.BadRequest('Not found drafts');
  }

  async publish({ postId, draftId }: { postId: number; draftId: number }) {
    const isBelongs = await this.checkPostBelongsDraft({ postId, draftId });

    if (!isBelongs) {
      return ApiError.BadRequest('Not found drafts');
    }
    const draft = await this.draftsService.getOne(draftId);

    if (draft === null) {
      return ApiError.BadRequest('Not found drafts');
    }

    await this.postsService.update({ ...draft, id: postId });

    return draft;
  }

  private async checkPostBelongsDraft({
    postId,
    draftId,
  }: {
    postId: number;
    draftId: number;
  }) {
    const data = await this.prisma.postsOnDrafts.findMany({
      where: {
        fk_draft_id: draftId,
        fk_post_id: postId,
      },
    });

    return data.length > 0;
  }
}
