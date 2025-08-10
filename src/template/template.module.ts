import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Site } from 'src/sites/entities/site.entity';
import { Page } from 'openai/pagination';
import { PageSeo } from 'src/sites/entities/page-entities/page-seo.entity';
import { PageContent } from 'src/sites/entities/page-entities/page-content.entiy';
import { StaticSitesService } from './template-deploy.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Site, Page, PageSeo, PageContent]),
    RedisModule,
  ],
  providers: [TemplateService, StaticSitesService],
  controllers: [TemplateController],
})
export class TemplateModule {}
