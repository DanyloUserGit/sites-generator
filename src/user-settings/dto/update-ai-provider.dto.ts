import { IsString } from 'class-validator';

export class UpdateProviderDto {
  @IsString()
  provider: string;
}
