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
    } catch (error) {
      throw error;
    }
  }
  async updateSitePageTab(id: string, tab: string, updates: any) {
    try {
      if (tab === 'seo') {
        const seo = await this.pageSeoRepository.findOne({
          where: { page: { id } },
        });

        if (!seo) throw new NotFoundException('SEO not found');

        await this.pageSeoRepository.update(seo.id, updates);

        return seo;
      }
      if (tab === 'content') {
        const content = await this.pageContentRepository.findOne({
          where: { page: { id } },
        });

        if (!content) throw new NotFoundException('Content not found');

        await this.pageContentRepository.update(content.id, updates);
      }
      if (tab === 'structure') {
        const page = await this.pageRepository.findOne({
          where: { id },
        });

        if (!page) throw new NotFoundException('Page not found');

        await this.pageRepository.update(id, updates);
      }
    } catch (error) {
      throw error;
    }
  }
  //loadEagerRelations:true
  async deleteSite(id: string): Promise<void> {
    const site = await this.siteRepository.findOneBy({ id });

    if (!site) throw new NotFoundException(`Site with id ${id} not found`);

    await this.siteRepository.remove(site);
  }

  async getSitePages(id: string) {
    try {
      const site = await this.siteRepository.findOne({
        where: { id },
        relations: ['pages'],
      });
      return site.pages;
    } catch (error) {
      throw error;
    }
  }
  async getSitePageTab(id: string, tab: string) {
    try {
      if (tab === 'seo') {
        const seo = await this.pageSeoRepository.findOne({
          where: { page: { id } },
        });
        return seo;
      }
      if (tab === 'content') {
        const content = await this.pageContentRepository.findOne({
          where: { page: { id } },
        });
        return content;
      }
      if (tab === 'structure') {
        const page = await this.pageRepository.findOne({
          where: { id },
        });
        return page.sections;
      }
    } catch (error) {
      throw error;
    }
  }
}
