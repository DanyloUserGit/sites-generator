import { Body, Controller, Get, Put } from '@nestjs/common';
import { CurrentUserId } from 'src/auth/CurrentUserId';
import { UpdateProviderDto } from './dto/update-ai-provider.dto';
import { UserSettingsService } from './user-settings.service';

@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get('ai-providers')
  getAllAiProviders() {
    return this.userSettingsService.getAllAiProviders();
  }

  @Get('translate-providers')
  getAllTranslateProviders() {
    return this.userSettingsService.getAllTranslateProviders();
  }

  @Get()
  getUserSettings(@CurrentUserId() userId: string) {
    return this.userSettingsService.getUserSettings(userId);
  }

  @Put('ai')
  updateAiProvider(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateProviderDto,
  ) {
    return this.userSettingsService.updateAiProvider(userId, dto.provider);
  }

  @Put('translate')
  updateTranslateProvider(
    @CurrentUserId() userId: string,
    @Body() dto: UpdateProviderDto,
  ) {
    return this.userSettingsService.updateTranslateProvider(
      userId,
      dto.provider,
    );
  }
}
