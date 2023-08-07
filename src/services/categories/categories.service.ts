import { Injectable } from '@nestjs/common';

import { CategoryDto } from '@/controllers/categories/dto/category.dto';
import { PrismaService } from '@/database/prisma.service';
import { IdDto } from '@/dtos/id.dto';
import { ApiError } from '@/exceptions';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create({ description, category }: CategoryDto) {
    if (typeof category !== 'undefined') {
      const parentCategory = await this.prisma.category.findFirst({
        where: {
          category_id: category,
        },
      });
      if (!parentCategory) {
        return ApiError.CategoryNotFound();
      }
    }
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
      include: {
        categories: this.recursive(10),
      },
    });

    return category ? this.convertCaseRecursive(category) : category;
  }

  async delete(id: number) {
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
      parentCategoryId: category.fk_category_id,
    };
  }

  private convertCaseRecursive(category: any) {
    const parent = category.categories;

    if (typeof parent === 'object' && parent !== null)
      return [
        {
          id: category.category_id,
          description: category.description,
          parentCategoryId: category.fk_category_id,
        },
        ...this.convertCaseRecursive(parent),
      ];

    return [
      {
        id: category.category_id,
        description: category.description,
        parentCategoryId: category.fk_category_id,
      },
    ];
  }

  private recursive(level: number) {
    if (level === 0) {
      return {
        include: {
          categories: true,
        },
      };
    }

    return {
      include: {
        categories: this.recursive(level - 1),
      },
    };
  }
}
