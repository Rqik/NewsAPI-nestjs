import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CategoryDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  category: number;
}
