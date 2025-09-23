import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
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

  @Get('relume-url/:id')
  async getRelumeUrl(@Param('id') id: string) {
    return await this.deploymentService.relumeGetUrl(id);
  }

  @Post('relume/:homeId')
  async relumeDeploySite(
    @Param('homeId') homeId: string,
    @Query('siteId') siteId: string,
  ) {
    return await this.deploymentService.relumeDeploySite(siteId, homeId);
  }
  @Delete('relume/:id')
  async relumeDeleteSite(@Param('id') id: string) {
    return await this.deploymentService.relumeDeleteSiteWithVercel(id);
  }
}
