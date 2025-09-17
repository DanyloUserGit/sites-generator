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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GenerateFromRelumeService } from './generate-from-relume.service';
import { CreateSiteDTO } from 'src/sites/dto/create-site.dto';
import { GenerateSeoFromRelumeService } from './generate-seo-from-relume.service';

@Controller('generate-from-relume')
export class GenerateFromRelumeController {
  constructor(
    private readonly relumeService: GenerateFromRelumeService,
    private readonly generateSeoService: GenerateSeoFromRelumeService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createSite(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateSiteDTO,
  ) {
    return this.relumeService.createSite(file, body);
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

  @Delete(':id')
  async deleteSite(@Param('id') id: string) {
    return this.relumeService.deleteSite(+id);
  }
}
