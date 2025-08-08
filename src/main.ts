import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(AppConfigService);
  const port = config.port;
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  await app.listen(port);
  console.log(`Running on: http://localhost:${port}`);
}
bootstrap();
