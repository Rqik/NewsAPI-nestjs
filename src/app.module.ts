import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AppConfigModule } from './config/config.module';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthorsController } from './controllers/authors/authors.controller';
import { CategoriesController } from './controllers/categories/categories.controller';
import { PostsController } from './controllers/posts/posts.controller';
import { PostsCommentsController } from './controllers/posts-comments/posts-comments.controller';
import { PostsDraftsController } from './controllers/posts-drafts/posts-drafts.controller';
import { TagsController } from './controllers/tags/tags.controller';
import { UsersController } from './controllers/users/users.controller';
import { DatabaseModule } from './database/database.module';
import { AuthorsService } from './services/authors/authors.service';
import { CategoriesService } from './services/categories/categories.service';
import { CommentsService } from './services/comments/comments.service';
import { DraftsService } from './services/drafts/drafts.service';
import { FileService } from './services/file/file.service';
import { MailService } from './services/mail/mail.service';
import { PostsService } from './services/posts/posts.service';
import { PostsCommentsService } from './services/posts-comments/posts-comments.service';
import { PostsDraftsService } from './services/posts-drafts/posts-drafts.service';
import { PostsTagsService } from './services/posts-tags/posts-tags.service';
import { TagsService } from './services/tags/tags.service';
import { TokensService } from './services/tokens/tokens.service';
import { UsersService } from './services/users/users.service';

@Module({
  imports: [AppConfigModule, DatabaseModule, JwtModule],
  controllers: [
    AuthController,
    AuthorsController,
    CategoriesController,
    PostsController,
    PostsCommentsController,
    PostsDraftsController,
    TagsController,
    UsersController,
  ],
  providers: [
    AuthorsService,
    CategoriesService,
    CommentsService,
    DraftsService,
    FileService,
    MailService,
    PostsService,
    PostsCommentsService,
    PostsDraftsService,
    PostsTagsService,
    TagsService,
    TokensService,
    UsersService,
  ],
})
export class AppModule {}
