import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeploymentModule } from 'src/deployment/deployment.module';
import { RedisModule } from 'src/redis/redis.module';
import { Site } from 'src/sites/entities/site.entity';
import { StaticSitesService } from './template-deploy.service';
import { TemplateController } from './template.controller';
import { TemplateService } from './template.service';

@Module({
  imports: [TypeOrmModule.forFeature([Site]), RedisModule, DeploymentModule],
  providers: [TemplateService, StaticSitesService],
  controllers: [TemplateController],
})
export class TemplateModule {}
