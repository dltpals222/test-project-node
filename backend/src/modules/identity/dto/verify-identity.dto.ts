import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class VerifyIdentityDto {
  @IsString()
  @Matches(/^[0-9\-+() ]{7,20}$/, { message: '유효한 전화번호 형식이 아닙니다' })
  phone: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;
}
