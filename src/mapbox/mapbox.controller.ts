import { Body, Controller, Post } from '@nestjs/common';
import { MapboxService } from './mapbox.service';

@Controller('mapbox')
export class MapboxController {
  constructor(private readonly mapboxService: MapboxService) {}

  @Post('/')
  async getCityPhoto(@Body() body: { city: string }) {
    const res = await this.mapboxService.getCityMapImage(body.city);
    return res;
  }
}
