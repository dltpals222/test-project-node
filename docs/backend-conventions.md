# 백엔드 컨벤션 (NestJS)

`backend/` 디렉토리에서 작업할 때 따르는 규칙입니다.

## 폴더 구조

기능(도메인) 단위로 모듈을 나눕니다.

```
backend/
├── src/
│   ├── main.ts               # 부트스트랩 (전역 설정)
│   ├── app.module.ts         # 루트 모듈
│   └── users/                # 도메인 모듈 예시
│       ├── users.module.ts
│       ├── users.controller.ts
│       ├── users.service.ts
│       ├── dto/
│       │   ├── create-user.dto.ts
│       │   └── update-user.dto.ts
│       └── entities/
│           └── user.entity.ts
└── .env
```

- 새 기능은 `nest g module <name>`, `nest g controller <name>`, `nest g service <name>` 로 생성합니다.
- **하나의 도메인 = 하나의 폴더(모듈)** 원칙을 지킵니다.

## 레이어 책임

| 레이어 | 책임 | 하지 말 것 |
|--------|------|-----------|
| **Controller** | HTTP 라우팅, 요청/응답 매핑, DTO 검증 | 비즈니스 로직 작성 |
| **Service** | 비즈니스 로직, 트랜잭션 | HTTP 객체(`req`, `res`) 직접 다루기 |
| **Repository/Entity** | DB 접근, 데이터 모델 | 비즈니스 규칙 판단 |

- Controller는 얇게, **로직은 Service에** 둡니다.

```ts
// users.controller.ts
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
```

## API 규칙

- 전역 프리픽스 `api` 를 사용합니다: `main.ts` 에서 `app.setGlobalPrefix("api")`.
- 라우트 경로는 **복수형 명사** (`/api/users`, `/api/orders`).
- HTTP 메서드 의미를 지킵니다: 조회 `GET`, 생성 `POST`, 전체수정 `PUT`, 부분수정 `PATCH`, 삭제 `DELETE`.

## 입력 검증 (DTO + class-validator)

- 모든 요청 본문은 **DTO 클래스 + `class-validator` 데코레이터**로 검증합니다.
- `main.ts` 에서 전역 `ValidationPipe` 를 켭니다.

```ts
// main.ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
```

```ts
// dto/create-user.dto.ts
import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;
}
```

- `whitelist: true` 로 DTO에 없는 필드는 자동 제거합니다.

## 예외 처리

- 예상된 오류는 Nest의 표준 예외를 던집니다: `NotFoundException`, `BadRequestException`, `UnauthorizedException` 등.
- 응답 형식을 통일하려면 전역 **Exception Filter** 를 둡니다.

```ts
// service에서
const user = await this.repo.findOne({ where: { id } });
if (!user) throw new NotFoundException(`사용자(${id})를 찾을 수 없습니다.`);
```

- **오류를 조용히 삼키지 않습니다.** `try/catch` 후 빈 값을 반환하기보다, 의미 있는 예외를 던지거나 로깅합니다.

## 환경설정

- 환경변수는 `@nestjs/config` 의 `ConfigModule` 로 읽습니다. `process.env` 직접 접근을 줄입니다.
- 비밀 값은 `backend/.env` 에만 두고 커밋하지 않습니다. (`backend/.env.example` 만 커밋)

## 네이밍

- 파일: `kebab-case` + 역할 접미사 (`users.service.ts`, `create-user.dto.ts`).
- 클래스: `PascalCase` + 역할 접미사 (`UsersService`, `CreateUserDto`).
- 공통 규칙은 [공통 규칙](common-conventions.md) 을 따릅니다.
