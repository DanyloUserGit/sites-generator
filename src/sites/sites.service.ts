import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from './entities/site.entity';
import { CreateSiteDTO } from './dto/create-site.dto';
import { DeploymentService } from 'src/deployment/deployment.service';

@Injectable()
export class SitesService {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,

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
