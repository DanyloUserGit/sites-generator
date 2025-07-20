import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SitesService } from './sites.service';
import { CreateSiteDTO } from './dto/create-site.dto';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

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
}
