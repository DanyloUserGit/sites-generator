import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSettings } from './entities/user-settings.entity';

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly repo: Repository<UserSettings>,
  ) {}

  async getUserSettings(userId: string) {
    return this.repo.findOne({ where: { userId } });
  }

  getAllAiProviders(): string[] {
    return [
      'openai/gpt-4o-mini',
      'openai/gpt-4o',
      'anthropic/claude-3-sonnet',
      'google/gemini-pro',
      'mistral/medium',
    ];
  }

  getAllTranslateProviders(): string[] {
    return ['google-translate', 'deepl'];
  }

  async updateAiProvider(
    userId: string,
    aiProvider: string,
  ): Promise<UserSettings> {
    let settings = await this.repo.findOne({ where: { userId } });

    if (!settings) {
      settings = this.repo.create({ userId, aiProvider });
    } else {
      settings.aiProvider = aiProvider;
    }

    return this.repo.save(settings);
  }

  async updateTranslateProvider(
    userId: string,
    translateProvider: string,
  ): Promise<UserSettings> {
    let settings = await this.repo.findOne({ where: { userId } });

    if (!settings) {
      settings = this.repo.create({ userId, translateProvider });
    } else {
      settings.translateProvider = translateProvider;
    }

    return this.repo.save(settings);
  }

  async createUserSettings(userId: string): Promise<UserSettings> {
    const existing = await this.repo.findOne({ where: { userId } });
    if (existing) return existing;

    const settings = this.repo.create({
      userId,
      aiProvider: 'openai:gpt-4o-mini',
      translateProvider: 'google-translate',
    });

    return this.repo.save(settings);
  }
}
