import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';

@Module({
  providers: [TemplateService],
  controllers: [TemplateController]
})
export class TemplateModule {}
