# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dallyrun Front — 달리런 서비스의 **웹 프론트엔드**. 별도의 Dallyrun 백엔드 서버(Spring Boot)와 통신하며, 동일 도메인 앱으로 Android 클라이언트가 존재한다. **Vite 5 + React 18 + TypeScript 5 (strict)** 기반의 SPA 구조.

## Build & Run Commands

```bash
npm install                 # 의존성 설치
npm run dev                 # 개발 서버 (기본 http://localhost:5173)
npm run build               # 타입체크 + 프로덕션 빌드 (dist/)
npm run preview             # 빌드 산출물 로컬 프리뷰
npm run lint                # ESLint
npm run format              # Prettier 자동 포맷
npm run format:check        # Prettier 검사 (CI용)
npm run typecheck           # tsc --noEmit
npm run test                # Vitest 1회 실행
npm run test:watch          # Vitest watch 모드
```

## CI (GitHub Actions)

`.github/workflows/ci.yml` — `main` 브랜치 push 및 PR 시 자동 실행.

| Task         | 스크립트               | 목적                 |
| ------------ | ---------------------- | -------------------- |
| typecheck    | `npm run typecheck`    | TypeScript 타입 검사 |
| lint         | `npm run lint`         | ESLint               |
| format:check | `npm run format:check` | Prettier 포맷 검사   |
| test         | `npm run test`         | Vitest               |
| build        | `npm run build`        | 프로덕션 빌드        |

- 5개 task 가 matrix 로 **병렬 실행** (GitHub UI 에 각각 독립 체크로 표시).
- `fail-fast: false` — 하나 실패해도 나머지 결과 모두 수집.
- 같은 브랜치에 새 push 가 오면 이전 실행 자동 취소 (`concurrency`).
- Node 20, `npm ci`, setup-node 의 npm 캐시 사용.

## Workflow

- 작업 시작 시 반드시 **플랜 모드**로 계획을 세운 뒤 승인받고 구현한다.
- 작업 시 **브랜치를 생성**하여 작업하고, 완료 후 **PR을 생성**한다.
  - 브랜치명: `feat/<feature-name>`, `fix/<bug-name>`, `refactor/<scope>` 등
- 기능 구현 시 반드시 해당 기능의 **테스트 코드**도 함께 작성한다.
  - 테스트는 Vitest + React Testing Library 사용, 기능 파일과 동일 경로에 `*.test.ts(x)` 로 배치한다.
- 기능 작업 완료 시 관련 **문서(CLAUDE.md)도 함께 업데이트**한다:
  - 새 페이지/라우트 추가 → 루트 `CLAUDE.md` 의 Architecture / Routes 섹션 반영
  - 새 공용 컴포넌트·훅·스토어 추가 → Architecture 섹션의 디렉터리 설명 업데이트
  - 새 라이브러리 도입 → `package.json` 과 CLAUDE.md (기술 스택 표) 반영
  - 환경 변수 추가 → `src/vite-env.d.ts` 의 `ImportMetaEnv` 타입과 `.env.example`(있을 경우) 함께 업데이트

## Git Convention

- **Conventional Commits** 형식 사용: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `ci:` 등
- 커밋 메시지, PR 본문 등 git 기록에 Claude/AI 관련 언급(Co-Authored-By 포함)을 절대 포함하지 않는다.
- main 브랜치에는 직접 커밋하지 않고 반드시 PR 을 통해 머지한다.

## Architecture

### Tech Stack

| 영역            | 라이브러리                                                  |
| --------------- | ----------------------------------------------------------- |
| 빌드            | Vite 5, `@vitejs/plugin-react`                              |
| 언어            | React 18, TypeScript 5 (strict, `noUncheckedIndexedAccess`) |
| 라우팅          | `react-router-dom` v6                                       |
| 서버 상태       | `@tanstack/react-query` v5                                  |
| 클라이언트 상태 | `zustand` v4                                                |
| 스타일          | Plain CSS + CSS Modules (`*.module.css`)                    |
| 린트 / 포맷     | ESLint 9 (flat config) + Prettier 3                         |
| 테스트          | Vitest + @testing-library/react + jsdom                     |

