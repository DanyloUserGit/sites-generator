import { Controller, Get, Param, Query } from '@nestjs/common';
import { LanguagesService } from './languages.service';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get('/')
  async searchLanguages(@Query('query') query: string) {
    return this.languagesService.getThreeLangs(query);
  }
}
