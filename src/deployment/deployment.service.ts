import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';

import { AppConfigService } from 'src/config/config.service';
import { Site } from 'src/sites/entities/site.entity';
import { extractZoneFromDomain } from 'src/utils';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
@Injectable()
export class DeploymentService {
  private vercelToken: string;
  private readonly apiBase = 'https://api.vercel.com';
  private readonly vercelApi = 'https://api.vercel.com/v13/deployments';
  constructor(
    private readonly appConfigService: AppConfigService,

    @InjectRepository(Site)
    private readonly siteRepo: Repository<Site>,
  ) {
    this.vercelToken = this.appConfigService.config.vercel_token;
  }
  async deployStaticSite(siteId: string): Promise<string> {
    const site = await this.siteRepo.findOne({ where: { id: siteId } });
    if (!site) throw new NotFoundException('Site not found');
    const outDir = path.join(
      process.cwd(),
      'sites',
      site.slug.replaceAll('/', ''),
    );
    const projectName = site.slug.replaceAll('/', '');
    const files = this.collectFiles(outDir);

    const vercelFiles = files.map((filePath) => {
      const content = fs.readFileSync(filePath);
      const relativePath = path.relative(outDir, filePath).replace(/\\/g, '/');

      // Текстові файли відправляємо як UTF-8
      const isTextFile = /\.(html|css|js|json|txt|xml|svg)$/i.test(
        relativePath,
      );

      return {
        file: relativePath,
        data: isTextFile
          ? content.toString('utf8')
          : content.toString('base64'),
      };
    });

    const payload = {
      name: projectName,
      files: vercelFiles,
      projectSettings: {
        framework: null, // бо це чисто статичний export
      },
      target: 'production',
    };

    try {
      const { data } = await axios.post(this.vercelApi, payload, {
        headers: {
          Authorization: `Bearer ${this.vercelToken}`,
          'Content-Type': 'application/json',
        },
      });

      return `https://${data.url}`;
    } catch (err) {
      console.error('❌ Deployment failed:', err.response?.data || err.message);
      throw new Error('Vercel deployment failed');
    }
  }

  private collectFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);

    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat && stat.isDirectory()) {
        results = results.concat(this.collectFiles(filePath));
      } else {
        results.push(filePath);
      }
    });

    return results;
  }

  async deployToCloudflare(
    zoneName: string,
    recordName: string,
    content: string,
    type: 'CNAME' | 'A' = 'CNAME',
  ) {
    const token = this.appConfigService.config.cloudflare_token;

    const zonesResp = await axios.get(
      `https://api.cloudflare.com/client/v4/zones?name=${zoneName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!zonesResp.data.result.length) {
      throw new HttpException('Zone not found', HttpStatus.NOT_FOUND);
    }

    const zoneId = zonesResp.data.result[0].id;

    const { data } = await axios.post(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
      {
        type,
        name: recordName,
        content,
        ttl: 1,
        proxied: true,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return data;
  }

  async deploySite(domain: string, outDir: string) {
    let siteUrl = '';

    // const deployData = await this.deployToVercel('project-name', outDir);
    // siteUrl = `https://${deployData.url}`;

    await this.deployToCloudflare(
      extractZoneFromDomain(domain),
      domain,
      siteUrl,
      'CNAME',
    );

    return { message: 'Deploy and DNS configured', siteUrl, domain };
  }
}