### Directory Layout

```
src/
├─ main.tsx            # 엔트리: QueryClientProvider + BrowserRouter 래핑
├─ App.tsx             # 라우트 정의
├─ index.css           # 전역 스타일 / 루트 변수
├─ vite-env.d.ts       # Vite 클라이언트 타입 + ImportMetaEnv 선언
├─ api/                # 백엔드 API 클라이언트 (fetch 래퍼 등)
├─ pages/              # 라우트 단위 페이지. 컴포넌트명 폴더로 묶음
│  └─ <Page>/<Page>.tsx, .module.css, .test.tsx
├─ components/         # 재사용 가능한 공용 UI 컴포넌트 (e.g. `Logo/`)
├─ hooks/              # 공용 커스텀 훅 (`useXxx`)
├─ stores/             # Zustand 스토어 (전역 클라이언트 상태)
├─ types/              # 프로젝트 공용 타입
├─ utils/              # 순수 유틸 함수
└─ test/
   └─ setup.ts         # @testing-library/jest-dom 매처 등록
```

### Routes

| Path      | Component                 | 비고                                                       |
| --------- | ------------------------- | ---------------------------------------------------------- |
| `/`       | `pages/Home/HomePage`     | 초기 랜딩                                                  |
| `/login`  | `pages/Login/LoginPage`   | 이메일/비밀번호 로그인 폼 + 로고 + 회원가입 링크           |
| `/signup` | `pages/Signup/SignupPage` | 이메일/비밀번호/비밀번호 확인/프로필 이미지/닉네임 가입 폼 |

새 라우트 추가 시 `src/App.tsx` 의 `<Routes>` 에 등록하고 위 표에 추가한다.

### Auth

- 이메일/비밀번호 기반 로그인/가입으로 시작한다 (소셜 로그인 미도입).
- API 엔드포인트 계약:
  - `POST /api/auth/login` — JSON: `{ email, password }` → `AuthResponse`
  - `POST /api/auth/register` — **multipart/form-data** 필드: `email`, `password`, `nickname`, 선택적 파일 `profileImage` → `AuthResponse`
- `src/api/client.ts` 의 `apiRequest<T>` 는 body 가 `FormData` 이면 `Content-Type` 을 설정하지 않고 그대로 전송하여 multipart 를 지원한다.
- API 함수는 `src/api/auth.ts` 의 `loginWithEmail`, `signupWithEmail`. `signupWithEmail` 은 `SignupRequest` 를 내부에서 FormData 로 변환.
- 비밀번호 제약: **8자 이상 100자 이하** (길이만). Front 클라이언트 검증 + 백엔드에서도 동일 규칙 강제할 것.
- 전역 인증 상태(`token`, `user`)는 `src/stores/authStore.ts` 의 Zustand 스토어에서 관리. 현재는 메모리 기반이며, 영속화 도입 시 본 섹션과 함께 갱신한다.
- 인증 관련 공용 타입은 `src/types/auth.ts` 에 정의한다.
- 공용 브랜드 컴포넌트: `src/components/Logo/Logo.tsx` (텍스트 로고, size `sm|md|lg`).

### Path Alias

- `@/*` → `src/*` (tsconfig + vite.config.ts 에 동일하게 설정됨).

### API / Env

- 백엔드 베이스 URL 은 `VITE_API_BASE_URL` 환경 변수로 주입 (`.env.local` 또는 빌드 시 주입).
- `src/api/client.ts` 의 `apiRequest<T>()` 를 통해 모든 요청을 수행한다. 직접 `fetch` 호출을 페이지/컴포넌트에 흩뿌리지 않는다.
- 민감한 값(비밀번호, 시크릿, OAuth 크리덴셜)은 문서·커밋·이슈·PR 본문 등 git 기록에 절대 포함하지 않는다.

## Code Quality

