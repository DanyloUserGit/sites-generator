import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DeploymentService } from './deployment.service';

@Controller('deployment')
export class DeploymentController {
  constructor(private readonly deploymentService: DeploymentService) {}

  @Post()
  async deploySite(@Body() body: { siteId: string }) {
    return await this.deploymentService.deploySite(body.siteId);
  }
  @Get('status/:id')
  async getStatus(@Param('id') id: string) {
    return await this.deploymentService.getStatus(id);
  }
  @Get('url/:id')
  async getUrl(@Param('id') id: string) {
    return await this.deploymentService.getUrl(id);
  }
}
