import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DraftDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsNotEmpty()
  @IsInt()
  authorId: number;

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsString()
  mainImg?: string;

  @IsOptional()
  @IsString({ each: true })
  otherImgs?: string[];
}
