import { IsInt, IsNotEmpty } from 'class-validator';

export class IdDto {
  @IsInt()
  @IsNotEmpty()
  id: number;
}
