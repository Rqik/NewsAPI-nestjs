import { Injectable } from '@nestjs/common';
import { Comment, Post, Tag } from '@prisma/client';
import { log } from 'console';

import { UpdatePostDto } from '@/controllers/posts/dto/updatePost.dto';
import { PrismaService } from '@/database/prisma.service';
import { IdDto } from '@/dtos/id.dto';
import { ApiError } from '@/exceptions';

import { CategoriesService } from '../categories';
import { CommentsService } from '../comments';
import { PostsCommentsService } from '../posts-comments';
import { PostsTagsService } from '../posts-tags';
import { TagsService } from '../tags';

const tableName = 'posts';

type PostRow = {
  post_id: number;
  title: string;
  created_at: Date;
  updated_at: Date;
  fk_author_id: number;
  fk_category_id: number;
  body: string;
  main_img: string;
  other_imgs: string[];
};

type PostRowSimple = PostRow & {
  root_category: string;
  author_id: number;
  author_description: string;
  arr_categories: string[];
  arr_category_id: number[];
  user_id: number;
  first_name: string;
  last_name: string;
  avatar: string;
  login: string;
  admin: boolean;
};

type PostFullRow = PostRowSimple & {
  tags: Tag[];
  comments: Comment[];
  total_count?: number;
};

type PostProp = {
  title: string;
  authorId: number;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
  body: string;
  mainImg: string;
  otherImgs: string[];
  tags: number[] | string;
};

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commentsService: CommentsService,
    private readonly categoriesService: CategoriesService,
    private readonly tagsService: TagsService,
    private readonly postsCommentsService: PostsCommentsService,
    private readonly postsTagsService: PostsTagsService,
  ) {}

  async create({
    title,
    authorId,
    categoryId,
    body,
    mainImg,
    otherImgs = [],
    tags = [],
  }: Omit<PostProp, 'createdAt' | 'updatedAt'>) {
    const data = await this.prisma.post.create({
      data: {
        title,
        fk_author_id: Number(authorId),
        fk_category_id: Number(categoryId) || null,
        body,
        main_img: mainImg,
        other_imgs: otherImgs,
        is_published: false,
      },
    });

    const { post_id: postId } = data;
    const tagsParse: number[] = Array.isArray(tags) ? tags : JSON.parse(tags);
    await Promise.all(
      tagsParse.map((tagId) => this.postsTagsService.create({ postId, tagId })),
    );

    return {
      ...this.convertCase(data),
      id: postId,
      tags,
    };
  }

  async update({
    id,
    title,
    authorId,
    categoryId,
    body,
    mainImg,
    otherImgs = [],
  }: {
    id: number;
    authorId: number | null;
    body: string | null;
    title: string | null;
    categoryId: number | null;
    mainImg: string | null;
    otherImgs: string[];
  }) {
    const data = await this.prisma.post.update({
      where: { post_id: id },
      data: {
        title,
        fk_author_id: Number(authorId),
        fk_category_id: Number(categoryId) || null,
        body,
        main_img: mainImg,
        other_imgs: otherImgs,
      },
    });

    return this.convertCase(data);
  }

  async getAll(
    query: {
      created_at?: string;
      created_at__lt?: string;
      created_at__gt?: string;
      category?: string;
      title?: string;
      body?: string;
      categories__in?: string;
      categories__all?: string;
      tag?: string;
      tags__in?: string;
      tags__all?: string;
      sort?: string;
    },
    pagination: { page: number; perPage: number },
  ) {
    const { perPage = 10, page = 0 } = pagination;

    const rows = await this.prisma.$queryRaw<PostFullRow[]>`
    SELECT p.*,
           array_agg(t.tag_id ORDER BY t.tag_id) tag_ids,
           c.category root_category,
           c.arr_categories,
           c.arr_category_id,
           a.author_id,
           a.description author_description,
           u.user_id,
           u.first_name,
           u.last_name,
           u.avatar,
           u.login,
           u.admin
    FROM ${tableName} p
    LEFT JOIN authors a ON a.author_id = p.fk_author_id
    LEFT JOIN users u ON u.user_id = a.fk_user_id
    LEFT JOIN catR c ON c.id = p.fk_category_id
    LEFT JOIN posts_tags pt ON pt.fk_post_id = p.post_id
    LEFT JOIN tags t ON t.tag_id = pt.fk_tag_id

    LIMIT ${perPage}
    OFFSET ${page * perPage}
  `;
    //    // ${this.buildWhereClause(query)}
    // GROUP BY p.post_id, a.author_id, u.user_id, root_category, c.arr_categories, c.arr_category_id
    // ORDER BY ${this.buildOrderByClause(query)}

    const totalCount = rows.length > 0 ? rows[0].total_count : null;
    const posts = rows.map((post) => this.convertCase(post as any));

    return {
      totalCount,
      posts,
      count: rows.length,
    };
  }

  async getOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { post_id: id },
      include: {
        authors: { include: { users: true } },
        posts_tags: true,
        posts_comments: true,
      },
    });

    if (!post) {
      return ApiError.PostsNotFound();
    }

    const comments = await this.postsCommentsService.getPostComments({
      id,
      perPage: 0,
      page: 0,
    });
    const tags = await this.postsTagsService.getPostTags(id);
    const categories = await this.categoriesService.getOne(post.fk_category_id);

    return {
      ...this.convertCase(post),
      tags,
      comments,
      categories,
    };
  }

  async delete(id: number) {
    const post = await this.prisma.post.delete({
      where: { post_id: id },
    });

    return {
      ...post,
      id: post.post_id,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  convertCase(post: any) {
    const {
      post_id: id,
      title,
      created_at: createdAt,
      body,
      main_img: mainImg,
      other_imgs: otherImgs,
      authors,
      arr_category_id: categoryIds,
      fk_category_id: rootCategoryId,
      is_published: isPublished,
    } = post;
    const {
      author_id: authorId,
      description: authorDescription,
      users,
    } = authors;

    const {
      user_id: uId,
      first_name: firstName,
      last_name: lastName,
      avatar,
      login,
      is_admin: admin,
    } = users;

    return {
      id,
      rootCategory: {
        id: rootCategoryId,
      },
      createdAt,
      title,
      body,
      mainImg,
      otherImgs,
      author: {
        id: authorId,
        description: authorDescription,
      },
      user: {
        id: uId,
        firstName,
        lastName,
        avatar,
        login,
        admin,
      },
      categoryIds,
      isPublished,
    };
  }
}
