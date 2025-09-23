import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import AdmZip from 'adm-zip';
import { load } from 'cheerio';
import { execSync } from 'child_process';
import * as fs from 'fs';
import iconv from 'iconv-lite';
import { JSDOM } from 'jsdom';
import * as path from 'path';
import { CreateSiteDTO } from 'src/sites/dto/create-site.dto';
import { validateDomainReceiver } from 'src/utils';
import { Repository } from 'typeorm';
import { RelumePageSeo } from './entities/relume-page-seo';
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
    @InjectRepository(RelumePageSeo)
    private readonly pageSeoRepo: Repository<RelumePageSeo>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async createSite(file: Express.Multer.File, body: CreateSiteDTO) {
    const uploadDir = path.join(process.cwd(), 'sites');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const { city, services, language, domain } = body;
    if (
      !city?.trim() ||
      !services?.trim() ||
      !language?.trim() ||
      !domain?.trim()
    ) {
      throw new Error('Data not provided or invalid');
    }

    const validDomain = validateDomainReceiver(domain);
    if (!validDomain) {
      throw new Error('Invalid domain');
    }

    const fileNameBuffer = Buffer.from(file.originalname, 'binary');
    const decodedName = iconv.decode(fileNameBuffer, 'utf-8');
    const siteName = path.basename(decodedName, '.zip');

    const zipPath = path.join(uploadDir, siteName + '.zip');
    fs.writeFileSync(zipPath, file.buffer);

    const site = this.siteRepo.create({
      name: siteName,
      city,
      services,
      language,
      domain,
      pages: [],
    });
    await this.siteRepo.save(site);

    const extractPath = path.join(uploadDir, site.id);
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);
    fs.unlinkSync(zipPath);

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
  async buildSite(id: string) {
    const site = await this.siteRepo.findOne({
      where: { id },
      relations: ['pages', 'pages.seo'],
    });
    if (!site) {
      throw new Error(`Site with id ${id} not found`);
    }

    const sitePath = path.join(process.cwd(), 'sites', site.id);
    if (!fs.existsSync(sitePath)) {
      throw new Error(`Site folder not found: ${sitePath}`);
    }

    const pageDirs = fs
      .readdirSync(sitePath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    const rootIndexPath = path.join(sitePath, 'index.html');
    if (fs.existsSync(rootIndexPath)) {
      const rootPage = site.pages.find((p) => p.id === site.homePageId);

      if (rootPage) {
        const html = fs.readFileSync(rootIndexPath, 'utf-8');
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const tags = this.generateSeoTags(rootPage);
        this.updateHeadTags(document, tags);
        this.generateSitemapAndRobots(site);
        await this.addTailwind(id);
        await this.addTailwindLinkToHtml(sitePath);
        fs.writeFileSync(rootIndexPath, dom.serialize(), 'utf-8');
      } else {
        console.warn(`No matching page entity for root index.html`);
      }
    }

    // Далі обробка папок
    for (const dir of pageDirs) {
      if (dir === 'src' || dir === 'node_modules' || dir === 'public') continue;
      const indexPath = path.join(sitePath, dir, 'index.html');
      if (!fs.existsSync(indexPath)) {
        console.warn(`index.html not found in ${dir}`);
        continue;
      }

      const page = site.pages.find(
        (p) => p.name.toLowerCase() === dir.toLowerCase(),
      );
      if (!page) {
        console.warn(`No matching page entity for folder "${dir}"`);
        continue;
      }

      const html = fs.readFileSync(indexPath, 'utf-8');
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const tags = this.generateSeoTags(page);
      this.updateHeadTags(document, tags);
      this.generateSitemapAndRobots(site);
      await this.addTailwind(id);
      await this.addTailwindLinkToHtml(sitePath);
      fs.writeFileSync(indexPath, dom.serialize(), 'utf-8');
    }

    const publicPath = path.join(sitePath, 'public');
    if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath);

    const moveFilesToPublic = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Пропускаємо заборонені
        if (
          entry.name === 'src' ||
          entry.name === 'node_modules' ||
          entry.name === 'public' ||
          entry.name === 'tailwind.config.js' ||
          entry.name === 'postcss.config.js'
        ) {
          continue;
        }

        const destPath = path.join(publicPath, entry.name);

        if (entry.isDirectory()) {
          fs.cpSync(fullPath, destPath, { recursive: true });
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else if (entry.isFile()) {
          fs.copyFileSync(fullPath, destPath);
          fs.unlinkSync(fullPath);
        }
      }
    };

    // Викликаємо після обробки HTML
    moveFilesToPublic(sitePath);
    return { success: true };
  }

  private generateSeoTags(page: RelumePage): any[] {
    const tags = [];

    if (page.seo) {
      if (page.seo.metaTitle) {
        tags.push({ type: 'title', content: page.seo.metaTitle });
      }
      if (page.seo.metaDescription) {
        tags.push({
          type: 'meta',
          name: 'description',
          content: page.seo.metaDescription,
        });
      }
      if (page.seo.keywords) {
        let keywordsContent: string;
        if (Array.isArray(page.seo.keywords)) {
          keywordsContent = page.seo.keywords.join(', ');
        } else if (typeof page.seo.keywords === 'string') {
          keywordsContent = page.seo.keywords;
        } else {
          keywordsContent = '';
        }

        if (keywordsContent) {
          tags.push({
            type: 'meta',
            name: 'keywords',
            content: keywordsContent,
          });
        }
      }
      if (page.seo.schemaOrg) {
        tags.push({
          type: 'script',
          attrs: { type: 'application/ld+json' },
          content: JSON.stringify(page.seo.schemaOrg, null, 2),
        });
      }
    }

    return tags;
  }

  private updateHeadTags(document: Document, tags: any[]) {
    const head = document.querySelector('head');
    if (!head) return;

    for (const tag of tags) {
      if (tag.type === 'title') {
        let el = head.querySelector('title');
        if (!el) {
          el = document.createElement('title');
          head.appendChild(el);
        }
        el.textContent = tag.content;
      }

      if (tag.type === 'meta') {
        let el = head.querySelector(`meta[name="${tag.name}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute('name', tag.name);
          head.appendChild(el);
        }
        el.setAttribute('content', tag.content);
      }

      if (tag.type === 'script') {
        let el = head.querySelector('script[type="application/ld+json"]');
        if (!el) {
          el = document.createElement('script');
          el.setAttribute('type', 'application/ld+json');
          head.appendChild(el);
        }
        el.textContent = tag.content;
      }
    }
  }
  private generateSitemapAndRobots(site: RelumeSite) {
    try {
      const sitePath = path.join(process.cwd(), 'sites', site.id);
      if (!fs.existsSync(sitePath)) {
        throw new Error(`Site folder not found: ${sitePath}`);
      }

      if (!site.domain) {
        throw new Error(`Domain is required for site ${site.id}`);
      }

      const baseUrl = site.domain.startsWith('http')
        ? site.domain.replace(/\/$/, '')
        : `https://${site.domain.replace(/\/$/, '')}`;

      const pageDirs = fs
        .readdirSync(sitePath, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

      const now = new Date().toISOString();

      const urlEntries: string[] = [];

      urlEntries.push(
        `<url><loc>${baseUrl}/</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>`,
      );

      for (const dir of pageDirs) {
        if (dir !== 'src' && dir !== 'node_modules' && dir !== 'public')
          urlEntries.push(
            `<url><loc>${baseUrl}/${dir}/</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>`,
          );
      }

      const sitemap0 = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urlEntries.join('\n')}
</urlset>`;

      fs.writeFileSync(path.join(sitePath, 'sitemap-0.xml'), sitemap0, 'utf-8');

      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap><loc>${baseUrl}/sitemap-0.xml</loc></sitemap>
</sitemapindex>`;

      fs.writeFileSync(
        path.join(sitePath, 'sitemap.xml'),
        sitemapIndex,
        'utf-8',
      );

      const robots = `# *
User-agent: *
Allow: /

# Host
Host: ${baseUrl}/

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml`;

      fs.writeFileSync(path.join(sitePath, 'robots.txt'), robots, 'utf-8');

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
  async setHomePage(siteId: string, pageId: string) {
    try {
      const site = await this.siteRepo.findOne({
        where: { id: siteId },
        relations: ['pages'],
      });

      if (!site) {
        throw new Error(`Site ${siteId} not found`);
      }

      const page = site.pages.find((p) => p.id === pageId);
      if (!page) {
        throw new Error(`Page ${pageId} not found in site ${siteId}`);
      }

      const sitePath = path.join(process.cwd(), 'sites', site.id);
      const pagePath = path.join(sitePath, page.name);
      const pageIndexFile = path.join(pagePath, 'index.html');
      const rootIndexFile = path.join(sitePath, 'index.html');

      if (!fs.existsSync(pageIndexFile)) {
        throw new Error(`index.html not found for page ${page.name}`);
      }

      fs.copyFileSync(pageIndexFile, rootIndexFile);

      fs.rmSync(pagePath, { recursive: true, force: true });

      site.homePageId = pageId;
      await this.siteRepo.save(site);

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
  private async addTailwind(siteId: string) {
    try {
      const sitePath = path.join(process.cwd(), 'sites', siteId);
      if (!fs.existsSync(sitePath)) {
        throw new Error(`Site folder not found: ${sitePath}`);
      }

      // Якщо немає package.json – створюємо
      if (!fs.existsSync(path.join(sitePath, 'package.json'))) {
        execSync('npm init -y', {
          cwd: sitePath,
          stdio: 'inherit',
          shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
        });
      }

      let tailwindBin = path.join(
        sitePath,
        'node_modules',
        '.bin',
        process.platform === 'win32' ? 'tailwindcss.cmd' : 'tailwindcss',
      );

      // Встановлюємо Tailwind, якщо ще немає
      if (!fs.existsSync(tailwindBin)) {
        console.log('Installing Tailwind CSS...');
        execSync('npm install -D tailwindcss@3.3.3 postcss autoprefixer', {
          cwd: sitePath,
          stdio: 'inherit',
          shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
        });

        tailwindBin = path.join(
          sitePath,
          'node_modules',
          '.bin',
          process.platform === 'win32' ? 'tailwindcss.cmd' : 'tailwindcss',
        );

        if (!fs.existsSync(tailwindBin)) {
          throw new Error('Tailwind CLI not found after install');
        }
      }

      // Tailwind config
      const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.html"],
  theme: { extend: {} },
  plugins: [],
};`;
      fs.writeFileSync(
        path.join(sitePath, 'tailwind.config.js'),
        tailwindConfig,
        'utf-8',
      );

      // PostCSS config
      const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`;
      fs.writeFileSync(
        path.join(sitePath, 'postcss.config.js'),
        postcssConfig,
        'utf-8',
      );

      // Вхідний CSS
      const cssFolder = path.join(sitePath, 'src', 'css');
      fs.mkdirSync(cssFolder, { recursive: true });
      fs.writeFileSync(
        path.join(cssFolder, 'input.css'),
        '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n',
        'utf-8',
      );

      // ⚡ Будуємо одразу в public/css, а не dist/
      const publicCssFolder = path.join(sitePath, 'public', 'css');
      fs.mkdirSync(publicCssFolder, { recursive: true });

      console.log('Building Tailwind CSS...');
      execSync(
        `${tailwindBin} -i ./src/css/input.css -o ./public/css/style.css --minify`,
        {
          cwd: sitePath,
          stdio: 'inherit',
          shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
        },
      );

      console.log(
        `✅ Tailwind CSS setup and build complete for site ${siteId}`,
      );
      return { success: true };
    } catch (error) {
      console.error('Tailwind setup/build error:', error);
      throw error;
    }
  }

  private async addTailwindLinkToHtml(sitePath: string) {
    const htmlFiles: string[] = [];

    function findHtmlFiles(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findHtmlFiles(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          htmlFiles.push(fullPath);
        }
      }
    }

    findHtmlFiles(sitePath);

    for (const filePath of htmlFiles) {
      let html = fs.readFileSync(filePath, 'utf-8');

      const linkTag = `<link rel="stylesheet" href="/css/style.css">`;

      // Забираємо старі шляхи на ../dist/ чи ./dist/
      html = html.replace(
        /<link[^>]+href=["'][^"']*dist\/css\/style\.css["'][^>]*>/g,
        '',
      );

      if (!html.includes(linkTag)) {
        if (html.includes('<head>')) {
          html = html.replace('<head>', `<head>\n  ${linkTag}`);
        } else {
          html = `${linkTag}\n${html}`;
        }
        fs.writeFileSync(filePath, html, 'utf-8');
        console.log(`✅ Added Tailwind link to ${filePath}`);
      }
    }
  }

  async searchPages(
    siteId: string,
    query: string,
  ): Promise<{ name: string; id: string }[]> {
    try {
      if (!query || !query.trim()) return [];

      const pages = await this.pageRepo
        .createQueryBuilder('page')
        .leftJoin('page.site', 'site')
        .where('site.id = :siteId', { siteId })
        .andWhere('page.name ILIKE :query', { query: `%${query}%` })
        .select(['page.id', 'page.name'])
        .orderBy('page.name', 'ASC')
        .limit(3)
        .getRawMany();

      return pages.map((p) => ({ id: p.page_id, name: p.page_name }));
    } catch (error) {
      throw error;
    }
  }
  async deleteSite(id: string) {
    const uploadDir = path.join(process.cwd(), 'sites');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const extractPath = path.join(uploadDir, id);
    if (fs.existsSync(extractPath)) {
      fs.rmSync(extractPath, { recursive: true, force: true });
    }
    return this.siteRepo.delete(id);
  }
}
