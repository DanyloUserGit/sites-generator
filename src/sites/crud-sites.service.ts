import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from './entities/site.entity';
import { plainToInstance } from 'class-transformer';
import { ExcludeUsedUnsplashIds } from './dto/create-site.dto';
import { Page } from './entities/page-entities/page.entity';
import { PageSeo } from './entities/page-entities/page-seo.entity';
import { PageContent } from './entities/page-entities/page-content.entiy';

@Injectable()
export class CrudSitesService {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(PageSeo)
    private readonly pageSeoRepository: Repository<PageSeo>,
    @InjectRepository(PageContent)
    private readonly pageContentRepository: Repository<PageContent>,
  ) {}

  async getSite(id: string) {
    try {
      const site = await this.siteRepository.findOne({ where: { id } });
      if (!site) throw new NotFoundException(`Site with id ${id} not found`);
      return plainToInstance(ExcludeUsedUnsplashIds, site);
    } catch (error) {
      throw error;
    }
  }
  async updateSite(id: string, updates: Partial<Site>) {
    try {
      await this.siteRepository.update(id, updates);
      return await this.getSite(id);
    } catch (error) {}
  }
  //loadEagerRelations:true
  async deleteSite(id: string): Promise<void> {
    const site = await this.siteRepository.findOne({
      where: { id },
      relations: ['pages', 'pages.content', 'pages.seo'],
    });

    if (!site) throw new NotFoundException(`Site with id ${id} not found`);

    (site.pages.map(async (page) => {
      const fullPage = await this.pageRepository.findOne({
        where: { id: page.id },
        relations: ['seo', 'content'],
      });
      if (fullPage) {
        await this.pageSeoRepository.remove(fullPage.seo);
        await this.pageContentRepository.remove(fullPage.content);
        await this.pageRepository.remove(fullPage);
      }
    }),
      await this.siteRepository.remove(site));
  }
}
