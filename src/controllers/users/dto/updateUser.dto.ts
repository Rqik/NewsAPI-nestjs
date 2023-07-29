import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string | null;

  @IsOptional()
  @IsString()
  @MinLength(4)
  login: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  password: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsOptional()
  @IsString()
  avatar: string | null;
}
