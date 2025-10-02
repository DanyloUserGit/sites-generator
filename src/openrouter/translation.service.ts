import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TranslationService {
  async translate(
    text: string,
    targetLang: string,
    provider: string,
  ): Promise<string> {
    if (provider === 'google-translate') {
      const res = await axios.post(
        `https://translation.googleapis.com/language/translate/v2`,
        null,
        {
          params: {
            q: text,
            target: targetLang,
            key: process.env.GOOGLE_TRANSLATE_KEY,
          },
        },
      );
      return res.data.data.translations[0].translatedText;
    }

    if (provider === 'deepl') {
      const res = await axios.post(
        `https://api-free.deepl.com/v2/translate`,
        null,
        {
          params: {
            auth_key: process.env.DEEPL_API_KEY,
            text,
            target_lang: targetLang.toUpperCase(),
          },
        },
      );
      return res.data.translations[0].text;
    }

    throw new Error('Unknown translation provider');
  }
}
