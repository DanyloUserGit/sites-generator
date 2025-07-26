import { Module } from '@nestjs/common';
import { MapboxService } from './mapbox.service';
import { MapboxController } from './mapbox.controller';
import { AppConfigModule } from 'src/config/config.module';

@Module({
  imports: [AppConfigModule],
  providers: [MapboxService],
  controllers: [MapboxController],
  exports: [MapboxService],
})
export class MapboxModule {}
