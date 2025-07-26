import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;
  constructor(private readonly config: AppConfigService) {
    this.openai = new OpenAI({ apiKey: config.config.openai_key });
  }
  // aiRole = "You are an SEO copywriter"
  async generateField({
    aiRole,
    fieldPrompt,
    page,
    siteLang,
    siteServices,
    siteCity,
    companyName,
    seoData,
  }: {
    aiRole: string;
    fieldPrompt: string;
    page: string;
    siteLang: string;
    siteServices: string;
    siteCity: string;
    companyName: string;
    seoData?: string;
  }): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `${aiRole}. ${fieldPrompt} for page: "${page}". ${seoData ? seoData : ''}
           Company: "${companyName}". Company services: "${siteServices}". Company city: "${siteCity}". Site lang: "${siteLang}".`,
        },
      ],
      temperature: 0.5,
    });
    return response.choices[0].message.content?.trim();
  }
  async generateSiteInfo({
    aiRole,
    fieldPrompt,
    siteLang,
    siteServices,
    siteCity,
  }: {
    aiRole: string;
    fieldPrompt: string;
    siteLang: string;
    siteServices: string;
    siteCity: string;
  }): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `${aiRole}. ${fieldPrompt} for Company services: "${siteServices}". Company city: "${siteCity}". Site lang: "${siteLang}".`,
          },
        ],
        temperature: 0.5,
      });
      return response.choices[0].message.content?.trim();
    } catch (error) {
      throw error;
    }
  }
}
