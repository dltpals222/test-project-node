# CLAUDE.md

> 이 파일은 **허브(목차) 문서**입니다. 핵심 요약과 명령어만 담고, 상세 규칙은 [docs/](docs/) 의 각 문서를 가리킵니다.
> 작업을 시작하기 전에 관련된 상세 문서를 먼저 읽어 주세요.

## 프로젝트 개요

Next.js(프론트엔드) + NestJS(백엔드)를 **하나의 모노레포**에서 관리하는 웹 애플리케이션입니다.

- **언어:** TypeScript
- **프론트엔드:** Next.js (App Router)
- **백엔드:** NestJS (REST API)
- **저장소 구조:** 모노레포 (`frontend/`, `backend/`)

## 모노레포 레이아웃

```
test-project-node/
├── CLAUDE.md            # 이 문서 (허브)
├── docs/                # 상세 문서
├── frontend/            # Next.js 앱
└── backend/             # NestJS 앱
```

## 상세 문서

작업 성격에 따라 아래 문서를 먼저 참고하세요.

| 문서 | 언제 읽나 |
|------|-----------|
| [아키텍처 개요](docs/architecture.md) | 전체 구조, 프론트↔백엔드 통신, 환경변수 분리를 이해할 때 |
| [프론트엔드 컨벤션](docs/frontend-conventions.md) | `frontend/` 에서 화면·컴포넌트·데이터 패칭 작업을 할 때 |
| [백엔드 컨벤션](docs/backend-conventions.md) | `backend/` 에서 API·모듈·DB 작업을 할 때 |
| [공통 규칙](docs/common-conventions.md) | 코딩 스타일·네이밍·Git·커밋·테스트 규칙이 필요할 때 |
| [핸드오프 명세](docs/handoff/README.md) | 더미 프로젝트(스택·보안·DB)를 어떤 명세로 구축했는지 확인할 때 |

## 자주 쓰는 명령어

> 아직 앱이 스캐폴딩되기 전이라면, 각 앱 생성 후 아래 명령어 경로를 실제 스크립트에 맞게 갱신하세요.

```bash
# 프론트엔드 (frontend/)
cd frontend && npm run dev        # 개발 서버
cd frontend && npm run build      # 프로덕션 빌드
cd frontend && npm run lint       # 린트

# 백엔드 (backend/)
cd backend && npm run start:dev   # 개발 서버 (watch)
cd backend && npm run build       # 빌드
cd backend && npm run test        # 테스트
cd backend && npm run lint        # 린트
```

## 작업 원칙

- 코드를 작성하기 전에 해당 영역의 상세 문서를 먼저 읽고, 거기 정의된 컨벤션을 따릅니다.
- 컨벤션을 새로 정하거나 바꿀 때는 코드와 함께 **해당 상세 문서도 업데이트**합니다.
- 이 허브 문서는 가볍게 유지합니다. 새로운 규칙은 이 파일이 아니라 `docs/` 의 적절한 문서에 추가합니다.
