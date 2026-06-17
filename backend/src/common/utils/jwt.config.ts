/**
 * JWT 시크릿 조회 헬퍼.
 *
 * ⚠️ 원본 약점 개선: 원본은 `process.env.JWT_SECRET || 'dev-secret-key'` 처럼
 * 하드코딩 폴백을 사용했다. 더미에서는 폴백을 제거하고, 미정의 시 즉시 예외를 던져
 * 부팅을 실패시킨다 (핸드오프 02 문서 §1-3 지침).
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      'JWT_SECRET 환경변수가 정의되지 않았습니다. .env 파일에 JWT_SECRET 를 반드시 설정하세요.',
    );
  }
  return secret;
}

export const JWT_EXPIRES_IN = '7d';
