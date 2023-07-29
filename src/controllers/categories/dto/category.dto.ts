import { IsOptional, IsString } from 'class-validator';

export class CategoryDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  category: string;
}
