import { Injectable } from '@nestjs/common';
import { AppConfigService } from 'src/config/config.service';
import { createApi } from 'unsplash-js';

@Injectable()
export class UnsplashService {
  private readonly unsplash;
  constructor(private readonly config: AppConfigService) {
    this.unsplash = createApi({
      accessKey: config.config.unsplash_access_key,
      fetch,
    });
  }

  async getImageUrlByKeyword(keyword: string): Promise<string | null> {
    try {
      const result = await this.unsplash.search.getPhotos({
        query: keyword,
        perPage: 1,
        orientation: 'landscape',
      });

      if (result.type === 'success' && result.response.results.length > 0) {
        const photo = result.response.results[0];
        return photo.urls.regular;
      }

      return null;
    } catch (error) {
      console.error('Unsplash error:', error.message);
      return null;
    }
  }

  async getUniqueImage(
    keywords: string[],
    usedIds: string[],
  ): Promise<{ url: string; id: string } | null> {
    const usedSet = new Set(usedIds || []);

    for (const keyword of keywords) {
      for (let page = 1; page <= 3; page++) {
        const result = await this.unsplash.search.getPhotos({
          query: keyword,
          perPage: 5,
          page,
          orientation: 'landscape',
        });

        if (result.type === 'success') {
          for (const photo of result.response.results) {
            if (!usedSet.has(photo.id)) {
              return {
                url: photo.urls.regular,
                id: photo.id,
              };
            }
          }
        }
      }
    }

    return null;
  }
}
