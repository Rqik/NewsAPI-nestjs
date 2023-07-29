import { IsNumber, IsString, Validate } from 'class-validator';

import { isArrayOrString } from '@/shared';

export class PostDto {
  @IsString()
  title: string;

  @IsNumber()
  authorId: number;

  @IsNumber()
  categoryId: number;

  @IsString()
  body: string;

  @Validate(isArrayOrString)
  tags: number[] | string;
}
