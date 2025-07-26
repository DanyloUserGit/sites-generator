import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class MapboxService {
  constructor(private readonly config: AppConfigService) {}

  async getCityMapImage(cityName: string): Promise<string | null> {
    try {
      const geoRes = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          cityName,
        )}.json`,
        {
          params: {
            access_token: this.config.config.mapbox_token,
            limit: 1,
          },
        },
      );

      const features = geoRes.data.features;
      if (!features || features.length === 0) return null;

      const [lon, lat] = features[0].center;

      const zoom = 10;
      const width = 800;
      const height = 600;
      const imageUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lon},${lat},${zoom}/${width}x${height}?access_token=${this.config.config.mapbox_token}`;

      return imageUrl;
    } catch (error) {
      console.error('❌ Mapbox error:', error.message);
      return null;
    }
  }
  //   async getCityNameOnly(cityQuery: string): Promise<string> {
  //     const response = await axios.get(
  //       `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityQuery)}.json`,
  //       {
  //         params: {
  //           access_token: this.config.config.mapbox_token,
  //           types: 'place',
  //           limit: 1,
  //         },
  //       },
  //     );

  //     const feature = response.data.features?.[0];
  //     if (!feature) throw new Error('City not found');

  //     return feature.text;
  //   }
}
