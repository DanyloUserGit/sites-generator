import { IsString } from '@nestjs/class-validator';
import { Exclude } from 'class-transformer';

export class CreateSiteDTO {
  @IsString()
  city: string;

  @IsString()
  services: string;

  @IsString()
  language: string;

  @IsString()
  domain: string;
}

export class Id {
  @IsString()
  id: string;
}
export class ExcludeUsedUnsplashIds {
  @Exclude()
  usedUnsplashIds: string[];
}
