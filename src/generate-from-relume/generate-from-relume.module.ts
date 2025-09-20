import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromptPageSeo } from 'src/generate-content/entities/page-entities/prompt-page-seo.entity';
import { GenerateContentModule } from 'src/generate-content/generate-content.module';
import { RelumePageSeo } from './entities/relume-page-seo';
import { RelumePage } from './entities/relume-page.entity';
import { RelumeSite } from './entities/relume-site.entity';
import { Tag } from './entities/tag.entity';
import { GenerateFromRelumeController } from './generate-from-relume.controller';
import { GenerateFromRelumeService } from './generate-from-relume.service';
import { GenerateSeoFromRelumeService } from './generate-seo-from-relume.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RelumeSite,
      RelumePage,
      RelumePageSeo,
      Tag,
      PromptPageSeo,
    ]),
    GenerateContentModule,
  ],
  providers: [GenerateFromRelumeService, GenerateSeoFromRelumeService],
  controllers: [GenerateFromRelumeController],
  exports: [GenerateFromRelumeService],
})
export class GenerateFromRelumeModule {}
