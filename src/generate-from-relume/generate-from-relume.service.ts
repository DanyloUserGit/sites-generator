import { Injectable } from '@nestjs/common';
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

@Injectable()
export class GenerateFromRelumeService {
  constructor(
    @InjectRepository(RelumeSite)
    private readonly siteRepo: Repository<RelumeSite>,
    @InjectRepository(RelumePage)
    private readonly pageRepo: Repository<RelumePage>,
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
      relations: ['pages', 'pages.tags'],
    });
  }

  async deleteSite(id: number) {
    return this.siteRepo.delete(id);
  }
}
