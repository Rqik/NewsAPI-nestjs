import { Test, TestingModule } from '@nestjs/testing';

import { PostsDraftsController } from './posts-drafts.controller';

describe('PostsDraftsController', () => {
  let controller: PostsDraftsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsDraftsController],
    }).compile();

    controller = module.get<PostsDraftsController>(PostsDraftsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
