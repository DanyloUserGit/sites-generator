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

  @Post('create-from-input')
  async createFromInput(@Body() body: CreateSiteDTO) {
    return await this.sitesService.createSite(body);
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
}
