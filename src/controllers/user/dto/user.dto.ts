import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class  UserDto {
  @IsString()
  @MinLength(1)
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string | null;

  @IsString()
  @MinLength(4)
  login: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  avatar: string | null;
}
