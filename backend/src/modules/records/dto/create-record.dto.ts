import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateRecordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  name: string;

  @IsString()
  @Matches(/^[0-9\-+() ]{7,20}$/, { message: '유효한 전화번호 형식이 아닙니다' })
  phone: string;
}
