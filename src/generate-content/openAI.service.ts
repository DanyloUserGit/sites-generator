import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { AppConfigService } from 'src/config/config.service';
import { HugoFreshFivePages, Navigation } from 'src/types';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;
  constructor(private readonly config: AppConfigService) {
    this.openai = new OpenAI({ apiKey: config.config.openai_key });
  }
  async generateField({
    aiRole,
    fieldPrompt,
    page,
    siteLang,
    siteServices,
    siteCity,
    companyName,
    seoData,
    domain,
    fieldName,
  }: {
    aiRole: string;
    fieldPrompt: string;
    page: string;
    siteLang: string;
    siteServices: string;
    siteCity: string;
    companyName: string;
    seoData?: string;
    domain?: string;
    fieldName?: string;
  }): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `${aiRole}. ${fieldPrompt} for page: "${page}". ${fieldName === 'schemaOrg' ? `For domain: ${domain}` : ''} ${seoData ? seoData : ''}
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
  async generateNavigation(siteLang: string) {
    try {
      const navValues = Object.values(HugoFreshFivePages);

      const navigation = await Promise.all(
        navValues.map(async (nav) => {
          const response = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `Translate: ${nav}. Lang: "${siteLang}".`,
              },
            ],
            temperature: 0.5,
          });

          return {
            slug: `/${nav}`,
            linkName: response.choices[0].message.content?.trim(),
          };
        }),
      );

      return navigation;
    } catch (error) {
      throw error;
    }
  }
  async translate(siteLang: string, text: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Translate: ${text}. IMPORTANT JUST TRANSLATE THE WORD AND do NOT add ANYTHING Lang: "${siteLang}".  `,
          },
        ],
        temperature: 0.5,
      });

      return response.choices[0].message.content?.trim();
    } catch (error) {
      throw error;
    }
  }
  async generateSvg({ companyName }: { companyName: string }): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Generate a unique, modern, and creative favicon in clean SVG code for the company named:
          ${companyName}
          The logo should go beyond just displaying the company name on a plain background — create an interesting and visually appealing design that reflects the company’s industry, values, or brand personality.
          Use balanced shapes, subtle symbolism, and a harmonious color palette suitable for digital and print use.
          The logo must be scalable, simple yet memorable, and convey professionalism and creativity.
          Return ONLY the raw SVG code, without any additional text, explanations, or wrappers.
          Do NOT include the data:image/svg+xml;utf8, prefix — I will add it myself if needed.
          Ensure the SVG is valid and optimized for web usage.`,
        },
      ],
      temperature: 0.5,
    });
    return response.choices[0].message.content?.trim();
  }
}
