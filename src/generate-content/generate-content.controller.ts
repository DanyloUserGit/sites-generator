import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { GenerateContentService } from './generate-content.service';
import { ManagePromptsService } from './manage-prompts.service';

@Controller('generate-content')
export class GenerateContentController {
  constructor(
    private readonly generateContentService: GenerateContentService,
    private readonly redisService: RedisService,
    private readonly managePromptsService: ManagePromptsService,
  ) {}
  @Get('site-status/:siteId')
  async getSiteStatus(@Param('siteId') siteId: string) {
    const status = await this.redisService.get(`site-status:${siteId}`);
    if (!status) {
      throw new NotFoundException('Status not found');
    }
    return status;
  }

  @Post('generate-site')
  async generateSite(@Body() body: { siteId: string }) {
    await this.generateContentService.generateSite(body.siteId);
  }

  @Post('prompt-site')
  createPromptSite(@Body() data: any) {
    return this.managePromptsService.createPromptSite(data);
  }

  @Get('prompt-site')
  getAllPromptSites() {
    return this.managePromptsService.getAllPromptSites();
  }

  @Get('prompt-site/:id')
  async getPromptSiteById(@Param('id') id: string) {
    const prompt = await this.managePromptsService.getPromptSiteById(id as any);
    if (!prompt) throw new NotFoundException('PromptSite not found');
    return prompt;
  }

  @Put('prompt-site/:id')
  updatePromptSite(@Param('id') id: string, @Body() updates: any) {
    return this.managePromptsService.updatePromptSite(id as any, updates);
  }

  @Delete('prompt-site/:id')
  deletePromptSite(@Param('id') id: string) {
    return this.managePromptsService.deletePromptSite(id as any);
  }

  @Post('prompt-seo')
  createPromptPageSeo(@Body() data: any) {
    return this.managePromptsService.createPromptPageSeo(data);
  }

  @Get('prompt-seo')
  getAllPromptPageSeos() {
    return this.managePromptsService.getAllPromptPageSeos();
  }

  @Get('prompt-seo/:id')
  async getPromptPageSeoById(@Param('id') id: string) {
    const prompt = await this.managePromptsService.getPromptPageSeoById(
      id as any,
    );
    if (!prompt) throw new NotFoundException('PromptPageSeo not found');
    return prompt;
  }

  @Put('prompt-seo/:id')
  updatePromptPageSeo(@Param('id') id: string, @Body() updates: any) {
    return this.managePromptsService.updatePromptPageSeo(id as any, updates);
  }

  @Delete('prompt-seo/:id')
  deletePromptPageSeo(@Param('id') id: string) {
    return this.managePromptsService.deletePromptPageSeo(id as any);
  }

  @Post('prompt-content')
  createPromptPageContent(@Body() data: any) {
    return this.managePromptsService.createPromptPageContent(data);
  }

  @Get('prompt-content')
  getAllPromptPageContents() {
    return this.managePromptsService.getAllPromptPageContents();
  }

  @Get('prompt-content/:id')
  async getPromptPageContentById(@Param('id') id: string) {
    const prompt = await this.managePromptsService.getPromptPageContentById(
      id as any,
    );
    if (!prompt) throw new NotFoundException('PromptPageContent not found');
    return prompt;
  }

  @Put('prompt-content/:id')
  updatePromptPageContent(@Param('id') id: string, @Body() updates: any) {
    return this.managePromptsService.updatePromptPageContent(
      id as any,
      updates,
    );
  }

  @Delete('prompt-content/:id')
  deletePromptPageContent(@Param('id') id: string) {
    return this.managePromptsService.deletePromptPageContent(id as any);
  }
}
