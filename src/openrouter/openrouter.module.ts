import { Module } from '@nestjs/common';
import { OpenrouterService } from './openrouter.service';
import { OpenrouterController } from './openrouter.controller';
import { AppConfigModule } from 'src/config/config.module';
import { AiService } from './ai.service';
import { TranslationService } from './translation.service';
import { UserSettingsModule } from 'src/user-settings/user-settings.module';

@Module({
  imports: [AppConfigModule, UserSettingsModule],
  providers: [OpenrouterService, AiService, TranslationService],
  controllers: [OpenrouterController],
  exports: [AiService, TranslationService],
})
export class OpenrouterModule {}
