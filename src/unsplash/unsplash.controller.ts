import { Body, Controller, Post } from '@nestjs/common';
import { UnsplashService } from './unsplash.service';

@Controller('unsplash')
export class UnsplashController {
  constructor(private readonly unsplashService: UnsplashService) {}

  @Post('/')
  async getImg(@Body() body: { keyword: string }) {
    const res = await this.unsplashService.getImageUrlByKeyword(body.keyword);
    return res;
  }
}
