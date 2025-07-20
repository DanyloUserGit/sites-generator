import { IsString } from '@nestjs/class-validator';

export class CreateSiteDTO {
  @IsString()
  city: string;

  @IsString()
  services: string;

  @IsString()
  language: string;
}
