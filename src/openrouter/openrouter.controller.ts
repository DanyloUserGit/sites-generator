import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { CurrentUserId } from 'src/auth/CurrentUserId';

@Controller('openrouter')
export class OpenrouterController {
  constructor(private readonly ai: AiService) {}

  @Post('generate')
  async generate(
    @Body() body: { prompt: string },
    @CurrentUserId() userId: string,
  ) {
    return await this.ai.generateContent(body.prompt, userId);
  }

  @Post('improve')
  improve(
    @Body() body: { text: string; provider: string },
    @CurrentUserId() userId: string,
  ) {
    return this.ai.improveText(body.text, userId);
  }

  @Post('shorten')
  shorten(
    @Body() body: { text: string; provider: string },
    @CurrentUserId() userId: string,
  ) {
    return this.ai.shortenText(body.text, userId);
  }

  @Post('expand')
  expand(
    @Body() body: { text: string; provider: string },
    @CurrentUserId() userId: string,
  ) {
    return this.ai.expandText(body.text, userId);
  }

  @Post('tone')
  tone(
    @Body()
    body: {
      text: string;
      tone: 'formal' | 'informal';
      provider: string;
    },
    @CurrentUserId() userId: string,
  ) {
    return this.ai.changeTone(body.text, body.tone, userId);
  }

  @Post('translate')
  translate(
    @Body() body: { text: string; lang: string; provider: string },
    @CurrentUserId() userId: string,
  ) {
    return this.ai.translateText(body.text, body.lang, userId);
  }
}
