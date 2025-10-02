import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CsvService } from './csv.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { CurrentUserId } from 'src/auth/CurrentUserId';

@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  @Post('create-from-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUserId() userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const result = await this.csvService.createFromCSV(userId, file.buffer);
    return result;
  }
}
