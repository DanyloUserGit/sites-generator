import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './config.types';

@Injectable()
export class AppConfigService {
  readonly config: AppConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      port: this.configService.get<number>('PORT', 3000),
      jwt_secret: this.configService.get<string>('JWT_SECRET'),
      openai_key: this.configService.get<string>('OPENAI_KEY'),
      database: {
        host: this.configService.get<string>('DB_HOST'),
        port: this.configService.get<number>('DB_PORT', 5432),
        username: this.configService.get<string>('DB_USER'),
        password: this.configService.get<string>('DB_PASS'),
        name: this.configService.get<string>('DB_NAME'),
      },
    };
  }

  get port() {
    return this.config.port;
  }

  get database() {
    return this.config.database;
  }
}
