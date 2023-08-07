import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Validate } from 'class-validator';

import { isArrayOrString } from '@/shared';

export class PostDto {
  @IsString()
  title: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  authorId: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  categoryId: number;

  @IsString()
  body: string;

  @Validate(isArrayOrString)
  tags: number[] | string;
}
