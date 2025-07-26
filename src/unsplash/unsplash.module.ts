import { Module } from '@nestjs/common';
import { UnsplashService } from './unsplash.service';
import { AppConfigModule } from 'src/config/config.module';
import { UnsplashController } from './unsplash.controller';

@Module({
  imports: [AppConfigModule],
  providers: [UnsplashService],
  controllers: [UnsplashController],
  exports: [UnsplashService],
})
export class UnsplashModule {}
