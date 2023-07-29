import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CommentDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  body: string;
}
