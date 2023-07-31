import { Injectable } from '@nestjs/common';

import { CategoryDto } from '@/controllers/categories/dto/category.dto';
import { PrismaService } from '@/database/prisma.service';
import { IdDto } from '@/dtos/id.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ description, category }: CategoryDto) {
    const newCategory = await this.prisma.category.create({
      data: {
        description,
        fk_category_id: category,
      },
    });

    return this.convertCase(newCategory);
  }

  async update({ id, description, category }: IdDto & CategoryDto) {
    const data = await this.prisma.category.update({
      where: {
        category_id: id,
      },
      data: {
        description,
        fk_category_id: category,
      },
    });

    return this.convertCase(data);
  }

  async getAll({ page, perPage }: { page: number; perPage: number }) {
    const [totalCount, categories] = await Promise.all([
      this.prisma.category.count(),
      this.prisma.category.findMany({
        skip: page * perPage,
        take: perPage,
      }),
    ]);

    return {
      totalCount,
      count: categories.length,
      categories: categories.map((category) => this.convertCase(category)),
    };
  }

  async getOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { category_id: id },
    });

    return category ? this.convertCase(category) : category;
  }

  async delete(id: number) {
    // TODO:проверить data !== null
    const data = await this.prisma.category.delete({
      where: {
        category_id: id,
      },
    });

    return this.convertCase(data);
  }

  // eslint-disable-next-line class-methods-use-this
  private convertCase(category: any) {
    return {
      id: category.category_id,
      description: category.description,
      fkCategoryId: category.fk_category_id,
    };
  }
}
