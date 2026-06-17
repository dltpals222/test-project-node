# 더미 프로젝트 셋업 핸드오프 명세서

> **이 문서는 다른 프로젝트의 AI 에이전트에게 전달하기 위한 핸드오프 명세입니다.**
> 원본 프로덕션 프로젝트(`dayple-care`)와 **동일한 기술 스택 + 동일한 보안 수준**으로
> 더미 프로젝트를 셋업하는 것이 목표입니다.

## 개요

- **목적**: 원본 프로젝트의 프레임워크 구성과 보안 메커니즘을 그대로 가진 더미 프로젝트를 처음부터 구축
- **대상**: 더미 프로젝트를 생성할 AI 에이전트
- **범위**:
  - ✅ 프레임워크 스택 (Next.js + Nest.js + Knex + PostgreSQL) — **원본과 동일 버전**
  - ✅ 보안 구현 (JWT 인증, bcrypt, RBAC, 요청 검증, 로그인 잠금) — **원본과 동일 수준**
  - ✅ DB 스키마 — **핵심 + 보안 관련 테이블만** (CMS/광고추적/상담시간 등 업무 도메인 테이블 제외)
  - ✅ 도메인 이름 — **범용 더미 도메인으로 치환** (`leads` → `records` 등, 아래 치환표 참조)
- **비범위(제외)**:
  - ❌ 원본의 업무 도메인 테이블 (랜딩 CMS, 상담 시간대, 부정신청, 광고 attribution)
  - ❌ 외부 연동 (PortOne 본인인증 실제 호출, AWS S3, 카카오 지오코딩) — 인터페이스만 더미로

## 도메인 치환표 (원본 → 더미)

보안과 무관한 업무 명칭만 범용화합니다. **보안 관련 컬럼·메커니즘은 이름까지 그대로 보존**하세요.

| 원본 | 더미 (범용) | 비고 |
| --- | --- | --- |
| `users` | `users` | 그대로 — 계정/인증 핵심 |
| `parties` (vendor+telemarketer 슈퍼타입) | `partners` | 외부/내부 당사자 통합 |
| `leads` | `records` | 핵심 업무 레코드 |
| `lead_assignments` | `record_assignments` | RBAC 범위 제어의 핵심 |
| `lead_status_history` | `record_status_history` | 감사 추적 |
| `lead_memos` | `record_memos` | 감사(updated_by) |
| `sms_logs` | `verification_codes` | OTP/인증코드 |
| `identity_verifications` | `identity_verifications` | 그대로 — 외부 인증 기록 |
| ENUM `user_role` | `role` (`superadmin`/`admin`/`manager`/`member`) | RBAC 데모용 4단계 |
| ENUM `account_status` | `account_status` (`active`/`suspended`) | 그대로 |
| ENUM `lead_status` | `record_status` | 범용 워크플로 상태 |
| ENUM `assignment_status` | `assignment_status` (`assigned`/`removed`) | 그대로 |

## 파일 목차

1. **[01_스택과_프로젝트_구조.md](01_스택과_프로젝트_구조.md)**
   — 패키지 버전, 디렉토리 구조, 셋업 명령어, API 프록시 구성
2. **[02_보안_구현_명세.md](02_보안_구현_명세.md)**
   — JWT 인증, bcrypt, Guard/RBAC, ValidationPipe, 로그인 잠금, CORS, 환경변수, 프론트 토큰 처리
3. **[03_DB_스키마_명세.md](03_DB_스키마_명세.md)**
   — ENUM, 핵심+보안 테이블 8종, FK 관계, 마이그레이션 작성 가이드

## 빠른 시작 (요약)

```bash
# 1. 모노레포 디렉토리 구성
mydummy/
├── backend/    # Nest.js 11 + Knex + PostgreSQL
├── frontend/   # Next.js 16 + React 19 + TanStack Query
└── docker-compose.yml  # postgres:15-alpine

# 2. 백엔드
cd backend
npm install
npm run db:migrate:local   # Knex 마이그레이션
npm run dev                # NODE_ENV=local nest start --watch (port 3001)

# 3. 프론트엔드
cd frontend
npm install
npm run dev                # next dev (port 3000), /api/* → localhost:3001 프록시
```

## 보안 수준 요약 (원본 기준 — 그대로 재현 대상)

| 항목 | 원본 상태 | 더미 재현 |
| --- | --- | --- |
| JWT 인증 (access only, 7d) | ✅ 있음 | 재현 |
| bcrypt 해싱 (salt 10) | ✅ 있음 | 재현 |
| RBAC (Guard + @Roles) | ✅ 있음 | 재현 |
| 비밀번호 정책(8자+영문+숫자+특수) | ✅ 있음 | 재현 |
| 로그인 5회 실패 → 15분 잠금 | ✅ 있음 | 재현 |
| 첫 로그인 강제 비번 변경 | ✅ 있음 | 재현 |
| 민감필드 응답 제외 | ✅ 있음 | 재현 |
| ValidationPipe whitelist | ✅ 있음 | 재현 |
| CORS origin 화이트리스트 | ✅ 있음 | 재현 |
| Refresh Token | ❌ 없음 | 동일하게 생략 |
| Helmet (보안 헤더) | ❌ 없음 | 동일 수준이면 생략 가능 |
| Rate Limiting (throttler) | ❌ 없음(로그인만 수동) | 동일하게 수동 잠금만 |

> ⚠️ **원본의 알려진 약점 (더미에서 그대로 두지 말 것 권장)**: `JWT_SECRET` 환경변수가 정의되어 있지 않고 코드에 `'dev-secret-key'` 하드코딩 폴백이 있습니다. 더미에서는 `.env`에 `JWT_SECRET`를 반드시 정의하세요. 자세한 내용은 02 문서 참조.

## 연관 문서

- [01_스택과_프로젝트_구조.md](01_스택과_프로젝트_구조.md)
- [02_보안_구현_명세.md](02_보안_구현_명세.md)
- [03_DB_스키마_명세.md](03_DB_스키마_명세.md)
