import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageContent } from './entities/page-entities/page-content.entiy';
import { PageSeo } from './entities/page-entities/page-seo.entity';
import { Page } from './entities/page-entities/page.entity';
import { Site } from './entities/site.entity';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { CrudSitesService } from './crud-sites.service';

@Module({
  imports: [TypeOrmModule.forFeature([Site, Page, PageSeo, PageContent])],
  providers: [SitesService, CrudSitesService],
  controllers: [SitesController],
  exports: [SitesService],
})
export class SitesModule {}
