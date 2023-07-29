import { Test, TestingModule } from '@nestjs/testing';

import { PostsTagsService } from './posts-tags.service';

describe('PostsTagsService', () => {
  let service: PostsTagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsTagsService],
    }).compile();

    service = module.get<PostsTagsService>(PostsTagsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
