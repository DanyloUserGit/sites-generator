import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from 'src/config/config.module';
import { Site } from 'src/sites/entities/site.entity';
import { DeploymentController } from './deployment.controller';
import { DeploymentService } from './deployment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Site]), AppConfigModule],
  providers: [DeploymentService],
  controllers: [DeploymentController],
  exports: [DeploymentService],
})
export class DeploymentModule {}
