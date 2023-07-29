import { IsNumber, IsString } from 'class-validator';

export class AuthorDto {
  @IsString()
  description: string;

  @IsNumber()
  userId: number;
}
