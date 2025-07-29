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
      const cleanedKeyword = keyword.trim().replace(/"+/g, '');

      if (!cleanedKeyword || cleanedKeyword.length < 2) {
        console.warn('Invalid keyword:', keyword);
        return null;
      }

      const result = await this.unsplash.search.getPhotos({
        query: cleanedKeyword,
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
    keywordsRaw: string[] | string,
    usedIds: string[],
  ): Promise<{ url: string; id: string } | null> {
    let keywords: string[];

    try {
      if (Array.isArray(keywordsRaw)) {
        keywords = keywordsRaw;
      } else if (typeof keywordsRaw === 'string') {
        keywords = JSON.parse(keywordsRaw);
      } else {
        throw new Error('Invalid keywords type');
      }
    } catch (e) {
      console.warn('Cannot transform keywords:', keywordsRaw);
      return null;
    }

    keywords = keywords
      .map((k) => String(k).replace(/"+/g, '').trim())
      .filter((k) => k.length > 0);

    if (keywords.length === 0) {
      console.warn('Empty keyword list');
      return null;
    }

    const usedSet = new Set(usedIds || []);
    const searchTerms = keywords.map((k) => k.split(' ')[0].toLowerCase());

    for (const term of searchTerms) {
      for (let page = 1; page <= 3; page++) {
        const result = await this.unsplash.search.getPhotos({
          query: term,
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
