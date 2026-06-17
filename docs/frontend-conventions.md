# 프론트엔드 컨벤션 (Next.js / App Router)

`frontend/` 디렉토리에서 작업할 때 따르는 규칙입니다.

## 폴더 구조

App Router 기준 권장 구조입니다.

```
frontend/
├── src/
│   ├── app/                  # 라우팅 (App Router)
│   │   ├── layout.tsx        # 루트 레이아웃
│   │   ├── page.tsx          # 홈 (/)
│   │   └── users/
│   │       └── page.tsx      # /users
│   ├── components/           # 재사용 UI 컴포넌트
│   ├── lib/                  # API 클라이언트, 유틸 함수
│   └── types/                # 공유 타입
├── public/                   # 정적 파일
└── .env.local
```

- `app/` 안에는 **라우팅에 직접 관여하는 파일**(`page.tsx`, `layout.tsx`, `route.ts` 등)만 둡니다.
- 재사용 컴포넌트는 `components/`, 순수 로직/헬퍼는 `lib/` 로 분리합니다.

## Server Component vs Client Component

- **기본은 Server Component** 입니다. (App Router의 기본값)
- 다음이 필요할 때만 파일 맨 위에 `"use client"` 를 선언합니다:
  - `useState`, `useEffect` 등 React 훅
  - 브라우저 이벤트 핸들러 (`onClick` 등)
  - 브라우저 전용 API (`window`, `localStorage`)
- Client Component는 **최대한 작게(leaf)** 유지하고, 데이터 패칭은 상위 Server Component에서 처리합니다.

```tsx
// app/users/page.tsx  (Server Component - 기본)
import { getUsers } from "@/lib/api";
import { UserList } from "@/components/user-list";

export default async function UsersPage() {
  const users = await getUsers(); // 서버에서 직접 백엔드 호출
  return <UserList users={users} />;
}
```

```tsx
// components/like-button.tsx  (상호작용이 필요하므로 Client)
"use client";
import { useState } from "react";

export function LikeButton() {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked((v) => !v)}>{liked ? "♥" : "♡"}</button>;
}
```

## 데이터 패칭

- 조회는 **Server Component에서 `async/await`** 로 합니다. (별도 상태관리 라이브러리 없이)
- 백엔드 호출은 `lib/api.ts` 의 함수로 감싸서 한 곳에서 관리합니다.

```ts
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getUsers() {
  const res = await fetch(`${API_URL}/api/users`, { cache: "no-store" });
  if (!res.ok) throw new Error("사용자 목록을 불러오지 못했습니다.");
  return res.json();
}
```

- 캐싱이 필요 없는 실시간 데이터는 `cache: "no-store"`, 정적 데이터는 기본 캐시 또는 `next: { revalidate: N }` 를 사용합니다.

## 스타일링

- 컴포넌트 단위로 스타일을 두고, 전역 스타일은 `app/globals.css` 한 곳에만 둡니다.
- 클래스 네이밍/스타일 도구(CSS Modules, Tailwind 등)는 프로젝트에서 하나를 정해 일관되게 사용합니다.

## 네이밍

- 컴포넌트 파일: `kebab-case.tsx` (예: `user-list.tsx`), 컴포넌트 이름: `PascalCase` (예: `UserList`).
- 훅: `use` 접두사 (예: `useUser`).
- 공통 네이밍 규칙은 [공통 규칙](common-conventions.md) 을 따릅니다.
