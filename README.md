# 더미 프로젝트 (Next.js + NestJS)

[docs/handoff/](docs/handoff/README.md) 명세를 기반으로 구축한 모노레포 더미 프로젝트입니다.
원본(`dayple-care`)과 동일 스택 + 동일 보안 수준을 재현했습니다.

- **frontend/** — Next.js 16 + React 19 + TanStack Query (port 3000)
- **backend/** — NestJS 11 + Knex + PostgreSQL (port 3001, `/api` prefix)
- **docker-compose.yml** — 로컬 PostgreSQL 15

문서: [CLAUDE.md](CLAUDE.md) · [아키텍처](docs/architecture.md) · [핸드오프 명세](docs/handoff/README.md)

## 전체를 도커로 한 번에 (권장)

Docker Desktop 실행 후, 저장소 루트에서 한 줄이면 postgres + backend + frontend 가 모두 뜹니다.
백엔드 컨테이너가 기동 시 마이그레이션·시드를 자동 실행합니다.

```bash
docker compose up -d --build
# 프론트:  http://localhost:3000
# 백엔드:  http://localhost:3001/api  (Swagger: /api-docs)
# 초기 계정: superadmin / superadmin123!

docker compose logs -f          # 로그 보기
docker compose down             # 중지 (DB 볼륨은 유지)
docker compose down -v          # 중지 + DB 데이터까지 삭제(초기화)
```

> 컨테이너에서는 NODE_ENV=production 으로 프론트 인증이 활성화되어, 로그인해야 진입합니다.
> `JWT_SECRET` 는 compose 의 기본값 대신 환경변수(또는 루트 `.env`)로 주입해 교체하세요.

## 로컬에서 개별 실행 (도커 없이)

```bash
# 0) DB 만 도커로
docker compose up -d postgres-dev

# 1) 백엔드
cd backend
npm install
# .env.local 의 JWT_SECRET 가 채워져 있는지 확인 (.env.example 참고)
npm run db:migrate:local     # 스키마 생성 (ENUM 4 + 테이블 8)
npm run db:seed:local        # superadmin 시드
npm run dev                  # http://localhost:3001/api  (Swagger: /api-docs)

# 2) 프론트엔드
cd ../frontend
npm install
npm run dev                  # http://localhost:3000  (인증 우회)
# 또는 인증 활성화:
npm run dev:auth             # ENABLE_AUTH=true
```

## 계정 (데모)

| 계정 | 비밀번호 | 역할 | 비고 |
| --- | --- | --- | --- |
| `superadmin` | `superadmin123!` | 슈퍼관리자 | 첫 로그인 시 **비밀번호 강제 변경**(`password_changed_at = NULL`) |
| `admin1` | `Admin1!` | 관리자 | 바로 로그인 → 전체 리드 대시보드 |
| `manager1` | `Manager1!` | 담당자 | 배정된 리드만 표시 |
| `member1` | `Member1!` | 협력사 | 배정된 리드만 표시 |

> 데모 데이터: 리드 18건, 일부는 담당자/협력사에 배정되어 배정 기반 RBAC 가 화면에서 드러납니다.
> 프론트엔드는 "Relay" 라는 리드/케이스 배정 콘솔 컨셉의 다크 UI 로 구성했습니다.

## 재현된 보안 메커니즘

| 항목 | 위치 |
| --- | --- |
| JWT 인증 (access only, 7d) | [auth.service.ts](backend/src/modules/auth/auth.service.ts), [jwt.strategy.ts](backend/src/common/guards/jwt.strategy.ts) |
| bcrypt 해싱 (salt 10) | auth.service / users.service |
| RBAC (Guard + @Roles) | [roles.guard.ts](backend/src/common/guards/roles.guard.ts), [roles.decorator.ts](backend/src/common/decorators/roles.decorator.ts) |
| 배정 기반 2차 RBAC | [records.service.ts](backend/src/modules/records/records.service.ts) |
| 비밀번호 정책 (8자+영문+숫자+특수) | [password.utils.ts](backend/src/common/utils/password.utils.ts), change-password.dto |
| 로그인 5회 실패 → 15분 잠금 | auth.service `registerFailedAttempt` |
| 첫 로그인 강제 비번 변경 | auth.service (`requiresPasswordChange`) |
| 민감필드 응답 제외 | [user.entity.ts](backend/src/modules/users/entities/user.entity.ts) `toSafeUser` |
| ValidationPipe whitelist | [app.module.ts](backend/src/app.module.ts) |
| CORS origin 화이트리스트 | [main.ts](backend/src/main.ts) |

### 원본 약점 개선

- `JWT_SECRET` 하드코딩 폴백(`'dev-secret-key'`) 제거 → 미정의 시 부팅 실패
  ([jwt.config.ts](backend/src/common/utils/jwt.config.ts), main.ts 부팅 가드)
- ValidationPipe `forbidNonWhitelisted: true` 로 강화

## 비범위 (명세 기준 제외)

- 외부 연동 실호출(PortOne/S3/카카오) — `identity` 모듈은 더미 인터페이스만 제공
- 업무 도메인 테이블(CMS/상담시간/광고추적/부정신청) 제외
- Refresh Token / Helmet / throttler — 원본과 동일하게 생략(로그인 잠금만 수동)
