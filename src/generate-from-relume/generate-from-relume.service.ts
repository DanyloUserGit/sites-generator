import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import AdmZip from 'adm-zip';
import { load } from 'cheerio';
import { execSync } from 'child_process';
import * as fs from 'fs';
import os from 'os';
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

  async createSite(
    userId: string,
    file: Express.Multer.File,
    body: CreateSiteDTO,
  ) {
    const uploadDir = path.join(process.cwd(), 'sites');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

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
    if (!validDomain) throw new Error('Invalid domain');

    const fileNameBuffer = Buffer.from(file.originalname, 'binary');
    const decodedName = iconv.decode(fileNameBuffer, 'utf-8');
    const siteName = path.basename(decodedName, '.zip');

    const zipPath = path.join(uploadDir, siteName + '.zip');
    fs.writeFileSync(zipPath, file.buffer);

    // Створюємо запис про сайт
    const site = this.siteRepo.create({
      userId,
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

      // Створюємо сторінку
      const page = this.pageRepo.create({ name: pageName, site });
      await this.pageRepo.save(page);

      const { updatedHtml, tags } = await this.extractTags(html, page);
      fs.writeFileSync(pagePath, updatedHtml);

      // Додаємо position та прив'язку до сторінки і зберігаємо теги окремо
      for (let i = 0; i < tags.length; i++) {
        tags[i].page = page;
        tags[i].position = i + 1; // порядковий номер
        await this.tagRepo.save(tags[i]);
      }
    }

    return this.siteRepo.findOne({
      where: { id: site.id },
      relations: ['pages', 'pages.tags', 'pages.seo'],
    });
  }

  private async extractTags(
    html: string,
    page: RelumePage,
  ): Promise<{ updatedHtml: string; tags: Tag[] }> {
    const $ = load(html);
    const tags: Tag[] = [];
    let tagIndex = 1;

    for (const el of $('p, h1, h2, h3, h4, h5, h6, span, img').toArray()) {
      let tag: Tag | null = null;

      if (el.tagName.toLowerCase() === 'img') {
        const src = $(el).attr('src');
        if (src) {
          tag = this.tagRepo.create({
            type: 'img',
            value: src,
            position: tagIndex,
            page,
          });
        }
      } else {
        const text = $(el).text().trim();
        if (text) {
          tag = this.tagRepo.create({
            type: el.tagName.toLowerCase(),
            value: text,
            position: tagIndex,
            page,
          });
        }
      }

      if (tag) {
        const savedTag = await this.tagRepo.save(tag);
        console.log('TagId: ' + savedTag.id);

        tags.push(savedTag);
        $(el).attr('data-tag-id', savedTag.id);

        tagIndex++;
      }
    }

    return { updatedHtml: $.html(), tags };
  }

  private updateHtmlTags(document: Document, tags: Tag[]) {
    // сортуємо теги по position
    // const sorted = tags.sort((a, b) => a.position - b.position);
    console.log(JSON.stringify(tags));
    for (const tag of tags) {
      let el = document.querySelector(`[data-tag-id="${tag.id}"]`);

      if (!el) {
        // створюємо новий елемент, якщо не існує
        el = document.createElement(tag.type);
        el.setAttribute('data-tag-id', tag.id);

        // додаємо в body (або інший контейнер, якщо треба)
        document.body.appendChild(el);
        console.log(`➕ Created <${tag.type}> with data-tag-id=${tag.id}`);
      }

      if (tag.type === 'img') {
        (el as HTMLImageElement).src = tag.value;
      } else {
        el.textContent = tag.value;
      }
    }
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
          order: { tags: { position: 'ASC' } },
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
      relations: ['pages', 'pages.seo', 'pages.tags'],
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
        this.updateHtmlTags(document, rootPage.tags);
        this.generateSitemapAndRobots(site);
        await this.addTailwind(id);
        fs.writeFileSync(rootIndexPath, dom.serialize(), 'utf-8');
        await this.addTailwindLinkToHtml(sitePath);
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
      this.updateHtmlTags(document, page.tags);
      this.generateSitemapAndRobots(site);
      await this.addTailwind(id);
      fs.writeFileSync(indexPath, dom.serialize(), 'utf-8');
      await this.addTailwindLinkToHtml(sitePath);
    }

    const publicPath = path.join(sitePath, 'public');
    fs.mkdirSync(publicPath, { recursive: true });

    const moveFilesToPublic = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

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
          // ⚡ Тепер копіюємо, але не видаляємо (щоб можна було перебудувати)
          fs.cpSync(fullPath, destPath, { recursive: true });
        } else if (entry.isFile()) {
          fs.copyFileSync(fullPath, destPath);
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

      // === 1. Знаходимо всі HTML-файли для safelist ===
      const htmlFiles: string[] = [];
      function findHtmlFiles(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries.filter((n) => n.name !== 'node_modules')) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            findHtmlFiles(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.html')) {
            htmlFiles.push(fullPath);
          }
        }
      }
      findHtmlFiles(sitePath);

      // === 2. Збираємо всі класи з HTML ===
      const allClasses = new Set<string>();
      const classRegex = /class=["']([^"']+)["']/g;
      for (const file of htmlFiles) {
        const html = fs.readFileSync(file, 'utf-8');
        let match;
        while ((match = classRegex.exec(html)) !== null) {
          match[1].split(/\s+/).forEach((cls) => allClasses.add(cls));
        }
      }
      const safelistArray = Array.from(allClasses)
        .map((c) => `'${c}'`)
        .join(', ');

      // === 3. Створюємо package.json, якщо немає ===
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

      // === 4. Встановлюємо Tailwind та залежності, якщо немає ===
      if (!fs.existsSync(tailwindBin)) {
        console.log('Installing Tailwind CSS...');
        execSync('npm install -D tailwindcss@3.3.3 postcss autoprefixer', {
          cwd: sitePath,
          stdio: 'inherit',
          shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
        });
        execSync('npm i tailwindcss-animate @tailwindcss/typography', {
          cwd: sitePath,
          stdio: 'inherit',
          shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
        });
        execSync('npm i @relume_io/relume-ui @relume_io/relume-tailwind', {
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

      // === 5. Tailwind config з динамічним safelist ===
      const tailwindConfig = `/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./sites/**/*.html",
    "./node_modules/@relume_io/relume-ui/dist/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  presets: [require("@relume_io/relume-tailwind")],
  safelist: [${safelistArray}]
}`;
      fs.writeFileSync(
        path.join(sitePath, 'tailwind.config.js'),
        tailwindConfig,
        'utf-8',
      );

      // === 6. PostCSS config ===
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

      // === 7. Вхідний CSS з обнуленням ===
      const cssFolder = path.join(sitePath, 'src', 'css');
      fs.mkdirSync(cssFolder, { recursive: true });
      fs.writeFileSync(
        path.join(cssFolder, 'input.css'),
        `
/* === Обнулення стилів === */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

body {
  min-height: 100vh;
}

@tailwind base;
@tailwind components;
@tailwind utilities;
`,
        'utf-8',
      );

      // === 8. Папка для зібраного CSS ===
      const publicCssFolder = path.join(sitePath, 'public', 'css');
      fs.mkdirSync(publicCssFolder, { recursive: true });

      // === 9. Будуємо Tailwind ===
      console.log('Building Tailwind CSS...');
      execSync(
        `${tailwindBin} -i ./src/css/input.css -o ./public/css/style.css --minify`,
        {
          cwd: sitePath,
          stdio: 'inherit',
          shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
        },
      );

      // === 10. Видаляємо font-size і font-weight для h1-h6 навіть у мінімізованому CSS ===
      const cssPath = path.join(publicCssFolder, 'style.css');
      let cssContent = fs.readFileSync(cssPath, 'utf-8');
      cssContent = cssContent.replace(/h1,h2,h3,h4,h5,h6\{[^}]*\}/gi, (match) =>
        match
          .replace(/font-size:inherit;?/gi, '')
          .replace(/font-weight:inherit;?/gi, ''),
      );
      fs.writeFileSync(cssPath, cssContent, 'utf-8');
      console.log('✅ Removed h1-h6 inherit rules from style.css');

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
      for (const entry of entries.filter((n) => n.name !== 'node_modules')) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findHtmlFiles(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          htmlFiles.push(fullPath);
        }
      }
    }

    findHtmlFiles(sitePath);
    console.log(htmlFiles);
    const linkTag = `<link rel="stylesheet" href="/css/style.css">`;

    for (const filePath of htmlFiles) {
      let html = fs.readFileSync(filePath, 'utf-8');

      // 1. Прибираємо всі старі style.css (будь-які шляхи)
      html = html.replace(
        /<link[^>]+href=["'][^"']*style\.css["'][^>]*>\s*/gi,
        '',
      );

      // 2. Якщо є <head ...> — вставляємо одразу після нього
      if (/<head[^>]*>/i.test(html)) {
        html = html.replace(
          /<head[^>]*>/i,
          (match) => `${match}\n  ${linkTag}`,
        );
      } else {
        html = `${linkTag}\n${html}`;
      }
      console.log('----- PATCHED HTML START -----');
      console.log(html.slice(0, 500));
      console.log('----- PATCHED HTML END -----');

      fs.writeFileSync(filePath, html, 'utf-8');
      console.log(`✅ Added Tailwind link to ${filePath}`);
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
    const extractPath = path.join(uploadDir, id);

    if (fs.existsSync(extractPath)) {
      try {
        if (os.platform() === 'win32') {
          // видалення папки на Windows
          execSync(`rd /s /q "${extractPath}"`);
        } else {
          // Unix
          execSync(`rm -rf "${extractPath}"`);
        }
        console.log('Deleted site folder:', extractPath);
      } catch (err) {
        console.error('Failed to delete site folder:', err);
        throw err;
      }
    }

    return this.siteRepo.delete(id);
  }
}
