import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageContent } from 'src/sites/entities/page-entities/page-content.entiy';
import { PageSeo } from 'src/sites/entities/page-entities/page-seo.entity';
import { Page } from 'src/sites/entities/page-entities/page.entity';
import { Site } from 'src/sites/entities/site.entity';
import { Repository } from 'typeorm';
import { PromptPageContent } from './entities/page-entities/prompt-page-content.entity';
import { PromptPageSeo } from './entities/page-entities/prompt-page-seo.entity';
import { PromptSite } from './entities/prompt-site.entity';
import { OpenAIService } from './openAI.service';
import { HugoFreshFivePages } from 'src/types';
import { RedisService } from 'src/redis/redis.service';
import { UnsplashService } from 'src/unsplash/unsplash.service';
import { MapboxService } from 'src/mapbox/mapbox.service';

@Injectable()
export class GenerateContentService {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    @InjectRepository(PageSeo)
    private readonly pageSeoRepository: Repository<PageSeo>,
    @InjectRepository(PageContent)
    private readonly pageContentRepository: Repository<PageContent>,
    @InjectRepository(PromptSite)
    private readonly promptSiteRepository: Repository<PromptSite>,
    @InjectRepository(PromptPageSeo)
    private readonly promptPageSeoRepository: Repository<PromptPageSeo>,
    @InjectRepository(PromptPageContent)
    private readonly promptPageContentRepository: Repository<PromptPageContent>,
    private readonly openAIService: OpenAIService,
    private readonly redisService: RedisService,
    private readonly unsplashService: UnsplashService,
    private readonly mapboxService: MapboxService,
  ) {}
  private async updateGenerationStatus(
    siteId: string,
    status: string,
    data: Partial<any> = {},
  ) {
    await this.redisService.set(`site-status:${siteId}`, {
      siteId,
      status,
      isCompleted: false,
      isError: false,
      updatedAt: new Date().toISOString(),
      ...data,
    });
  }
  private async generateSiteInfo(siteId: string) {
    try {
      const sitePrompt = await this.promptSiteRepository.findOneBy({});
      if (!sitePrompt) throw new Error('Site prompt not found');
      const site = await this.siteRepository.findOneBy({ id: siteId });
      if (!site) throw new Error('Site not found');

      const { aiRole } = sitePrompt;
      const companyNameRes = await this.openAIService.generateSiteInfo({
        aiRole,
        fieldPrompt: sitePrompt.companyName,
        siteCity: site.city,
        siteLang: site.language,
        siteServices: site.services,
      });
      if (!companyNameRes) throw new Error('Company name generation failed');
      const slug =
        '/' +
        companyNameRes.toLowerCase().replaceAll(' ', '-').replaceAll('"', '');
      const companyName = companyNameRes.replaceAll('"', '');
      site.companyName = companyName;
      site.slug = slug;
      const svg = await this.generateFaviconSvg(companyName);
      const encoded = encodeURIComponent(svg);
      const dataUrl = `data:image/svg+xml;utf8,${encoded}`;
      site.favIcon = dataUrl;
      return await this.siteRepository.save(site);
    } catch (error) {
      throw error;
    }
  }
  async generateSite(siteId: string) {
    try {
      const resSiteInfo = await this.generateSiteInfo(siteId);
      if (!resSiteInfo) throw new Error('Error while generating site info');
      const pages = Object.values(HugoFreshFivePages);
      for (const pageName of pages) {
        await this.updateGenerationStatus(
          siteId,
          `Page generating: ${pageName}`,
          {
            currentPage: pageName,
          },
        );
        await this.generatePage(siteId, pageName);
      }
      await this.updateGenerationStatus(siteId, 'Generation completed', {
        isCompleted: true,
      });
    } catch (error) {
      await this.updateGenerationStatus(siteId, 'Error in site generation', {
        isError: true,
        errorMessage: error.message,
      });
      throw error;
    }
  }
  private async generatePage(siteId: string, pageName: string) {
    try {
      const site = await this.siteRepository.findOne({ where: { id: siteId } });

      const pageSlug = '/' + pageName.toLowerCase().replaceAll(' ', '-');
      const page = this.pageRepository.create({
        site,
        pageName,
        slug: pageSlug,
      });
      const savedPage = await this.pageRepository.save(page);
      await this.generatePageSeo(savedPage.id);
      await this.generatePageContent(savedPage.id);
      await this.generateBGImage(siteId, savedPage.id);
      await this.generateUniqueCtaImage(siteId, savedPage.id);
      await this.generateMapImage(siteId, savedPage.id);
    } catch (error) {
      throw error;
    }
  }
  private async generatePageContent(pageId: string) {
    try {
      const contentPrompt = await this.promptPageContentRepository.findOneBy(
        {},
      );
      if (!contentPrompt) throw new Error('Content prompt not found');
      const page = await this.pageRepository.findOne({
        where: { id: pageId },
        relations: ['site'],
      });
      if (!page) throw new Error('Page not found');
      const { site } = page;
      if (!site) throw new Error('Site not found');
      const pageSeo = await this.pageSeoRepository.findOne({
        where: { id: page.seo.id },
      });
      if (!pageSeo) throw new Error('Page seo not found');
      const pageContent = this.pageContentRepository.create({
        page,
      });
      const seoData = `page seo info: metaTitle:${pageSeo.metaTitle}, metaDescription:${pageSeo.metaDescription},
      keywords:${pageSeo.keywords}`;
      const fieldsToGenerate = [
        { fieldName: 'heroTitle', prompt: contentPrompt.heroTitle },
        { fieldName: 'heroDescription', prompt: contentPrompt.heroDescription },
        { fieldName: 'heroCtaText', prompt: contentPrompt.heroCta },
        { fieldName: 'benefits', prompt: contentPrompt.benefitsList },
        { fieldName: 'formText', prompt: contentPrompt.formText },
      ];
      for (const field of fieldsToGenerate) {
        if (!field.prompt) continue;

        const contentRes = await this.openAIService.generateField({
          aiRole: contentPrompt.aiRole,
          fieldPrompt: field.prompt,
          page: page.pageName,
          siteCity: site.city,
          siteLang: site.language,
          siteServices: site.services,
          companyName: site.companyName,
          seoData,
        });

        if (!contentRes) {
          throw new Error(`${field.fieldName} generation failed`);
        }

        pageContent[field.fieldName] = contentRes;
      }

      await this.pageContentRepository.save(pageContent);
    } catch (error) {
      throw error;
    }
  }
  private async generatePageSeo(pageId: string) {
    try {
      const seoPrompt = await this.promptPageSeoRepository.findOneBy({});
      if (!seoPrompt) throw new Error('Seo prompt not found');
      const page = await this.pageRepository.findOne({
        where: { id: pageId },
        relations: ['site'],
      });
      if (!page) throw new Error('Page not found');
      const { site } = page;
      if (!site) throw new Error('Site not found');
      const pageSeo = this.pageSeoRepository.create({
        page,
      });

      const fieldsToGenerate = [
        { fieldName: 'metaTitle', prompt: seoPrompt.metaTitle },
        { fieldName: 'metaDescription', prompt: seoPrompt.metaDescription },
        { fieldName: 'keywords', prompt: seoPrompt.keywords },
        { fieldName: 'schemaOrg', prompt: seoPrompt.schemaOrg },
      ];

      for (const field of fieldsToGenerate) {
        if (!field.prompt) continue;

        const seoRes = await this.openAIService.generateField({
          aiRole: seoPrompt.aiRole,
          fieldPrompt: field.prompt,
          page: page.pageName,
          siteCity: site.city,
          siteLang: site.language,
          siteServices: site.services,
          companyName: site.companyName,
        });

        if (!seoRes) {
          throw new Error(`${field.fieldName} generation failed`);
        }

        pageSeo[field.fieldName] = seoRes;
      }

      await this.pageSeoRepository.save(pageSeo);
    } catch (error) {
      throw error;
    }
  }
  async generateBGImage(siteId: string, pageId: string) {
    try {
      const homePage = await this.pageRepository.findOne({
        where: {
          pageName: 'home',
          site: { id: siteId },
        },
        relations: ['seo'],
      });

      const pageToSave = await this.pageRepository.findOne({
        where: {
          id: pageId,
          site: { id: siteId },
        },
        relations: ['content'],
      });

      if (!homePage?.seo?.keywords) {
        throw new Error('❌ Cannot find generated keywords');
      }

      let keywords: string[];
      try {
        if (Array.isArray(homePage.seo.keywords)) {
          keywords = homePage.seo.keywords;
        } else if (typeof homePage.seo.keywords === 'string') {
          keywords = JSON.parse(homePage.seo.keywords);
        } else {
          throw new Error('Keywords format invalid');
        }
      } catch (e) {
        console.warn(
          'Cannot transform into keywords array',
          homePage.seo.keywords,
        );
        throw new Error('Invalid keywords format');
      }

      const cleanedKeywords = keywords
        .map((k) => String(k).replace(/"+/g, '').trim())
        .filter((k) => k.length > 0);

      if (cleanedKeywords.length === 0) {
        throw new Error('Empty keywords');
      }

      const imgKeyword = cleanedKeywords[0].split(' ')[0].toLowerCase();
      const imgUrl =
        await this.unsplashService.getImageUrlByKeyword(imgKeyword);

      if (!imgUrl) {
        throw new Error(`❌ Cannot find bg image by keyword: "${imgKeyword}"`);
      }

      pageToSave.content.backgroundImageUrl = imgUrl;
      await this.pageRepository.save(pageToSave);
      await this.pageContentRepository.save(pageToSave.content);
    } catch (error) {
      console.error('generateBGImage error:', error.message);
      throw error;
    }
  }

  private async generateUniqueCtaImage(siteId: string, pageId: string) {
    try {
      const page = await this.pageRepository.findOne({
        where: {
          id: pageId,
          site: { id: siteId },
        },
        relations: ['seo', 'content', 'site'],
      });
      const imgInfo = await this.unsplashService.getUniqueImage(
        page.seo.keywords,
        page.site.usedUnsplashIds || [],
      );
      if (!imgInfo) throw new Error('Cannot get unique CTA image');
      page.content.heroCtaImg = imgInfo.url;
      page.site.usedUnsplashIds = [
        ...(page.site.usedUnsplashIds || []),
        imgInfo.id,
      ];
      await this.pageRepository.save(page);
      await this.pageContentRepository.save(page.content);
      await this.siteRepository.save(page.site);
    } catch (error) {
      throw error;
    }
  }
  private async generateMapImage(siteId: string, pageId: string) {
    try {
      const page = await this.pageRepository.findOne({
        where: {
          id: pageId,
          site: { id: siteId },
        },
        relations: ['content', 'site'],
      });
      if (page.pageName != HugoFreshFivePages.Contact) return;
      const mapImgUrl = await this.mapboxService.getCityMapImage(
        page.site.city,
      );
      if (!mapImgUrl) throw new Error('Cannot get map image');
      page.content.mapImageUrl = mapImgUrl;
      await this.pageContentRepository.save(page.content);
    } catch (error) {
      throw error;
    }
  }
  async generateFaviconSvg(companyName: string): Promise<string> {
    const initials = companyName
      .replaceAll('"', '')
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();

    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
      <rect width="100%" height="100%" fill="#000" />
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
        font-size="25" fill="#fff" font-family="Arial, sans-serif">${initials}</text>
    </svg>
  `;
  }
}
