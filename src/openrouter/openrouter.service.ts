import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class OpenrouterService {
  private client: OpenAI;

  constructor(private readonly config: AppConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.config.openrouter_key,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }

  async runLLM(prompt: string, provider: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: provider,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content ?? '';
  }
}
