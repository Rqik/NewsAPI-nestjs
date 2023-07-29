import { IsNumber, IsOptional, IsString, Validate } from 'class-validator';

import { isArrayOrString } from '@/shared';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsNumber()
  authorId: number;

  @IsOptional()
  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsString()
  body: string;

  @IsOptional()
  @Validate(isArrayOrString)
  tags: number[] | string;
}
