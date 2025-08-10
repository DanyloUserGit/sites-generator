import { TemplateService } from './template.service';
import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
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

  @Get('host/:siteId')
  async getSiteHost(
    @Param('siteId') siteId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const host = req.headers.host.split(':')[0];
    const siteUrl = await this.templateService.getSiteHost(siteId, host);

    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      'Surrogate-Control': 'no-store',
    });

    if (!siteUrl) {
      return res.status(404).json({ error: 'Site not running' });
    }
    console.log('Site URL:', siteUrl);
    return res.json({ siteUrl });
  }
}
