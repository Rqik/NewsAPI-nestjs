import { IsString } from 'class-validator';

export class PostsCommentsDto {
  @IsString()
  body: string;
}
