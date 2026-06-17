import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(1)
  username: string;

  // 로그인 단계에서는 정책 정규식을 적용하지 않는다(기존 계정 호환 + 잠금 로직이 방어).
  @IsString()
  @MinLength(1)
  password: string;
}
