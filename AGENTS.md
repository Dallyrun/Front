# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

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
- 기능 작업 완료 시 관련 **문서(AGENTS.md)도 함께 업데이트**한다:
  - 새 페이지/라우트 추가 → 루트 `AGENTS.md` 의 Architecture / Routes 섹션 반영
  - 새 공용 컴포넌트·훅·스토어 추가 → Architecture 섹션의 디렉터리 설명 업데이트
  - 새 라이브러리 도입 → `package.json` 과 AGENTS.md (기술 스택 표) 반영
  - 환경 변수 추가 → `src/vite-env.d.ts` 의 `ImportMetaEnv` 타입과 `.env.example`(있을 경우) 함께 업데이트
- **트러블슈팅 / 에러 개선 / 성능 개선 / 트레이드오프 결정** 은 [`.Codex/TROUBLESHOOTING.md`](./.Codex/TROUBLESHOOTING.md) **맨 위에** 누적 기록한다.
  - `.Codex/settings.json` 의 **Stop `agent` 훅** 이 매 턴 종료 시 자동 발동. 절차·형식·판단 기준은 [`.Codex/agents/troubleshooting-recorder.md`](./.Codex/agents/troubleshooting-recorder.md) 가 단일 소스.
  - 보수적으로 동작 — 단순 코드 작성·문서 정리·CI 정리 같은 잡무는 기록하지 않음.
  - 자동 기록이 누락된 듯 보이거나 카테고리·내용이 부정확하면 다음 턴에 명시적으로 보강.

## Git Convention

- **Conventional Commits** 형식 사용: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `ci:` 등
- 커밋 메시지, PR 본문 등 git 기록에 Codex/AI 관련 언급(Co-Authored-By 포함)을 절대 포함하지 않는다.
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
├─ api/
│  ├─ client.ts        # apiRequest 기본 fetch 래퍼 + ApiError / NetworkError
│  ├─ auth.ts          # loginWithEmail / signupWithEmail / refreshTokens / logout
│  └─ authedRequest.ts # Authorization 자동 부착 + 401 자동 refresh 재시도 래퍼
├─ pages/              # 라우트 단위 페이지. 컴포넌트명 폴더로 묶음
│  └─ <Page>/<Page>.tsx, .module.css, .test.tsx
├─ components/         # 재사용 가능한 공용 UI 컴포넌트 (e.g. `Logo/`)
├─ hooks/              # 공용 커스텀 훅 (`useXxx`) — 현재 비어 있음
├─ stores/             # Zustand 스토어
│  └─ authStore.ts     # tokens / user + persist(localStorage, key: dallyrun-auth)
├─ types/
│  └─ auth.ts          # AuthTokens / AuthUser / LoginRequest / SignupRequest / AgeBracket / Gender / ApiEnvelope / ApiErrorBody
├─ utils/
│  ├─ password.ts      # 비밀번호 5규칙 검증 (evaluatePassword / isPasswordValid)
│  ├─ nickname.ts      # 닉네임 2~12자 한영숫 검증 (isNicknameValid)
│  └─ errorMessage.ts  # NetworkError/ApiError/Error → 한글 사용자 메시지 (toUserMessage)
├─ asset/
│  └─ dallyrunicon.png # 브랜드 아이콘 (Logo 컴포넌트가 참조)
└─ test/
   └─ setup.ts         # @testing-library/jest-dom 매처 + jsdom 폴리필 (URL.createObjectURL, localStorage)
