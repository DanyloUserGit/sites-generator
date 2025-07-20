import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(AppConfigService);
  const port = config.port;
  app.setGlobalPrefix('api');

  await app.listen(port);
  console.log(`Running on: http://localhost:${port}`);
}
bootstrap();
