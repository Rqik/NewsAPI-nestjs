import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class UserLocalDto {
  @IsString()
  email: string;

  @IsNumber()
  id: number;

  @IsBoolean()
  isActivated: boolean;

  @IsBoolean()
  isAdmin: boolean;

  constructor(data: Partial<UserLocalDto>) {
    this.email = data.email;
    this.id = data.id;
    this.isActivated = data.isActivated;
    this.isAdmin = data.isAdmin;
  }
}
