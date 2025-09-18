import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from './entities/site.entity';
import { CreateSiteDTO } from './dto/create-site.dto';
import { DeploymentService } from 'src/deployment/deployment.service';
import { RelumeSite } from 'src/generate-from-relume/entities/relume-site.entity';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
    @InjectRepository(RelumeSite)
    private readonly siteRepo: Repository<RelumeSite>,

    private readonly deploymentService: DeploymentService,
  ) {}

  async getSitesByPage(page: number, limit: number) {
    try {
      const [data, count] = await this.siteRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      return {
        data,
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  async getSites(page = 1, limit = 10, withTotal = false) {
    const halfLimit = Math.ceil(limit / 2);

    const skip = (page - 1) * halfLimit;

    const [data, count] = await this.siteRepository.findAndCount({
      skip,
      take: halfLimit,
    });

    const [relumedata, relumecount] = await this.siteRepo.findAndCount({
      skip,
      take: halfLimit,
    });

    const combinedData = [...relumedata, ...data];

    const total = count + relumecount;
    const totalPages = Math.ceil(total / limit);

    return {
      data: combinedData,
      page,
      totalPages,
      ...(withTotal ? { total } : {}),
    };
  }

  async createSite(body: CreateSiteDTO) {
    try {
      const { city, services, language, domain } = body;
      if (!city.length || !services.length || !language.length || !domain)
        throw new Error('Data not provided');
      const validDomain = this.deploymentService.validateDomainReceiver(domain);
      if (!validDomain) throw new Error('Invalid domain');
      const site = this.siteRepository.create({
        city,
        language,
        services,
        domain,
      });
      return await this.siteRepository.save(site);
    } catch (error) {
      throw error;
    }
  }
}
