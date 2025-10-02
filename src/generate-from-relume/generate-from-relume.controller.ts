import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
  Query,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GenerateFromRelumeService } from './generate-from-relume.service';
import { CreateSiteDTO } from 'src/sites/dto/create-site.dto';
import { GenerateSeoFromRelumeService } from './generate-seo-from-relume.service';
import { CurrentUserId } from 'src/auth/CurrentUserId';

@Controller('generate-from-relume')
export class GenerateFromRelumeController {
  constructor(
    private readonly relumeService: GenerateFromRelumeService,
    private readonly generateSeoService: GenerateSeoFromRelumeService,
  ) {}

  @Get('pages/:id')
  async searchLanguages(
    @Param('id') id: string,
    @Query('query') query: string,
  ) {
    return this.relumeService.searchPages(id, query);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createSite(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateSiteDTO,
    @CurrentUserId() userId: string,
  ) {
    return this.relumeService.createSite(userId, file, body);
  }

  @Post('generate-seo/:id')
  async generateSiteSeo(@Param('id') id: string) {
    return await this.generateSeoService.generateSiteSeo(id);
  }

  @Get()
  async getSites(@Query('page') page: number = 1) {
    return this.relumeService.getSites(page, 5);
  }

  @Get(':id')
  async getSite(@Param('id') id: string) {
    return this.relumeService.getSiteById(id);
  }

  @Put(':id')
  async updateSite(@Param('id') id: string, @Body() updates: any) {
    return await this.relumeService.updateSite(id, updates);
  }

  @Get('site-pages/:id')
  async getSitePages(@Param('id') id: string) {
    return await this.relumeService.getSitePages(id);
  }
  @Get('site-page-tab/:id')
  async getSitePageTab(@Param('id') id: string, @Query('tab') tab: string) {
    return await this.relumeService.getSitePageTab(id, tab);
  }
  @Put('site-page-tab/:id')
  async updateSitePageTab(
    @Param('id') id: string,
    @Query('tab') tab: string,
    @Body() updates: any,
  ) {
    return await this.relumeService.updateSitePageTab(id, tab, updates);
  }
  @Get('build-site/:id')
  async buildSite(@Param('id') id: string) {
    return await this.relumeService.buildSite(id);
  }
  @Post('set-home')
  async setHome(
    @Body() { siteId, pageId }: { siteId: string; pageId: string },
  ) {
    return await this.relumeService.setHomePage(siteId, pageId);
  }
  @Delete(':id')
  async deleteSite(@Param('id') id: string) {
    return this.relumeService.deleteSite(id);
  }
}
