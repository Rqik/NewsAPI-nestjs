import { Injectable } from '@nestjs/common';

import { AuthorDto } from '@/controllers/authors/dto/author.dto';
import { PrismaService } from '@/database/prisma.service';
import { ApiError } from '@/exceptions';

@Injectable()
export class AuthorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ description, userId }: AuthorDto & { userId: number }) {
    const author = await this.prisma.author.upsert({
      where: { fk_user_id: userId },
      update: {
        description,
      },
      create: {
        description,
        fk_user_id: userId,
      },
    });

    return this.convertCase(author);
  }

  async update({
    id,
    description,
    userId,
  }: AuthorDto & { id: number; userId: number }) {
    const authorUser = await this.prisma.author.findFirst({
      where: {
        fk_user_id: userId,
      },
    });

    if (authorUser.author_id !== id) {
      return ApiError.UnauthorizeError();
    }

    const author = await this.prisma.author.update({
      where: { author_id: id },
      data: {
        description,
      },
    });

    return this.convertCase(author);
  }

  async getAll({ page, perPage }: { page: number; perPage: number }) {
    const [totalCount, authors] = await Promise.all([
      this.prisma.author.count(),
      this.prisma.author.findMany({ skip: page * perPage, take: perPage }),
    ]);

    return {
      authors: authors.map((author) => this.convertCase(author)),
      count: authors.length,
      totalCount,
    };
  }

  async getOne(id: number) {
    const author = await this.prisma.author.findUnique({
      where: { author_id: id },
    });
    if (!author) {
      return null;
    }

    return this.convertCase(author);
  }

  async getByUserId(userId: number) {
    const author = await this.prisma.author.findFirst({
      where: { fk_user_id: userId },
    });
    if (!author) {
      return null;
    }

    return this.convertCase(author);
  }

  async deleteUserAuthors(id: number) {
    const author = await this.prisma.author.deleteMany({
      where: {
        fk_user_id: Number(id),
      },
    });

    return author;
  }

  async delete(id: number) {
    const author = await this.prisma.author.delete({
      where: { author_id: id },
    });

    return this.convertCase(author);
  }

  // eslint-disable-next-line class-methods-use-this
  private convertCase(author) {
    return {
      id: author.author_id,
      description: author.description,
      userId: author.fk_user_id,
    };
  }
}
