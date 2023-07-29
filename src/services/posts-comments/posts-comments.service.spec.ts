import { Test, TestingModule } from '@nestjs/testing';

import { PostsCommentsService } from './posts-comments.service';

describe('PostsCommentsService', () => {
  let service: PostsCommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsCommentsService],
    }).compile();

    service = module.get<PostsCommentsService>(PostsCommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
