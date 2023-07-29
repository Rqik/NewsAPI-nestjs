import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class UserDto {
  @IsString()
  email: string;

  @IsNumber()
  id: number;

  @IsBoolean()
  isActivated: boolean;

  @IsBoolean()
  isAdmin: boolean;
}
