import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMemoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @IsBoolean()
  @IsOptional()
  is_important?: boolean;
}
