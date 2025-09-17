import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PromptPageSeo } from 'src/generate-content/entities/page-entities/prompt-page-seo.entity';
import { OpenAIService } from 'src/generate-content/openAI.service';
import { Repository } from 'typeorm';
import { RelumePageSeo } from './entities/relume-page-seo';
import { RelumePage } from './entities/relume-page.entity';
import { RelumeSite } from './entities/relume-site.entity';

@Injectable()
export class GenerateSeoFromRelumeService {
  constructor(
    private readonly openAIService: OpenAIService,

    @InjectRepository(RelumeSite)
    private readonly siteRepo: Repository<RelumeSite>,
    @InjectRepository(RelumePage)
    private readonly pageRepo: Repository<RelumePage>,
    @InjectRepository(RelumePageSeo)
    private readonly pageSeoRepository: Repository<RelumePageSeo>,

    @InjectRepository(PromptPageSeo)
    private readonly promptPageSeoRepository: Repository<PromptPageSeo>,
  ) {}

  private async generatePageSeo(pageId: string) {
    try {
      const seoPrompt = await this.promptPageSeoRepository.findOneBy({});
      if (!seoPrompt) throw new Error('SEO prompt not found');

      const page = await this.pageRepo.findOne({
        where: { id: pageId },
        relations: ['site'],
      });
      if (!page) throw new Error('Page not found');

      const { site } = page;
      if (!site) throw new Error('Site not found');

      const pageSeo = this.pageSeoRepository.create({ page });

      const fieldsToGenerate = [
        { fieldName: 'metaTitle', prompt: seoPrompt.metaTitle },
        { fieldName: 'metaDescription', prompt: seoPrompt.metaDescription },
        { fieldName: 'keywords', prompt: seoPrompt.keywords },
        { fieldName: 'schemaOrg', prompt: seoPrompt.schemaOrg },
      ];

      for (const field of fieldsToGenerate) {
        if (!field.prompt) continue;

        // Генерація поля через OpenAI
        const seoRes = await this.openAIService.generateField({
          aiRole: seoPrompt.aiRole,
          fieldPrompt: field.prompt,
          page: page.name,
          siteCity: site.city,
          siteLang: site.language,
          siteServices: site.services,
          companyName: site.companyName || site.name,
          domain: site.domain,
          fieldName: field.fieldName,
        });

        if (!seoRes) throw new Error(`${field.fieldName} generation failed`);

        // Чистимо schemaOrg і зберігаємо в базу
        if (field.fieldName === 'schemaOrg') {
          pageSeo.schemaOrg = this.cleanSchemaOrg(seoRes);
        } else {
          // Гарантуємо, що рядок обробляється як юнікод
          pageSeo[field.fieldName] = seoRes;
        }
      }

      // Зберігаємо у базу, переконавшись, що таблиця та колонки в utf8mb4
      await this.pageSeoRepository.save(pageSeo);
    } catch (error) {
      console.error('generatePageSeo error:', error);
      throw error;
    }
  }

  public async generateSiteSeo(siteId: string) {
    const site = await this.siteRepo.findOne({
      where: { id: siteId },
      relations: ['pages'],
    });
    if (!site) throw new Error('Site not found');

    for (const page of site.pages) {
      try {
        await this.generatePageSeo(page.id);
      } catch (err) {
        console.error(
          `❌ SEO generation failed for page ${page.name}:`,
          err.message,
        );
      }
    }

    return {
      message: `SEO generated for ${site.pages.length} pages of site ${site.name}`,
    };
  }

  private cleanSchemaOrg(raw: string): Record<string, any> {
    let cleaned = raw.trim();

    cleaned = cleaned.replace(/^```(?:html|json)?\n?/i, '');
    cleaned = cleaned.replace(/```$/i, '');
    cleaned = cleaned
      .replace(/<script[^>]*>/gi, '')
      .replace(/<\/script>/gi, '');
    cleaned = cleaned.trim();

    try {
      return JSON.parse(cleaned);
    } catch (err) {
      console.error('❌ Cleaned schemaOrg is invalid JSON:', cleaned);
      throw new Error('SchemaOrg parsing failed: ' + err.message);
    }
  }
}
