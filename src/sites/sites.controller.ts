import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CrudSitesService } from './crud-sites.service';
import { CreateSiteDTO } from './dto/create-site.dto';
import { SitesService } from './sites.service';
import { CurrentUserId } from 'src/auth/CurrentUserId';

@Controller('sites')
export class SitesController {
  constructor(
    private readonly sitesService: SitesService,
    private readonly crudSitesService: CrudSitesService,
  ) {}

  @Get()
  async getSites(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
  ) {
    return await this.sitesService.getSitesByPage(page, limit);
  }

  @Get('get-all')
  async getAllSites(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
  ) {
    return await this.sitesService.getSites(page, limit);
  }

  @Post('create-from-input')
  async createFromInput(
    @Body() body: CreateSiteDTO,
    @CurrentUserId() userId: string,
  ) {
    return await this.sitesService.createSite(userId, body);
  }

  @Get('site/:id')
  async getSiteInfo(@Param('id') id: string) {
    return await this.crudSitesService.getSite(id);
  }

  @Put('site/:id')
  async updateSite(@Param('id') id: string, @Body() updates: any) {
    return await this.crudSitesService.updateSite(id, updates);
  }

  @Delete('site/:id')
  async deleteSite(@Param('id') id: string) {
    return await this.crudSitesService.deleteSite(id);
  }

  @Get('site-pages/:id')
  async getSitePages(@Param('id') id: string) {
    return await this.crudSitesService.getSitePages(id);
  }
  @Get('site-page-tab/:id')
  async getSitePageTab(@Param('id') id: string, @Query('tab') tab: string) {
    return await this.crudSitesService.getSitePageTab(id, tab);
  }
  @Put('site-page-tab/:id')
  async updateSitePageTab(
    @Param('id') id: string,
    @Query('tab') tab: string,
    @Body() updates: any,
  ) {
    return await this.crudSitesService.updateSitePageTab(id, tab, updates);
  }
}
