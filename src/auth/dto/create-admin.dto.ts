import { IsString } from '@nestjs/class-validator';

export class RegisterDto {
  @IsString()
  login: string;

  @IsString()
  password: string;
}
