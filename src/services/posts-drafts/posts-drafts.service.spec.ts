import { Test, TestingModule } from '@nestjs/testing';

import { PostsDraftsService } from './posts-drafts.service';

describe('PostsDraftsService', () => {
  let service: PostsDraftsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsDraftsService],
    }).compile();

    service = module.get<PostsDraftsService>(PostsDraftsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
