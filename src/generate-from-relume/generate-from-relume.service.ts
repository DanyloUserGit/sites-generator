import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import AdmZip from 'adm-zip';
import { load } from 'cheerio';
import * as fs from 'fs';
import iconv from 'iconv-lite';
import * as path from 'path';
import { DeploymentService } from 'src/deployment/deployment.service';
import { CreateSiteDTO } from 'src/sites/dto/create-site.dto';
import { Repository } from 'typeorm';
import { RelumePage } from './entities/relume-page.entity';
import { RelumeSite } from './entities/relume-site.entity';
import { Tag } from './entities/tag.entity';
import { RelumePageSeo } from './entities/relume-page-seo';

@Injectable()
export class GenerateFromRelumeService {
  constructor(
    @InjectRepository(RelumeSite)
    private readonly siteRepo: Repository<RelumeSite>,
    @InjectRepository(RelumePage)
    private readonly pageRepo: Repository<RelumePage>,
    @InjectRepository(RelumePageSeo)
    private readonly pageSeoRepo: Repository<RelumePageSeo>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,

    private readonly deploymentService: DeploymentService,
  ) {}

  async createSite(file: Express.Multer.File, body: CreateSiteDTO) {
    const uploadDir = path.join(process.cwd(), 'sites');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileNameBuffer = Buffer.from(file.originalname, 'binary');
    const decodedName = iconv.decode(fileNameBuffer, 'utf-8');
    const siteName = path.basename(decodedName, '.zip');

    const zipPath = path.join(uploadDir, siteName + '.zip');
    fs.writeFileSync(zipPath, file.buffer);

    const extractPath = path.join(uploadDir, siteName);
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);
    fs.unlinkSync(zipPath);

    const { city, services, language, domain } = body;
    if (
      !city?.trim() ||
      !services?.trim() ||
      !language?.trim() ||
      !domain?.trim()
    ) {
      throw new Error('Data not provided or invalid');
    }

    const validDomain = this.deploymentService.validateDomainReceiver(domain);
    if (!validDomain) {
      throw new Error('Invalid domain');
    }

    const site = this.siteRepo.create({
      name: siteName,
      city,
      services,
      language,
      domain,
      pages: [],
    });
    await this.siteRepo.save(site);

    const pagesDirs = fs
      .readdirSync(extractPath, { withFileTypes: true })
      .filter((d) => d.isDirectory());

    for (const dir of pagesDirs) {
      const pageName = dir.name;
      const pagePath = path.join(extractPath, pageName, 'index.html');

      if (!fs.existsSync(pagePath)) continue;

      const html = fs.readFileSync(pagePath, 'utf-8');
      const { updatedHtml, tags } = this.extractTags(html);
      fs.writeFileSync(pagePath, updatedHtml);

      const page = this.pageRepo.create({
        name: pageName,
        site,
        tags: tags.map((t) =>
          this.tagRepo.create({
            type: t.type,
            value: t.value,
          }),
        ),
      });

      await this.pageRepo.save(page);
    }

    return this.siteRepo.findOne({
      where: { id: site.id },
      relations: ['pages', 'pages.tags', 'pages.seo'],
    });
  }

  private extractTags(html: string): { updatedHtml: string; tags: Tag[] } {
    const $ = load(html);
    const tags: Tag[] = [];
    let tagIndex = 1;

    $('p, h1, h2, h3, h4, h5, h6, span').each((_, el) => {
      const text = $(el).text().trim();
      if (text) {
        const tag = this.tagRepo.create({
          type: el.tagName.toLowerCase(),
          value: text,
        });
        tags.push(tag);
        $(el).attr('data-tag-id', String(tagIndex++));
      }
    });

    $('img').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        const tag = this.tagRepo.create({ type: 'img', value: src });
        tags.push(tag);
        $(el).attr('data-tag-id', String(tagIndex++));
      }
    });

    return { updatedHtml: $.html(), tags };
  }

  async getSites(page = 1, limit = 5) {
    const [data, count] = await this.siteRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  async getSiteById(id: string) {
    return this.siteRepo.findOne({
      where: { id },
      relations: ['pages', 'pages.tags', 'pages.site'],
    });
  }

  async deleteSite(id: string) {
    return this.siteRepo.delete(id);
  }
  async updateSite(id: string, updates: Partial<RelumeSite>) {
    try {
      const { id: _, pages, createdAt, updatedAt, ...scalarUpdates } = updates;

      await this.siteRepo.update(id, scalarUpdates);
      return await this.getSiteById(id);
    } catch (error) {
      throw error;
    }
  }
  async getSitePages(id: string) {
    try {
      const site = await this.siteRepo.findOne({
        where: { id },
        relations: ['pages', 'pages.site'],
      });
      return site.pages;
    } catch (error) {
      throw error;
    }
  }
  async getSitePageTab(id: string, tab: string) {
    try {
      if (tab === 'seo') {
        const seo = await this.pageSeoRepo.findOne({
          where: { page: { id } },
        });
        return seo;
      }
      if (tab === 'content') {
        const content = await this.pageRepo.findOne({
          where: { id },
          relations: ['tags'],
        });
        return content.tags;
      }
    } catch (error) {
      throw error;
    }
  }
  async updateSitePageTab(id: string, tab: string, updates: any) {
    try {
      if (tab === 'seo') {
        const seo = await this.pageSeoRepo.findOne({
          where: { page: { id } },
        });

        if (!seo) throw new NotFoundException('SEO not found');

        await this.pageSeoRepo.update(seo.id, updates);

        return seo;
      }

      if (tab === 'content') {
        const tags: Tag[] = updates;
        for (const t of tags) {
          if (t.id) {
            await this.tagRepo.update(t.id, { value: t.value });
          } else {
            const newTag = this.tagRepo.create({ ...t, page: { id } });
            await this.tagRepo.save(newTag);
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }
}
