import { IsNumber, IsString } from 'class-validator';

export class TokenDto {
  @IsString()
  refreshToken: string;

  @IsNumber()
  userId: number;
}
