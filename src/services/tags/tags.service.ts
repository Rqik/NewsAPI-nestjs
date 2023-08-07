import { Injectable } from '@nestjs/common';
import { Tag } from '@prisma/client';

import { TagDto } from '@/controllers/tags/dto/tag.dto';
import { PrismaService } from '@/database/prisma.service';
import { IdDto } from '@/dtos/id.dto';
import { ApiError } from '@/exceptions';

@Injectable()
export class TagsService {
  constructor(private prismaService: PrismaService) {}

  async create({ title }: TagDto) {
    const tag = await this.prismaService.tag.create({
      data: {
        title,
      },
    });

    return this.convertCase(tag);
  }

  async update({ id, title }: IdDto & TagDto) {
    const tag = await this.prismaService.tag.update({
      where: {
        tag_id: Number(id),
      },
      data: {
        title,
      },
    });

    return this.convertCase(tag);
  }

  async getAll({ page, perPage }: { page: number; perPage: number }) {
    const [totalCount, data] = await this.prismaService.$transaction([
      this.prismaService.tag.count(),
      this.prismaService.tag.findMany({
        skip: page * perPage,
        take: perPage,
      }),
    ]);

    const tags = data.map((tag) => this.convertCase(tag));

    return {
      totalCount,
      count: data.length,
      tags,
    };
  }

  async getTags({ tIds }: { tIds: number[] }) {
    const tags = await this.prismaService.tag.findMany({
      where: {
        tag_id: { in: tIds },
      },
    });

    return tags.map((tag) => this.convertCase(tag));
  }

  async getOne(id: number) {
    const tag = await this.prismaService.tag.findUnique({
      where: {
        tag_id: Number(id),
      },
    });
    if (tag === null) {
      return ApiError.TagNotFound();
    }

    return this.convertCase(tag);
  }

  async delete(id: number) {
    const tag = await this.prismaService.tag.delete({
      where: {
        tag_id: Number(id),
      },
    });

    return this.convertCase(tag);
  }

  // eslint-disable-next-line class-methods-use-this
  convertCase(tag: Tag): IdDto & TagDto {
    return {
      id: tag.tag_id,
      title: tag.title,
    };
  }
}
