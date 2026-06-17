# 공통 규칙

프론트엔드·백엔드 양쪽에 적용되는 공통 규칙입니다.

## TypeScript 스타일

- **`strict` 모드**를 켭니다 (`tsconfig.json` 의 `"strict": true`).
- `any` 사용을 지양합니다. 불가피하면 `unknown` 후 좁혀서 씁니다.
- 함수의 공개 반환 타입은 명시하는 것을 권장합니다 (특히 백엔드 Service).
- 포매팅/린트는 **Prettier + ESLint** 로 자동화하고, 들여쓰기·세미콜론 등 스타일 논쟁은 도구 설정으로 통일합니다.

## 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 변수·함수 | `camelCase` | `getUser`, `userList` |
| 클래스·타입·인터페이스 | `PascalCase` | `UserService`, `CreateUserDto` |
| 상수 | `UPPER_SNAKE_CASE` | `MAX_RETRY`, `API_URL` |
| 파일 | `kebab-case` | `user-list.tsx`, `users.service.ts` |
| 불리언 | `is/has/should` 접두사 | `isActive`, `hasPermission` |

## Git 워크플로우

- 기본 브랜치: `main` (항상 배포 가능한 상태 유지).
- 작업은 **기능 브랜치**에서 진행하고 PR로 병합합니다.
- 브랜치 이름: `<타입>/<간단설명>` 형식.
  - `feat/user-login`, `fix/login-redirect`, `docs/update-readme`, `refactor/users-service`

## 커밋 컨벤션 (Conventional Commits)

`<타입>: <요약>` 형식을 사용합니다.

```
feat: 사용자 로그인 API 추가
fix: 로그인 후 리다이렉트 오류 수정
docs: 백엔드 컨벤션 문서 보강
refactor: UsersService 검증 로직 분리
test: 사용자 생성 테스트 추가
chore: 의존성 업데이트
```

- 주요 타입: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`.
- 요약은 **현재형·명령형**으로 간결하게. 본문이 필요하면 빈 줄 후 상세 설명을 덧붙입니다.

## 테스트 전략

- **백엔드:** Service의 비즈니스 로직은 단위 테스트(`*.spec.ts`)로 우선 검증합니다. 주요 API 흐름은 e2e 테스트로 보완합니다.
- **프론트엔드:** 재사용 컴포넌트와 `lib/` 의 순수 함수를 우선 테스트합니다.
- **원칙:** 새 기능/버그 수정에는 그 동작을 검증하는 테스트를 함께 추가합니다.
- 테스트는 "무엇을 검증하는지" 드러나는 이름을 씁니다. (예: `이메일이 중복되면 예외를 던진다`)

## 환경변수 / 비밀 관리

- `.env` 파일은 **커밋하지 않습니다.** 각 앱에 `.env.example` 만 두어 필요한 키 목록을 공유합니다.
- 비밀 값(DB 비밀번호, 토큰 시크릿)은 백엔드에만 둡니다. 자세한 분리 규칙은 [아키텍처 개요](architecture.md#환경변수-분리) 참고.

## 코드 리뷰 기준

- 한 PR은 하나의 목적에 집중하고, 가능한 작게 유지합니다.
- 리뷰 시 확인: 컨벤션 준수, 오류 처리, 테스트 포함 여부, 불필요한 복잡도.
