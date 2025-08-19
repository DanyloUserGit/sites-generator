import { TemplateService } from './template.service';
import { Controller, Get, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';

@Controller('template')
export class TemplateController {
  constructor(
    private readonly templateService: TemplateService,
    private readonly redisService: RedisService,
  ) {}

  @Get('/:id')
  async saveDataJsonAndStartBuild(
    @Param() id: { id: string },
    @Req() req: Request,
  ) {
    return await this.templateService.saveDataJsonAndStartBuild(
      id.id,
      req.headers.host.split(':')[0],
    );
  }

  @Get('status/:siteId')
  async getStatus(@Param('siteId') siteId: string) {
    const status = await this.redisService.get<string>(`site-status:${siteId}`);
    return { status };
  }
}
