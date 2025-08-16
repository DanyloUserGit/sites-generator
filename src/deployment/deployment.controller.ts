import { Body, Controller, Post } from '@nestjs/common';
import { DeploymentService } from './deployment.service';

@Controller('deployment')
export class DeploymentController {
  constructor(private readonly deploymentService: DeploymentService) {}

  @Post()
  async deployVercel(@Body() body: { siteId: string }) {
    return this.deploymentService.deployStaticSite(body.siteId);
  }

  @Post('cloudflare')
  async deployCloudflare(
    @Body()
    body: {
      zoneName: string;
      recordName: string;
      content: string;
      type?: 'CNAME' | 'A';
    },
  ) {
    return this.deploymentService.deployToCloudflare(
      body.zoneName,
      body.recordName,
      body.content,
      body.type || 'CNAME',
    );
  }
}