```

### Routes

| Path      | Component                 | 비고                                                          |
| --------- | ------------------------- | ------------------------------------------------------------- |
| `/`       | `pages/Home/HomePage`     | 초기 랜딩                                                     |
| `/login`  | `pages/Login/LoginPage`   | 이메일/비밀번호 로그인 폼 + 로고 + 회원가입 링크              |
| `/signup` | `pages/Signup/SignupPage` | 러너 등록 폼 (이메일/비밀번호/프로필 이미지/닉네임/나이/성별) |

새 라우트 추가 시 `src/App.tsx` 의 `<Routes>` 에 등록하고 위 표에 추가한다.

### Current State (구현 여부 요약)

Codex 가 빠르게 현 상태를 파악할 수 있도록 유지 — 기능 추가/제거 시 같이 갱신.

**구현 완료**

- ✅ 이메일/비밀번호 로그인 (`/login`) — `loginWithEmail` 으로 백엔드 연동
- ✅ 러너 회원가입 (`/signup`) — multipart 2-part (`data` JSON + `image` 파일), 비밀번호 5규칙 실시간 체크리스트, 닉네임/나이/성별 검증
- ✅ 토큰 **localStorage 영속화** — `authStore` 의 `persist` 미들웨어, key `dallyrun-auth`
- ✅ `authedRequest` 래퍼 — `Authorization: Bearer <access>` 자동 부착 + **401 시 자동 refresh 재시도 1회** + 실패 시 `authStore.clear()`
- ✅ 네트워크 실패(`NetworkError`) → **한글 친절 메시지** 로 UI 에 노출 (`toUserMessage`)
- ✅ GitHub Actions CI (typecheck / lint / format:check / test / build 5개 matrix)
- ✅ HomePage 에 로그인·회원가입 CTA
- ✅ 브랜드 테마 (로고 파랑 기반 디자인 토큰)

**미구현 (의도적 스코프 밖)**

- ❌ `ProtectedRoute` — 로그인 필요 페이지 가드 + 미인증 시 `/login` 자동 리다이렉트. 현재는 모든 라우트가 공개.
- ❌ 로그아웃 버튼 UI — `logout()` 함수는 구현돼 있으나 UI 호출 지점이 없음
- ❌ `/api/me` 같은 유저 정보 엔드포인트 — 백엔드 미제공이라 `authStore.user` 는 항상 `null`
- ❌ `authedRequest` 의 실제 프로덕션 호출 지점 — 현재는 유닛 테스트에서만 커버. `logout` 은 일회성이라 의도적으로 `apiRequest` 를 직접 사용.
- ❌ 글로벌 에러 토스트 / 에러 바운더리

새 기능을 추가하거나 위 미구현 항목 중 하나를 완성하면 이 섹션을 즉시 갱신한다.

### Shared Utilities (`src/utils/`)

| 파일              | 공개 API                                                                            | 역할                                                                         |
| ----------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `password.ts`     | `PASSWORD_MIN_LENGTH`, `PASSWORD_MAX_LENGTH`, `evaluatePassword`, `isPasswordValid` | 비밀번호 5규칙(길이/영문/숫자/특수기호/허용문자) 검증                        |
| `nickname.ts`     | `NICKNAME_MIN_LENGTH`, `NICKNAME_MAX_LENGTH`, `isNicknameValid`                     | 닉네임 2~12자, 한글(가-힣)+영문+숫자만                                       |
| `errorMessage.ts` | `toUserMessage(err, fallback?)`                                                     | `NetworkError` / `ApiError` / raw `TypeError` / `Error` → 한글 사용자 메시지 |

### Auth

- 이메일/비밀번호 기반 로그인/가입으로 시작한다 (소셜 로그인 미도입).
- **API 응답 규약**
  - 성공: `{ "data": T }` envelope. `src/api/client.ts` 의 `apiRequest<T>` 가 자동으로 `data` 를 언래핑.
  - 에러: `{ "message": "..." }` body. `ApiError.message` 로 매핑되어 UI 에 노출.
  - **네트워크 실패** (fetch 가 reject): `NetworkError` 로 래핑. UI 에선 `src/utils/errorMessage.ts` 의 `toUserMessage` 로 "서버에 연결할 수 없습니다…" 같은 한글 메시지로 일관 변환.
- **에러 클래스** (둘 다 `src/api/client.ts` export)

| 클래스         | 언제 던져지는가                                                                  | 필드                                                                        |
| -------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `ApiError`     | 서버가 HTTP 응답은 줬는데 4xx/5xx                                                | `status: number`, `message: string` (서버 `message` 우선, 없으면 기본 문구) |
| `NetworkError` | fetch 자체가 reject — 서버 다운 / CORS preflight 실패 / 오프라인 / 네트워크 끊김 | `message: string` (원인 문구 포함)                                          |

UI 에선 두 가지 모두 `toUserMessage` 로 일관 변환하되, 로그인 401 같은 페이지 특유 상황만 페이지 안에서 먼저 처리.

- **엔드포인트 계약**
  - `POST /api/auth/login` — JSON `{ email, password }` → `{ accessToken, refreshToken }`. 401 은 이메일 없음/비번 불일치 공통(열거 방지).
  - `POST /api/auth/signup` — **multipart/form-data 파트 2개**:
    - `data` (JSON 파트, Content-Type **application/json**): `{ email, password, nickname, ageBracket, gender }`
    - `image` (파일 파트, 필수): 프로필 이미지
    - → `{ accessToken, refreshToken }`
    - 409: 이메일/닉네임 중복
  - `POST /api/auth/refresh` — JSON `{ refreshToken }` → 새 `{ accessToken, refreshToken }` 쌍 (기존 refresh 는 무효화, rotation). 401 이면 재로그인 필요.
  - `DELETE /api/auth/logout` — 인증 필요(`Authorization: Bearer <access>`), 바디 없음, 200 (바디 없음).
- `src/api/client.ts` 의 `apiRequest<T>` 는 body 가 `FormData` 이면 `Content-Type` 을 설정하지 않고 그대로 전송하여 multipart 를 지원한다.
- API 함수는 `src/api/auth.ts` 의 `loginWithEmail`, `signupWithEmail`, `refreshTokens`, `logout`.
  - `logout(accessToken)` 은 서버 호출 실패(401/500 등)에도 `ApiError` 를 **swallow** 한다 — 네트워크 상태와 무관하게 로컬 토큰 정리를 보장하기 위함. 호출자가 반드시 이어서 `useAuthStore.getState().clear()` 를 실행해야 함.
- 인증 필요한 호출은 `src/api/authedRequest.ts` 의 `authedRequest<T>` 를 사용. Authorization 헤더 자동 부착 + **401 시 자동으로 refresh → 재시도 1회**, refresh 도 실패하면 `authStore.clear()` 호출 (UI 가 리다이렉트 처리).
  - 현재 프로덕션 코드에 `authedRequest` 를 쓰는 호출 지점은 없음. `logout` 은 일회성이라 의도적으로 `apiRequest` 를 직접 사용. 이후 보호된 엔드포인트가 생기면 `authedRequest` 로 감싸서 호출할 것.
- **토큰 영속화**: `src/stores/authStore.ts` 의 Zustand 스토어는 `persist` 미들웨어로 **localStorage** 의 `dallyrun-auth` 키에 저장. 새로고침·탭 재진입 후에도 세션 유지.
  - 저장 구조:
    ```json
    { "state": { "tokens": AuthTokens | null, "user": AuthUser | null }, "version": 0 }
    ```
  - `partialize` 로 `tokens` / `user` 만 직렬화, setter(`setTokens` 등)는 제외.
- 비밀번호 제약: **8자 이상 30자 이하** + **영문자(대소문자 무관)** + **숫자** + **ASCII 특수기호** 모두 포함, 그리고 **허용 문자는 ASCII 영문/숫자/특수기호만** (공백·한글·이모지·전각문자·제어문자 등 금지). 검증 로직은 `src/utils/password.ts`. SignupPage 는 다섯 규칙을 체크리스트로 실시간 표시. 서버 정규식과 1:1 대응.
- 닉네임 제약: **2~12자**, **한글 완성형(가-힣) + 영문자 + 숫자** 만 허용. 공백·특수문자·자모·이모지·전각문자 등 금지. 검증 로직은 `src/utils/nickname.ts`.
- 회원가입 필수 필드: `email`, `password`, `nickname`, `ageBracket`, `gender`, `profileImage`. 프로필 이미지는 **필수**이며 JPEG/PNG 등 일반 이미지. `AgeBracket = 20 | 30 | 40 | 50 | 60` 리터럴 유니온(60은 "60대 이상").
- 전역 인증 상태: `tokens: AuthTokens | null` + `user: AuthUser | null`. 현재 백엔드는 로그인/가입 응답에 유저 정보를 포함하지 않아 `user` 는 항상 `null` (향후 `/api/me` 같은 엔드포인트가 생기면 채움).
- 인증 관련 공용 타입은 `src/types/auth.ts` 에 정의.
- 공용 브랜드 컴포넌트: `src/components/Logo/Logo.tsx` — 아이콘 이미지(`src/asset/dallyrunicon.png`) + 그라데이션 wordmark + tagline. props: `size` `sm|md|lg`, `withIcon`, `withTagline`, `as`.

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
- `src/test/setup.ts` 는 jsdom 에 없거나 불안정한 API 를 폴리필해 둠:
  - `URL.createObjectURL` / `URL.revokeObjectURL` — 프로필 이미지 미리보기(`SignupPage`) 테스트용
  - `localStorage` 인메모리 fallback — zustand `persist` 미들웨어와의 호환성 확보용
  - 테스트에서 storage 관련 에러가 나면 이 셋업을 먼저 의심.

## See also

저장소 루트의 `.Codex/` 에 프로젝트 전용 설정이 있다.

- [`.Codex/settings.json`](./.Codex/settings.json) — Codex permissions (npm / git / gh 허용, `.env*` 읽기·쓰기 차단)
- [`.Codex/commands/`](./.Codex/commands) — 슬래시 커맨드
  - [`/dev`](./.Codex/commands/dev.md) · [`/check`](./.Codex/commands/check.md) · [`/test`](./.Codex/commands/test.md) · [`/review-pr`](./.Codex/commands/review-pr.md) · [`/fix-issue`](./.Codex/commands/fix-issue.md)
- [`.Codex/skills/`](./.Codex/skills) — 프로젝트 전용 스킬
  - [`create-pr/`](./.Codex/skills/create-pr/SKILL.md) — 현재 브랜치를 PR 로 올리는 표준 플로우

> 프로젝트 규칙(React/테스트/스타일/커밋)은 본 `AGENTS.md` 가 단일 소스(SSOT)다. Codex 가 자동으로 읽는 파일도 `AGENTS.md` 뿐이므로 룰 파일을 별도 디렉터리로 분리하지 않는다.
