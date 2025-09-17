import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from 'src/config/config.module';
import { PageContent } from 'src/sites/entities/page-entities/page-content.entiy';
import { PageSeo } from 'src/sites/entities/page-entities/page-seo.entity';
import { Page } from 'src/sites/entities/page-entities/page.entity';
import { Site } from 'src/sites/entities/site.entity';
import { PromptPageContent } from './entities/page-entities/prompt-page-content.entity';
import { PromptPageSeo } from './entities/page-entities/prompt-page-seo.entity';
import { PromptSite } from './entities/prompt-site.entity';
import { GenerateContentController } from './generate-content.controller';
import { GenerateContentService } from './generate-content.service';
import { RedisModule } from 'src/redis/redis.module';
import { ManagePromptsService } from './manage-prompts.service';
import { OpenAIService } from './openAI.service';
import { UnsplashModule } from 'src/unsplash/unsplash.module';
import { MapboxModule } from 'src/mapbox/mapbox.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PromptSite,
      PromptPageSeo,
      PromptPageContent,
      Site,
      Page,
      PageSeo,
      PageContent,
    ]),
    AppConfigModule,
    RedisModule,
    UnsplashModule,
    MapboxModule,
  ],
  controllers: [GenerateContentController],
  providers: [GenerateContentService, ManagePromptsService, OpenAIService],
  exports: [OpenAIService],
})
export class GenerateContentModule {}
