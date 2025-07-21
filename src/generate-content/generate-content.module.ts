import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromptPageContent } from './entities/page-entities/prompt-page-content.entity';
import { PromptPageSeo } from './entities/page-entities/prompt-page-seo.entity';
import { PromptPage } from './entities/page-entities/prompt-page.entity';
import { PromptSite } from './entities/prompt-site.entity';
import { GenerateContentController } from './generate-content.controller';
import { GenerateContentService } from './generate-content.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PromptSite,
      PromptPage,
      PromptPageSeo,
      PromptPageContent,
    ]),
  ],
  controllers: [GenerateContentController],
  providers: [GenerateContentService],
})
export class GenerateContentModule {}
