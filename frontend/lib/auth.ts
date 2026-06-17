/**
 * 토큰 저장/조회 유틸.
 * - localStorage: axios 요청 인터셉터가 사용
 * - Cookie: Next middleware(서버/Edge)가 사용 (7일)
 *
 * ⚠️ 보안 메모: localStorage 토큰은 XSS 에 노출될 수 있다. 더미는 원본 패턴(JWT stateless +
 * localStorage/cookie)을 그대로 재현하되, 실제 접근 통제는 백엔드 Guard 가 강제한다.
 */
export const TOKEN_KEY = 'dummy_access_token';
const TOKEN_MAX_AGE_DAYS = 7;

export type Role = 'superadmin' | 'admin' | 'manager' | 'member';

export interface SessionUser {
  id: number;
  username: string;
  role: Role;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  const maxAge = TOKEN_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

/** 역할별 기본 진입 경로 (middleware 와 동일 규칙) */
export function roleHome(role: Role): string {
  switch (role) {
    case 'superadmin':
    case 'admin':
      return '/admin';
    case 'manager':
      return '/manager';
    case 'member':
      return '/member';
    default:
      return '/login';
  }
}
