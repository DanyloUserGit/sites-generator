import { IsString } from '@nestjs/class-validator';

export class LoginDto {
  @IsString()
  login: string;

  @IsString()
  password: string;
}
