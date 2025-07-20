import { Module } from '@nestjs/common';
import { CsvService } from './csv.service';
import { CsvController } from './csv.controller';
import { SitesModule } from 'src/sites/sites.module';

@Module({
  imports: [SitesModule],
  providers: [CsvService],
  controllers: [CsvController],
})
export class CsvModule {}
