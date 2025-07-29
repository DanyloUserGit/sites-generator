import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from './entities/site.entity';
import { plainToInstance } from 'class-transformer';
import { ExcludeUsedUnsplashIds } from './dto/create-site.dto';
import { Page } from './entities/page-entities/page.entity';

@Injectable()
export class CrudSitesService {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
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
  async deleteSite(id: string): Promise<void> {
    const site = await this.siteRepository.findOne({
      where: { id },
      relations: ['pages'],
    });

    if (!site) throw new NotFoundException(`Site with id ${id} not found`);

    await Promise.all(
      site.pages.map((page) => this.pageRepository.remove(page)),
    );

    await this.siteRepository.remove(site);
  }
}
