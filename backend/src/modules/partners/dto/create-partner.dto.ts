import { IsEnum, IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { PartnerType } from '../entities/partner.entity';

const PARTNER_TYPES: PartnerType[] = ['external', 'internal'];

export class CreatePartnerDto {
  @IsInt()
  @Min(1)
  user_id: number;

  @IsEnum(PARTNER_TYPES, { message: 'partner_type 은 external 또는 internal 이어야 합니다' })
  partner_type: PartnerType;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}