- **Testable 한 코드** 작성: 외부 의존성은 훅 또는 props 로 주입 가능한 형태로 설계한다.
- 기능 구현 시 **테스트 코드를 반드시 함께 작성**한다. 최소한 스모크 렌더 테스트 1건은 포함.
- `any` 사용 지양, 불가피할 때만 한정된 범위에서 주석과 함께 사용.
- PR 병합 전 `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` 모두 통과해야 한다.

## Coding Conventions

### React / TypeScript

- **함수형 컴포넌트 + 훅**만 사용. 클래스 컴포넌트 금지.
- Props 는 `interface` 또는 `type` 으로 명시적으로 선언. `React.FC` 사용 지양.
- 상태 관리 계층 분리:
  - **로컬 UI 상태** → `useState` / `useReducer`
  - **서버 상태 (백엔드 데이터)** → `@tanstack/react-query`
  - **전역 클라이언트 상태 (인증 세션, 테마 등)** → Zustand 스토어 (`src/stores/`)
- 컴포넌트/페이지는 **폴더 단위**로 구성: `ComponentName/ComponentName.tsx`, `ComponentName.module.css`, `ComponentName.test.tsx`.
- 하나의 파일은 **하나의 명확한 책임**만 가진다 (단일 책임 원칙).
- 절대 경로 import 는 `@/...` 을 사용하고, 상대 경로는 같은 폴더 내에서만 사용.
- `console.log` 는 커밋 금지. 디버그용은 PR 올리기 전에 제거한다.

### Naming

- 컴포넌트/페이지/타입: `PascalCase`
- 함수/변수/훅 파일: `camelCase` (훅은 `useXxx`)
- 상수: `SCREAMING_SNAKE_CASE`
- CSS Module 클래스: `camelCase` (e.g. `styles.titleText`)
- Boolean: `is`, `has`, `can`, `should` prefix 선호

### Styling

- Plain CSS + CSS Modules. 글로벌 스타일은 `src/index.css` 에만 둔다.
- 하드코딩된 색상/사이즈를 재사용해야 할 경우 CSS custom property (`:root` 변수)로 승격.
- 인라인 스타일은 동적 계산이 필요한 경우에만 사용.

### Formatting (Prettier)

- 들여쓰기: **2 spaces**
- 최대 줄 길이: **100**
- 세미콜론 사용, single quote, trailing comma `all`
- import 순서는 기본 포맷터 순서를 따르고, 그룹 사이 빈 줄 유지.

### Testing

- 파일 위치: 테스트 대상과 동일 폴더의 `*.test.ts(x)`.
- UI 는 **역할(role) 기반 쿼리** 우선 (`getByRole`, `getByLabelText`).
- 네트워크 호출은 mocking 또는 MSW 도입 전까지 직접 `apiRequest` 를 모킹한다.
- 새 기능 PR 은 관련 테스트가 포함되어야 리뷰 대상이 된다.

## See also

저장소 루트의 `.claude/` 에 프로젝트 전용 설정이 있다.

- [`.claude/settings.json`](./.claude/settings.json) — Claude Code permissions (npm / git / gh 허용, `.env*` 읽기·쓰기 차단)
- [`.claude/commands/`](./.claude/commands) — 슬래시 커맨드
  - [`/dev`](./.claude/commands/dev.md) · [`/check`](./.claude/commands/check.md) · [`/test`](./.claude/commands/test.md) · [`/review-pr`](./.claude/commands/review-pr.md) · [`/fix-issue`](./.claude/commands/fix-issue.md)
- [`.claude/skills/`](./.claude/skills) — 프로젝트 전용 스킬
  - [`create-pr/`](./.claude/skills/create-pr/SKILL.md) — 현재 브랜치를 PR 로 올리는 표준 플로우

> 프로젝트 규칙(React/테스트/스타일/커밋)은 본 `CLAUDE.md` 가 단일 소스(SSOT)다. Claude Code 가 자동으로 읽는 파일도 `CLAUDE.md` 뿐이므로 룰 파일을 별도 디렉터리로 분리하지 않는다.
