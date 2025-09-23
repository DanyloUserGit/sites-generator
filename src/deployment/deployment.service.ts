import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as dns from 'dns/promises';
import * as fs from 'fs';
import * as path from 'path';
import { AppConfigService } from 'src/config/config.service';
import { RelumeSite } from 'src/generate-from-relume/entities/relume-site.entity';
import { GenerateFromRelumeService } from 'src/generate-from-relume/generate-from-relume.service';
import { Site } from 'src/sites/entities/site.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DeploymentService {
  private vercelToken: string;
  private readonly vercelApi = 'https://api.vercel.com/v13/deployments';
  private readonly cloudflareApi = 'https://api.cloudflare.com/client/v4';

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly relumeService: GenerateFromRelumeService,
    @InjectRepository(Site)
    private readonly siteRepo: Repository<Site>,
    @InjectRepository(RelumeSite)
    private readonly relumeSiteRepo: Repository<RelumeSite>,
  ) {
    this.vercelToken = this.appConfigService.config.vercel_token;
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

  async validateDomain(domain: string, expected: string) {
    try {
      const records = await dns.resolveCname(domain);
      return records.includes(expected);
    } catch {
      return false;
    }
  }

  validateDomainReceiver(domain: string): boolean {
    const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,6}$/;
    const validDomain = domainRegex.test(domain);
    return validDomain;
  }

  async createTxtRecord(zoneId: string, name: string, value: string) {
    return await axios.post(
      `${this.cloudflareApi}/zones/${zoneId}/dns_records`,
      {
        type: 'TXT',
        name,
        content: value,
        ttl: 120,
      },
      {
        headers: {
          Authorization: `Bearer ${this.appConfigService.config.cloudflare_token}`,
          'Content-Type': 'application/json',
        },
      },
    );
  }

  async createDNSRecord(zoneId: string, name: string, content: string) {
    return await axios.post(
      `${this.cloudflareApi}/zones/${zoneId}/dns_records`,
      {
        type: 'CNAME',
        name,
        content,
        ttl: 120,
        proxied: true,
      },
      {
        headers: {
          Authorization: `Bearer ${this.appConfigService.config.cloudflare_token}`,
          'Content-Type': 'application/json',
        },
      },
    );
  }
  async getStatus(siteId: string) {
    try {
      const site = await this.siteRepo.findOne({ where: { id: siteId } });
      if (!site)
        throw new NotFoundException(`Site with id=${siteId} not found`);

      return site.siteStatus;
    } catch (error) {
      throw error;
    }
  }
  async upsertDNSRecord(
    zoneId: string,
    type: 'CNAME' | 'TXT' | 'A',
    name: string,
    content: string,
    proxied = false,
  ) {
    const headers = {
      Authorization: `Bearer ${this.appConfigService.config.cloudflare_token}`,
      'Content-Type': 'application/json',
    };

    console.log(`🔹 Upsert DNS Record: ${type} ${name} → ${content}`);
    console.log(`Zone ID: ${zoneId}`);

    try {
      const { data: existing } = await axios.get(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${name}`,
        { headers },
      );
      console.log(`📝 Existing records for ${name}:`, existing.result);

      for (const r of existing.result) {
        console.log(
          `🗑 Deleting existing record: ${r.type} ${r.name} → ${r.content}`,
        );
        await axios.delete(
          `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${r.id}`,
          { headers },
        );
      }

      console.log(`➕ Creating new record: ${type} ${name} → ${content}`);
      const { data: created } = await axios.post(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
        { type, name, content, ttl: 1, proxied },
        { headers },
      );

      console.log(`✅ Record created successfully:`, created.result);
      return created.result;
    } catch (error: any) {
      console.error(
        `❌ Error upserting DNS record for ${name}:`,
        error.response?.data || error.message,
      );
      throw error; // кинемо далі, щоб не ігнорувати помилки
    }
  }

  async deploySite(siteId: string) {
    try {
      const site = await this.siteRepo.findOne({ where: { id: siteId } });
      if (!site)
        throw new NotFoundException(`Site with id=${siteId} not found`);

      if (!site.siteUrl) {
        await this.deployStaticSite(siteId);
        console.log('Vercel deploy completed');
        return await this.configureDomainRecords(siteId);
      }
      site.siteStatus = 'Ready';
      await this.siteRepo.save(site);
      return await this.deployStaticSite(siteId);
    } catch (error) {
      throw error;
    }
  }
  async configureDomainRecords(siteId: string) {
    const site = await this.siteRepo.findOne({ where: { id: siteId } });
    if (!site) throw new NotFoundException(`Site with id=${siteId} not found`);

    site.siteStatus = 'Updating';

    const zoneId = await this.getZoneId(site.domain);
    if (!zoneId)
      throw new NotFoundException(`Zone for ${site.domain} not found`);

    let domainData;
    try {
      const res = await axios.post(
        `https://api.vercel.com/v9/projects/${site.projectId}/domains`,
        { name: site.domain },
        {
          headers: {
            Authorization: `Bearer ${this.vercelToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      domainData = res.data;
    } catch (err: any) {
      if (err.response?.status === 409) {
        console.log(`ℹ️ Domain ${site.domain} is already added to Vercel`);
        const res = await axios.get(
          `https://api.vercel.com/v9/projects/${site.projectId}/domains/${site.domain}`,
          { headers: { Authorization: `Bearer ${this.vercelToken}` } },
        );
        domainData = res.data;
      } else {
        throw err;
      }
    }

    if (domainData.verification?.length) {
      for (const v of domainData.verification) {
        if (v.type === 'TXT') {
          await this.upsertDNSRecord(zoneId, 'TXT', v.domain, v.value, true);
        }
      }
    }

    const cnameTarget = new URL(site.deployUrl).hostname;
    await this.upsertDNSRecord(zoneId, 'CNAME', site.domain, cnameTarget, true);

    try {
      await axios.post(
        `https://api.vercel.com/v9/projects/${site.projectId}/domains/${site.domain}/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.vercelToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log(`✅ Domain ${site.domain} verified with Vercel`);
    } catch {
      console.log(
        `⚠️ Could not verify domain ${site.domain} yet, DNS may not have propagated`,
      );
    }

    site.siteUrl = `https://${site.domain}`;
    site.siteStatus = 'Ready';
    await this.siteRepo.save(site);

    return {
      message: 'DNS configured & verification triggered',
      domain: site.domain,
      url: site.deployUrl,
    };
  }
  async deleteSiteWithVercel(siteId: string) {
    const site = await this.siteRepo.findOne({ where: { id: siteId } });
    if (!site) throw new NotFoundException('Site not found');

    if (site.projectId) {
      try {
        await axios.delete(
          `https://api.vercel.com/v9/projects/${site.projectId}`,
          {
            headers: {
              Authorization: `Bearer ${this.vercelToken}`,
            },
          },
        );
        console.log(`🗑️ Vercel project ${site.projectId} deleted`);
      } catch (err) {
        console.warn(
          `⚠️ Could not delete Vercel project ${site.projectId}:`,
          err.response?.data || err.message,
        );
      }
    }
  }
  async deployStaticSite(siteId: string): Promise<string> {
    console.log('Deploying to vercel');
    const site = await this.siteRepo.findOne({ where: { id: siteId } });
    if (!site) throw new NotFoundException('Site not found');
    site.siteStatus = 'Updating';
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
        framework: null,
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

      const vercelUrl = `https://${data.url}`;
      const projectId = data.project.id;
      try {
        const { data: pwdData } = await axios.get(
          `https://api.vercel.com/v9/projects/${projectId}/password`,
          {
            headers: {
              Authorization: `Bearer ${this.vercelToken}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (pwdData?.enabled) {
          await axios.patch(
            `https://api.vercel.com/v9/projects/${projectId}/password`,
            { enabled: false },
            {
              headers: {
                Authorization: `Bearer ${this.vercelToken}`,
                'Content-Type': 'application/json',
              },
            },
          );
          console.log(
            ` Password protection disabled for project ${projectName}`,
          );
        } else {
          console.log(
            `ℹPassword protection already disabled for project ${projectName}`,
          );
        }
      } catch (authErr) {
        if (authErr.response?.status !== 404) {
          console.warn(
            `Could not check/disable auth for project ${projectName}:`,
            authErr.response?.data || authErr.message,
          );
        }
      }

      site.deployUrl = vercelUrl;
      site.projectId = projectId;
      console.log('Before save:', site);
      await this.siteRepo.save(site);
      console.log('After save:', site);

      return site.siteUrl || vercelUrl;
    } catch (err) {
      console.error('❌ Deployment failed:', err.response?.data || err.message);
      throw new Error('Vercel deployment failed');
    }
  }
  async getUrl(siteId: string) {
    try {
      const site = await this.siteRepo.findOne({ where: { id: siteId } });
      if (!site) throw new NotFoundException('Site not found');

      const url = site.siteUrl || site.deployUrl || null;
      return { siteUrl: url };
    } catch (error) {
      throw error;
    }
  }
  private async getZoneId(domain: string): Promise<string | null> {
    const headers = {
      Authorization: `Bearer ${this.appConfigService.config.cloudflare_token}`,
      'Content-Type': 'application/json',
    };

    const { data } = await axios.get(
      `https://api.cloudflare.com/client/v4/zones?name=${domain
        .split('.')
        .slice(-2)
        .join('.')}`,
      { headers },
    );

    return data.result.length ? data.result[0].id : null;
  }
  async relumeDeploySite(siteId: string, homeId: string) {
    try {
      const site = await this.relumeSiteRepo.findOne({ where: { id: siteId } });
      if (!site)
        throw new NotFoundException(`RelumeSite with id=${siteId} not found`);
      if (!site.siteUrl) {
        if (!site.homePageId)
          await this.relumeService.setHomePage(siteId, homeId);
        await this.relumeService.buildSite(siteId);
        await this.relumeDeployStaticSite(siteId);
        console.log('Vercel deploy completed');
        return await this.relumeConfigureDomainRecords(siteId);
      }
      await this.relumeSiteRepo.save(site);
      if (!site.homePageId)
        await this.relumeService.setHomePage(siteId, homeId);
      await this.relumeService.buildSite(siteId);
      await this.relumeDeployStaticSite(siteId);
      return await this.relumeConfigureDomainRecords(siteId);
    } catch (error) {
      throw error;
    }
  }

  async relumeConfigureDomainRecords(siteId: string) {
    const site = await this.relumeSiteRepo.findOne({ where: { id: siteId } });
    if (!site)
      throw new NotFoundException(`RelumeSite with id=${siteId} not found`);

    const zoneId = await this.getZoneId(site.domain);
    if (!zoneId)
      throw new NotFoundException(`Zone for ${site.domain} not found`);

    let domainData;
    try {
      const res = await axios.post(
        `https://api.vercel.com/v9/projects/${site.projectId}/domains`,
        { name: site.domain },
        {
          headers: {
            Authorization: `Bearer ${this.vercelToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      domainData = res.data;
    } catch (err: any) {
      if (err.response?.status === 409) {
        console.log(`ℹ️ Domain ${site.domain} is already added to Vercel`);
        const res = await axios.get(
          `https://api.vercel.com/v9/projects/${site.projectId}/domains/${site.domain}`,
          { headers: { Authorization: `Bearer ${this.vercelToken}` } },
        );
        domainData = res.data;
      } else {
        throw err;
      }
    }

    // Додаємо TXT записи для верифікації
    if (domainData.verification?.length) {
      for (const v of domainData.verification) {
        if (v.type === 'TXT') {
          console.log(`🔹 Upserting TXT: ${v.domain} = ${v.value}`);
          await this.upsertDNSRecord(zoneId, 'TXT', v.domain, v.value, false);
        }
      }
    }

    // Додаємо CNAME запис
    const cnameTarget = new URL(site.deployUrl).hostname;
    console.log(`🔹 Upserting CNAME: ${site.domain} → ${cnameTarget}`);

    // Для apex-домену проксі ставимо false
    const isApex = site.domain.split('.').length === 2;
    await this.upsertDNSRecord(
      zoneId,
      'CNAME',
      site.domain,
      cnameTarget,
      !isApex,
    );

    // Після додавання DNS виконуємо верифікацію домену у Vercel
    try {
      await axios.post(
        `https://api.vercel.com/v9/projects/${site.projectId}/domains/${site.domain}/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.vercelToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log(`✅ Domain ${site.domain} verified with Vercel`);
    } catch {
      console.log(
        `⚠️ Could not verify domain ${site.domain} yet, DNS may not have propagated`,
      );
    }

    site.siteUrl = `https://${site.domain}`;
    // site.siteStatus = 'Ready';
    await this.relumeSiteRepo.save(site);

    return {
      message: 'DNS configured & verification triggered',
      domain: site.domain,
      url: site.siteUrl,
    };
  }

  async relumeDeleteSiteWithVercel(siteId: string) {
    const site = await this.relumeSiteRepo.findOne({ where: { id: siteId } });
    if (!site) throw new NotFoundException('RelumeSite not found');

    if (site.projectId) {
      try {
        await axios.delete(
          `https://api.vercel.com/v9/projects/${site.projectId}`,
          {
            headers: { Authorization: `Bearer ${this.vercelToken}` },
          },
        );
        console.log(`🗑️ Vercel project ${site.projectId} deleted`);
      } catch (err) {
        console.warn(
          `⚠️ Could not delete Vercel project ${site.projectId}:`,
          err.response?.data || err.message,
        );
      }
    }
  }

  async relumeDeployStaticSite(siteId: string): Promise<string> {
    const sitePath = path.join(process.cwd(), 'sites', siteId, 'public');
    const site = await this.relumeSiteRepo.findOne({ where: { id: siteId } });
    if (!site) throw new NotFoundException('RelumeSite not found');

    const outDir = sitePath;
    const projectName = site.id;

    // --- Збір файлів без node_modules та Node.js конфігів ---
    const collectFiles = (dir: string): string[] => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      let files: string[] = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (
          ['node_modules', 'package.json', 'package-lock.json', 'src'].includes(
            entry.name,
          )
        )
          continue;

        if (entry.isDirectory()) {
          files = files.concat(collectFiles(fullPath));
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
      return files;
    };

    const files = collectFiles(outDir);

    const vercelFiles = files.map((filePath) => {
      const content = fs.readFileSync(filePath);
      const relativePath = path.relative(outDir, filePath).replace(/\\/g, '/');
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
      projectSettings: { framework: null },
      target: 'production',
    };

    try {
      const { data } = await axios.post(this.vercelApi, payload, {
        headers: {
          Authorization: `Bearer ${this.vercelToken}`,
          'Content-Type': 'application/json',
        },
      });

      const vercelUrl = `https://${data.url}`;
      const projectId = data.project.id;

      site.deployUrl = vercelUrl;
      site.projectId = projectId;
      await this.relumeSiteRepo.save(site);

      return site.siteUrl || vercelUrl;
    } catch (err) {
      console.error('❌ Deployment failed:', err.response?.data || err.message);
      throw new Error('Vercel deployment failed');
    }
  }
  async relumeGetUrl(siteId: string) {
    try {
      const site = await this.relumeSiteRepo.findOne({ where: { id: siteId } });
      if (!site) throw new NotFoundException('Site not found');

      const url = site.siteUrl || site.deployUrl || null;
      return { siteUrl: url, home: site.homePageId };
    } catch (error) {
      throw error;
    }
  }
}
