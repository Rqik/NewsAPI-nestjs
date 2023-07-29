import { IsNumber, IsString } from 'class-validator';

export class PostsDraftsDto {
  @IsString()
  body: string;

  @IsString()
  title: string;

  @IsNumber()
  categoryId: number;
}
