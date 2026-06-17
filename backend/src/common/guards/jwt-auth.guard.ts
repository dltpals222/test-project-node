import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * passport-jwt 전략을 실행하는 인증 가드.
 * 보호가 필요한 엔드포인트에 @UseGuards(JwtAuthGuard) 로 명시적으로 부착한다.
 * (전역 가드 없음 — 부착하지 않은 엔드포인트는 공개 엔드포인트)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
