import { Injectable } from '@nestjs/common';
import { OpenrouterService } from './openrouter.service';
import { TranslationService } from './translation.service';
import { UserSettingsService } from 'src/user-settings/user-settings.service';

@Injectable()
export class AiService {
  constructor(
    private readonly openRouter: OpenrouterService,
    private readonly translator: TranslationService,
    private readonly userSettingsService: UserSettingsService,
  ) {}

  async generateContent(prompt: string, userId: string): Promise<string> {
    try {
      const settings = await this.userSettingsService.getUserSettings(userId);
      return await this.openRouter.runLLM(prompt, settings.aiProvider);
    } catch (error) {
      throw error;
    }
  }

  async improveText(text: string, userId: string): Promise<string> {
    try {
      const settings = await this.userSettingsService.getUserSettings(userId);
      return await this.generateContent(
        `Optimise text:\n${text}`,
        settings.aiProvider,
      );
    } catch (error) {
      throw error;
    }
  }

  async shortenText(text: string, userId: string): Promise<string> {
    try {
      const settings = await this.userSettingsService.getUserSettings(userId);
      return await this.generateContent(
        `Shorten the text:\n${text}`,
        settings.aiProvider,
      );
    } catch (error) {
      throw error;
    }
  }

  async expandText(text: string, userId: string): Promise<string> {
    try {
      const settings = await this.userSettingsService.getUserSettings(userId);
      return await this.generateContent(
        `Expand text:\n${text}`,
        settings.aiProvider,
      );
    } catch (error) {
      throw error;
    }
  }

  async changeTone(
    text: string,
    tone: 'formal' | 'informal',
    userId: string,
  ): Promise<string> {
    try {
      const settings = await this.userSettingsService.getUserSettings(userId);
      return this.generateContent(
        `Rewrite text in ${tone} tone:\n${text}`,
        settings.aiProvider,
      );
    } catch (error) {
      throw error;
    }
  }

  async translateText(
    text: string,
    targetLang: string,
    userId: string,
  ): Promise<string> {
    try {
      const settings = await this.userSettingsService.getUserSettings(userId);
      if (
        settings.translateProvider === 'google-translate' ||
        settings.translateProvider === 'deepl'
      ) {
        return this.translator.translate(
          text,
          targetLang,
          settings.translateProvider,
        );
      }
      throw new Error(
        `Wrong translate provider: ${settings.translateProvider}`,
      );
    } catch (error) {
      throw error;
    }
  }
}
