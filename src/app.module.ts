import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import appConfig from './config/app.config';
import { AppConfigModule } from './config/config.module';
import { validationSchema } from './config/validation.schema';
import { DatabaseModule } from './database/database.module';
import { SitesModule } from './sites/sites.module';
import { AuthModule } from './auth/auth.module';
import { LanguagesModule } from './languages/languages.module';
import { CsvModule } from './csv/csv.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { GenerateContentModule } from './generate-content/generate-content.module';
import { RedisModule } from './redis/redis.module';
import { UnsplashModule } from './unsplash/unsplash.module';
import { MapboxModule } from './mapbox/mapbox.module';
import { TemplateModule } from './template/template.module';
import { DeploymentModule } from './deployment/deployment.module';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'out'),
      exclude: ['/api*'],
    }),
    AppConfigModule,
    DatabaseModule,
    SitesModule,
    AuthModule,
    LanguagesModule,
    CsvModule,
    GenerateContentModule,
    RedisModule,
    UnsplashModule,
    MapboxModule,
    TemplateModule,
    DeploymentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
