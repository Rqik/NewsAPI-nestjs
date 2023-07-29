import { Injectable } from '@nestjs/common';
import { Draft } from '@prisma/client';

import { PrismaService } from '@/database/prisma.service';
import { IdDto } from '@/dtos/id.dto';
import { ApiError } from '@/exceptions';

import { DraftDto } from './dto/draft.dto';

export interface DraftConverted {
  id: number;
  createdAt: Date;
  updatedAt: Date | null;
  authorId: number | null;
  body: string | null;
  title: string | null;
  categoryId: number | null;
  mainImg: string | null;
  otherImgs: string[];
}
@Injectable()
export class DraftsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(draftDto: DraftDto): Promise<DraftConverted> {
    const { authorId, body, title, categoryId, mainImg, otherImgs } = draftDto;
    const draft = await this.prisma.draft.create({
      data: {
        fk_author_id: authorId,
        body,
        title,
        fk_category_id: categoryId,
        main_img: mainImg,
        other_imgs: otherImgs,
      },
    });

    return this.convertCase(draft);
  }

  async update(draftDto: DraftDto): Promise<DraftConverted> {
    const { id, authorId, body, title, categoryId, mainImg, otherImgs } =
      draftDto;
    const draft = await this.prisma.draft.update({
      where: { draft_id: id },
      data: {
        fk_author_id: authorId,
        body,
        title,
        fk_category_id: categoryId,
        main_img: mainImg,
        other_imgs: otherImgs,
      },
    });

    return this.convertCase(draft);
  }

  async getOne({ id }: IdDto): Promise<DraftConverted | null> {
    const draft = await this.prisma.draft.findUnique({
      where: { draft_id: id },
    });

    return draft ? this.convertCase(draft) : draft;
  }

  async getDrafts(
    { dIds, authorId }: { dIds: number[]; authorId: number },
    { page, perPage }: { page: number; perPage: number },
  ): Promise<{ totalCount: number; count: number; drafts: DraftConverted[] }> {
    const [totalCount, data] = await this.prisma.$transaction([
      this.prisma.draft.count({
        where: {
          draft_id: { in: dIds },
          fk_author_id: authorId,
        },
      }),
      this.prisma.draft.findMany({
        where: {
          draft_id: { in: dIds },
          fk_author_id: authorId,
        },
        skip: page * perPage,
        take: perPage,
      }),
    ]);

    const drafts = data.map((draft) => this.convertCase(draft));

    return { totalCount, count: data.length, drafts };
  }

  async delete({ id }: IdDto): Promise<DraftConverted | ApiError> {
    const selectData = await this.prisma.draft.findUnique({
      where: { draft_id: id },
    });

    if (selectData === null) {
      return ApiError.DraftNotFound();
    }

    await this.prisma.postsOnDrafts.deleteMany({
      where: {
        fk_draft_id: id,
      },
    });

    const draft = await this.prisma.draft.delete({
      where: {
        draft_id: id,
      },
    });

    return this.convertCase(draft);
  }

  // eslint-disable-next-line class-methods-use-this
  private convertCase(draft: Draft): DraftConverted {
    return {
      id: draft.draft_id,
      createdAt: draft.created_at,
      updatedAt: draft.updated_at,
      authorId: draft.fk_author_id,
      body: draft.body,
      title: draft.title,
      mainImg: draft.main_img,
      otherImgs: draft.other_imgs,
      categoryId: draft.fk_category_id,
    };
  }
}
