import { Test, TestingModule } from '@nestjs/testing';

import { PostsCommentsController } from './posts-comments.controller';

describe('PostsCommentsController', () => {
  let controller: PostsCommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsCommentsController],
    }).compile();

    controller = module.get<PostsCommentsController>(PostsCommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
