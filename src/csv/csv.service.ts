import { BadRequestException, Injectable } from '@nestjs/common';
import csv from 'csv-parser';
import { SitesService } from 'src/sites/sites.service';
import { SiteData } from 'src/types';
import { Readable } from 'stream';

@Injectable()
export class CsvService {
  constructor(private readonly sitesService: SitesService) {}
  async parseAndValidateCsv(fileBuffer: Buffer): Promise<SiteData> {
    try {
      const requiredFields = ['city', 'services', 'language'];
      const rows: SiteData[] = [];

      return new Promise((resolve, reject) => {
        const stream = Readable.from(fileBuffer)
          .pipe(csv())
          .on('data', (data) => {
            const isValid = requiredFields.every(
              (field) => data[field] && data[field].trim() !== '',
            );

            if (!isValid) {
              throw new Error('Invalid row skipped:' + data);
            }

            rows.push({
              city: data.city.trim(),
              services: data.services.trim(),
              language: data.language.trim(),
              domain: data.domain.trim(),
            });
          })
          .on('end', () => resolve(rows[0]))
          .on('error', () => {
            reject(new BadRequestException('Invalid CSV format'));
          });
      });
    } catch (error) {
      throw error;
    }
  }
  async createFromCSV(userId: string, fileBuffer: Buffer) {
    try {
      const data = await this.parseAndValidateCsv(fileBuffer);
      if (!data) return new Error('Error in collecting data from file');

      return await this.sitesService.createSite(userId, data);
    } catch (error) {
      throw error;
    }
  }
}
