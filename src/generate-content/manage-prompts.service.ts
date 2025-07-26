import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromptSite } from './entities/prompt-site.entity';
import { PromptPageSeo } from './entities/page-entities/prompt-page-seo.entity';
import { PromptPageContent } from './entities/page-entities/prompt-page-content.entity';

@Injectable()
export class ManagePromptsService {
  constructor(
    @InjectRepository(PromptSite)
    private readonly promptSiteRepository: Repository<PromptSite>,

    @InjectRepository(PromptPageSeo)
    private readonly promptPageSeoRepository: Repository<PromptPageSeo>,

    @InjectRepository(PromptPageContent)
    private readonly promptPageContentRepository: Repository<PromptPageContent>,
  ) {}

  async createPromptSite(data: Partial<PromptSite>) {
    const prompt = this.promptSiteRepository.create(data);
    return await this.promptSiteRepository.save(prompt);
  }

  async getAllPromptSites() {
    return await this.promptSiteRepository.find();
  }

  async getPromptSiteById(id: string) {
    return await this.promptSiteRepository.findOne({ where: { id } });
  }

  async updatePromptSite(id: string, updates: Partial<PromptSite>) {
    await this.promptSiteRepository.update(id, updates);
    return await this.getPromptSiteById(id);
  }

  async deletePromptSite(id: string) {
    return await this.promptSiteRepository.delete(id);
  }

  async createPromptPageSeo(data: Partial<PromptPageSeo>) {
    const prompt = this.promptPageSeoRepository.create(data);
    return await this.promptPageSeoRepository.save(prompt);
  }

  async getAllPromptPageSeos() {
    return await this.promptPageSeoRepository.find();
  }

  async getPromptPageSeoById(id: string) {
    return await this.promptPageSeoRepository.findOne({ where: { id } });
  }

  async updatePromptPageSeo(id: string, updates: Partial<PromptPageSeo>) {
    await this.promptPageSeoRepository.update(id, updates);
    return await this.getPromptPageSeoById(id);
  }

  async deletePromptPageSeo(id: string) {
    return await this.promptPageSeoRepository.delete(id);
  }

  async createPromptPageContent(data: Partial<PromptPageContent>) {
    const prompt = this.promptPageContentRepository.create(data);
    return await this.promptPageContentRepository.save(prompt);
  }

  async getAllPromptPageContents() {
    return await this.promptPageContentRepository.find();
  }

  async getPromptPageContentById(id: string) {
    return await this.promptPageContentRepository.findOne({ where: { id } });
  }

  async updatePromptPageContent(
    id: string,
    updates: Partial<PromptPageContent>,
  ) {
    await this.promptPageContentRepository.update(id, updates);
    return await this.getPromptPageContentById(id);
  }

  async deletePromptPageContent(id: string) {
    return await this.promptPageContentRepository.delete(id);
  }
}
