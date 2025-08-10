import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs-extra';
import * as path from 'path';
import { PageContent } from 'src/sites/entities/page-entities/page-content.entiy';
import { PageSeo } from 'src/sites/entities/page-entities/page-seo.entity';
import { Page } from 'src/sites/entities/page-entities/page.entity';
import { Site } from 'src/sites/entities/site.entity';
import { execAsync } from 'src/utils';
import { Repository } from 'typeorm';
import { StaticSitesService } from './template-deploy.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(PageSeo)
    private readonly pageSeoRepository: Repository<PageSeo>,
    @InjectRepository(PageContent)
    private readonly pageContentRepository: Repository<PageContent>,

    private readonly templateDeployService: StaticSitesService,
    private readonly redisService: RedisService,
  ) {}
  private async updateGenerationStatus(siteId: string, status: string) {
    await this.redisService.set(`site-status:${siteId}`, status);
  }
  async getDataJson(siteId: string) {
    try {
      const site = await this.siteRepository.findOne({
        where: { id: siteId },
        relations: ['pages'],
      });
      if (!site) throw new NotFoundException('Site not found');
      return site;
    } catch (error) {
      throw error;
    }
  }
  async saveDataJsonAndStartBuild(siteId: string, host: string) {
    try {
      await this.updateGenerationStatus(siteId, '5% - Fetching site data');
      const data = await this.getDataJson(siteId);
      if (!data) throw new Error('Failed to get site data');

      const slug = data.slug;
      if (!slug) throw new Error('Slug is missing');

      const isRunning = await this.templateDeployService.isSiteRunning(slug);
      if (isRunning) {
        await this.updateGenerationStatus(siteId, 'Stopping running site');
        await this.templateDeployService.stopSite(slug);
        await this.updateGenerationStatus(siteId, 'Site stopped');
      }

      const tmpDir = path.join(process.cwd(), 'tmp');
      const tmpTemplateDir = path.join(tmpDir, 'base-template');
      const baseTemplateDir = path.join(process.cwd(), 'base-template');

      await this.updateGenerationStatus(
        siteId,
        '10% - Preparing temporary folder',
      );
      await fs.remove(tmpDir);
      await fs.mkdirp(tmpDir);
      await fs.copy(baseTemplateDir, tmpTemplateDir);

      await this.updateGenerationStatus(siteId, '15% - Writing data.json');
      const dataJsonPath = path.join(tmpTemplateDir, 'data.json');
      await fs.writeFile(dataJsonPath, JSON.stringify(data, null, 2));

      await this.updateGenerationStatus(
        siteId,
        '40% - Installing dependencies',
      );
      await execAsync('npm install', {
        cwd: tmpTemplateDir,
        stdio: 'inherit',
        env: process.env,
      });

      await this.updateGenerationStatus(
        siteId,
        '75% - Building Next.js project',
      );
      await execAsync('npx next build', {
        cwd: tmpTemplateDir,
        stdio: 'inherit',
        env: process.env,
      });

      await this.updateGenerationStatus(siteId, '85% - Building site data');
      await execAsync('npm run build:siteData', {
        cwd: tmpTemplateDir,
        stdio: 'inherit',
        env: process.env,
      });

      await this.updateGenerationStatus(
        siteId,
        '90% - Running postbuild tasks',
      );
      await execAsync('npm run postbuild', {
        cwd: tmpTemplateDir,
        stdio: 'inherit',
        env: process.env,
      });

      await this.updateGenerationStatus(siteId, '95% - Copying final output');
      const outputDir = path.join(tmpTemplateDir, 'out');
      const targetDir = path.join(process.cwd(), 'sites', slug);
      await fs.remove(targetDir);
      await fs.mkdirp(targetDir);
      await fs.copy(outputDir, targetDir);

      await this.updateGenerationStatus(
        siteId,
        '98% - Starting the site server',
      );
      const port = await this.templateDeployService.startSite(slug);

      await this.updateGenerationStatus(
        siteId,
        '100% - Build&Deploy completed',
      );

      return { siteUrl: `${host}:${port}` };
    } catch (error) {
      await this.updateGenerationStatus(
        siteId,
        `Failed to generate site: ${error}`,
      );
      throw error;
    }
  }
  async getSiteHost(siteId: string, host: string): Promise<string | null> {
    try {
      const site = await this.siteRepository.findOne({
        where: { id: siteId },
      });
      if (!site) throw new NotFoundException('Site not found');
      const port = this.templateDeployService.getSitePort(site.slug);
      if (!port) return null;

      return `${host}:${port}`;
    } catch (error) {
      throw error;
    }
  }
}
