import { decodeJwt } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { TOKEN_KEY, type Role } from '@/lib/auth';

// Next.js 16: 기존 middleware 규칙이 proxy 로 변경됨 (동작 동일, 요청 전 단계 인터셉트)

const PUBLIC_PATHS = ['/login', '/'];

/** 역할별 접근 가능 경로 prefix */
const ROLE_ALLOWED: Record<Role, string[]> = {
  superadmin: ['/admin', '/manager', '/member'],
  admin: ['/admin', '/manager', '/member'],
  manager: ['/manager'],
  member: ['/member'],
};

function roleHome(role: Role): string {
  if (role === 'superadmin' || role === 'admin') return '/admin';
  if (role === 'manager') return '/manager';
  return '/member';
}

function authEnabled(): boolean {
  // npm run dev 는 우회, npm run dev:auth(ENABLE_AUTH=true) / 프로덕션은 활성
  return process.env.ENABLE_AUTH === 'true' || process.env.NODE_ENV === 'production';
}

export function proxy(req: NextRequest) {
  if (!authEnabled()) return NextResponse.next();

  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  const token = req.cookies.get(TOKEN_KEY)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // ⚠️ 서명 검증은 백엔드가 담당한다. 여기서는 라우팅 목적의 디코드만 수행한다(UX 보조).
  let role: Role | undefined;
  let exp: number | undefined;
  try {
    const payload = decodeJwt(token);
    role = payload.role as Role | undefined;
    exp = payload.exp;
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 만료 확인
  if (exp && exp * 1000 < Date.now()) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (!role) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 역할 제한 경로 차단 → 자기 역할 홈으로
  const allowed = ROLE_ALLOWED[role] ?? [];
  const isAllowed = allowed.some((prefix) => pathname.startsWith(prefix));
  if (!isAllowed) {
    return NextResponse.redirect(new URL(roleHome(role), req.url));
  }

  return NextResponse.next();
}

export const config = {
  // _next, api, 그리고 점(.)이 포함된 모든 정적 자산(icon.svg, favicon.ico, *.png 등)은 제외
  matcher: ['/((?!_next/static|_next/image|api|.*\\.).*)'],
};
