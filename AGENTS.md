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
npm run verify              # typecheck + lint + format:check + test + build 전체 게이트
npm run verify:fast         # typecheck + lint + test 빠른 게이트
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

- 어떠한 작업이든 시작 전 반드시 **Plan Mode** 로 전환해 계획을 세우고, 사용자 승인 후 진행한다.
  - 문서 수정, 코드 구현, 리뷰, 설정 변경, 검증/배포 작업 모두 예외 없이 포함한다.
- 작업 시 **브랜치를 생성**하여 작업하고, 완료 후 **PR을 생성**한다.
  - 브랜치명: `feat/<feature-name>`, `fix/<bug-name>`, `refactor/<scope>` 등
- PR 이 올라왔을 때 Codex 의 기본 역할은 **직접 코드 리뷰어**다.
  - 별도 CI, hook, 서브에이전트에 위임하지 않고 Codex 가 직접 `main...HEAD` diff 와 PR 본문을 읽어 리뷰한다.
  - 리뷰는 버그/회귀 위험/테스트 누락을 먼저 찾고, 발견 사항은 심각도 순으로 정확한 파일·라인과 함께 제시한다.
- 기능 구현 시 반드시 해당 기능의 **테스트 코드**도 함께 작성한다.
  - 테스트는 Vitest + React Testing Library 사용, 기능 파일과 동일 경로에 `*.test.ts(x)` 로 배치한다.
- 기능 작업 완료 시 관련 **문서(AGENTS.md)도 함께 업데이트**한다:
  - 새 페이지/라우트 추가 → 루트 `AGENTS.md` 의 Architecture / Routes 섹션 반영
  - 새 공용 컴포넌트·훅·스토어 추가 → Architecture 섹션의 디렉터리 설명 업데이트
  - 새 라이브러리 도입 → `package.json` 과 AGENTS.md (기술 스택 표) 반영
  - 환경 변수 추가 → `src/vite-env.d.ts` 의 `ImportMetaEnv` 타입과 `.env.example`(있을 경우) 함께 업데이트
- **트러블슈팅 / 에러 개선 / 성능 개선 / 트레이드오프 결정** 은 [`.agents/FEEDBACK.md`](./.agents/FEEDBACK.md) 에 누적 기록한다.
  - 보수적으로 동작 — 단순 코드 작성·문서 정리·CI 정리 같은 잡무는 기록하지 않음.
  - 같은 교훈이 2회 이상 반복되면 테스트, lint, 스크립트, PR 체크리스트, AGENTS 규칙 중 하나로 승격한다.

## Agent Harness

### Shared Instructions

- `AGENTS.md` 가 프로젝트 규칙의 단일 소스(SSOT)다.
- Codex 는 `AGENTS.md` 를 직접 읽는다.
- Codex 전용 작업 지침과 재사용 가능한 하네스는 `.agents/` 에 둔다.
- 다른 에이전트용 진입점이나 별도 규칙 파일을 만들지 않는다. 프로젝트 공통 규칙은 `AGENTS.md` 또는 `.agents/` 에 둔다.

### Verification Gates

작업자는 변경 범위에 맞는 최소 게이트를 실행하고, PR 본문에 실행 결과를 남긴다. 범위가 애매하면 더 넓은 게이트를 선택한다.

| 변경 범위                  | 최소 게이트                                             |
| -------------------------- | ------------------------------------------------------- |
| 문서만 변경                | `npm run format:check`                                  |
| 유틸 / 타입 / 스토어 변경  | `npm run verify:fast`                                   |
| API 클라이언트 / 인증 변경 | `npm run verify:fast` + 관련 인증/에러 경로 테스트 확인 |
| 페이지 / 라우트 / UI 변경  | `npm run verify:fast` + 필요 시 브라우저 수동 확인      |
| 빌드 / CI / 의존성 변경    | `npm run verify`                                        |
| 릴리스 또는 PR 최종 확인   | 가능하면 `npm run verify`                               |

- 실패한 게이트가 있으면 원인을 수정하고 같은 게이트를 다시 실행한다.
- 시간이 오래 걸리거나 환경 문제로 실행하지 못한 게이트는 PR 본문과 최종 응답에 이유를 명시한다.
- 검증 결과가 새로운 프로젝트 교훈을 만들면 `.agents/FEEDBACK.md` 에 기록한다.

### Feedback Loop

- `.agents/FEEDBACK.md` 는 실패, 리뷰 지적, 디버깅, 성능 개선, 트레이드오프에서 얻은 재사용 가능한 교훈을 기록한다.
- 항목은 `Trigger / Symptom / Root cause / Fix / Harness update` 형식을 따른다.
- 단순 작업 기록이나 통과한 체크 결과만으로는 항목을 추가하지 않는다.
- 반복되는 항목은 더 강한 검증 게이트로 승격한다.

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
| 린트 / 포맷     | ESLint 9 (flat config, `eslint-plugin-import`) + Prettier 3 |
| 테스트          | Vitest + @testing-library/react + jsdom                     |
| 에이전트 하네스 | AGENTS.md + `.agents/` skills/hooks + `.agents/FEEDBACK.md` |

### Directory Layout

```
src/
├─ main.tsx            # 엔트리: QueryClientProvider + BrowserRouter 래핑
├─ App.tsx             # 라우트 정의
├─ index.css           # 전역 스타일 / 루트 변수
├─ vite-env.d.ts       # Vite 클라이언트 타입 + ImportMetaEnv 선언
├─ api/
│  ├─ client.ts        # apiRequest 기본 fetch 래퍼 + ApiError / NetworkError + VITE_USE_MOCK_API 분기
│  ├─ auth.ts          # loginWithEmail / signupWithEmail / refreshTokens / logout / deleteAccount
│  ├─ authedRequest.ts # Authorization 자동 부착 + 401 자동 refresh 재시도 래퍼
│  └─ mockApi.ts       # 인메모리 mock 핸들러 (백엔드 없이 전체 시퀀스 검증용)
├─ pages/              # 라우트 단위 페이지. 컴포넌트명 폴더로 묶음
│  ├─ Home/            # 온보딩 진입 화면 (`/`)
│  ├─ Login/           # 로그인
│  ├─ Signup/          # 회원가입
│  ├─ PasswordReset/   # 비밀번호 재설정
│  ├─ Web/             # Figma Web Design 기반 mock 대시보드/상세/상태 화면 모음
│  └─ <Page>/<Page>.tsx, .module.css, .test.tsx
├─ components/         # 재사용 가능한 공용 UI 컴포넌트 (`Logo`, `WebShell`)
├─ mock/
│  └─ dallyrun.ts      # 웹 디자인 화면용 정적 mock 데이터와 id 기반 조회 helper
├─ hooks/              # 공용 커스텀 훅 (`useXxx`) — 현재 비어 있음
├─ stores/             # Zustand 스토어
│  └─ authStore.ts     # tokens / user + persist(localStorage, key: dallyrun-auth)
├─ types/
│  ├─ auth.ts          # AuthTokens / AuthUser / LoginRequest / SignupRequest / AgeBracket / Gender / ApiEnvelope / ApiErrorBody
│  └─ dallyrun.ts      # RunRecord / Goal / Badge / Post / Crew / Recruit / Profile / NotificationItem
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

| Path                                 | Component                               | 비고                                            |
| ------------------------------------ | --------------------------------------- | ----------------------------------------------- |
| `/`                                  | `pages/Home/HomePage`                   | 온보딩 진입 / 웹 소개                           |
| `/login`                             | `pages/Login/LoginPage`                 | mock 로그인, 성공 시 `/home`                    |
| `/signup`                            | `pages/Signup/SignupPage`               | mock 회원가입, 성공 시 `/home`                  |
| `/password-reset`                    | `pages/PasswordReset/PasswordResetPage` | 이메일 발송 안내 + 새 비밀번호 5규칙 체크리스트 |
| `/home`                              | `pages/Web/DashboardHomePage`           | 대시보드 홈                                     |
| `/records`                           | `pages/Web/RecordsPage`                 | 기록 목록 / 통계                                |
| `/records/:runId`                    | `pages/Web/RunningDetailPage`           | 러닝 기록 상세                                  |
| `/goals`                             | `pages/Web/GoalPage`                    | 현재 목표 / 달성 현황                           |
| `/goals/edit`                        | `pages/Web/GoalEditPage`                | 목표 설정 / 수정                                |
| `/badges`                            | `pages/Web/BadgeListPage`               | 뱃지 전체                                       |
| `/badges/:badgeId`                   | `pages/Web/BadgeDetailPage`             | 뱃지 상세                                       |
| `/community`                         | `pages/Web/CommunityListPage`           | 커뮤니티 피드 목록                              |
| `/community/new`                     | `pages/Web/PostComposePage`             | 피드 게시글 작성                                |
| `/community/:postId`                 | `pages/Web/PostDetailPage`              | 피드 게시글 상세                                |
| `/tags/:tag`                         | `pages/Web/HashtagPage`                 | 해시태그 검색 결과                              |
| `/crews`                             | `pages/Web/CrewSearchPage`              | 크루 검색 / 목록                                |
| `/crews/:crewId`                     | `pages/Web/CrewDetailPage`              | 크루 상세                                       |
| `/crews/:crewId/recruits/new`        | `pages/Web/RecruitComposePage`          | 모집글 작성                                     |
| `/crews/:crewId/recruits/:recruitId` | `pages/Web/RecruitDetailPage`           | 모집글 상세                                     |
| `/profile`                           | `pages/Web/ProfilePage`                 | 프로필 / 계정                                   |
| `/profile/edit`                      | `pages/Web/ProfileEditPage`             | 프로필 편집                                     |
| `/settings`                          | `pages/Web/SettingsPage`                | 설정                                            |
| `/followers`                         | `pages/Web/FollowersPage`               | 팔로워 / 팔로잉                                 |
| `/notifications`                     | `pages/Web/NotificationsPage`           | 알림 풀 페이지                                  |
| `/states`                            | `pages/Web/StatesPage`                  | 빈 상태 / 로딩 상태 카탈로그                    |
| `/error/forbidden`                   | `pages/Web/ErrorStatePage`              | 접근 제한                                       |
| `/error/server`                      | `pages/Web/ErrorStatePage`              | 서버 오류                                       |
| `/mypage`                            | `Navigate`                              | `/profile` 로 redirect                          |
| `*`                                  | `pages/Web/ErrorStatePage`              | 404                                             |

새 라우트 추가 시 `src/App.tsx` 의 `<Routes>` 에 등록하고 위 표에 추가한다.

### Current State (구현 여부 요약)

Codex 가 빠르게 현 상태를 파악할 수 있도록 유지 — 기능 추가/제거 시 같이 갱신.

**구현 완료**

- ✅ Figma `Web Design — Dallyrun` 기준 웹 화면 26개 라우트 구현 — `WebShell` 기반 대시보드, 기록, 목표, 뱃지, 커뮤니티, 크루, 프로필, 설정, 상태 화면
- ✅ 정적 mock 데이터 계층 (`src/mock/dallyrun.ts`) — 러닝 기록, 목표, 뱃지, 게시글, 해시태그, 크루, 모집글, 프로필, 알림, 설정성 데이터를 id 기반으로 연결
- ✅ 웹 mock 인터랙션 — 전역 검색/알림 드롭다운, 기록·뱃지·커뮤니티·크루·알림 필터, 목표/프로필/설정 localStorage 저장, 러닝 상세 스플릿/사진/메모 조작, 게시글 작성/좋아요/댓글/공유, 모집글 작성 후 크루 데이터 반영, 모집글 참여 토글
- ✅ 이메일/비밀번호 로그인 (`/login`) — 기본 mock API 로 동작, 성공 시 `/home`
- ✅ 러너 회원가입 (`/signup`) — 기본 mock API 로 동작, 비밀번호 5규칙 실시간 체크리스트, 닉네임/나이/성별 검증, 성공 시 `/home`
- ✅ 비밀번호 재설정 (`/password-reset`) — 이메일 입력, 발송 안내, 새 비밀번호 입력 5규칙 체크리스트
- ✅ 토큰 **localStorage 영속화** — `authStore` 의 `persist` 미들웨어, key `dallyrun-auth`
- ✅ `authedRequest` 래퍼 — `Authorization: Bearer <access>` 자동 부착 + **401 시 자동 refresh 재시도 1회** + 실패 시 `authStore.clear()`
- ✅ 네트워크 실패(`NetworkError`) → **한글 친절 메시지** 로 UI 에 노출 (`toUserMessage`)
- ✅ GitHub Actions CI (typecheck / lint / format:check / test / build 5개 matrix)
- ✅ HomePage (`/`) 를 온보딩 진입 화면으로 전환
- ✅ 브랜드 테마 (로고 파랑 기반 디자인 토큰)
- ✅ 마이페이지 호환 redirect (`/mypage` → `/profile`)
- ✅ 회원탈퇴 API (`DELETE /api/members/me`) 연동
- ✅ Mock API 기본 모드 (`VITE_USE_MOCK_API` 가 `false` 가 아닐 때) — 백엔드 없이 인메모리 핸들러로 전체 시퀀스 검증. 시드 `test@dallyrun.com` / `Test1234!@`

**미구현 (의도적 스코프 밖)**

- ❌ `ProtectedRoute` 컴포넌트화 — 현재 웹 디자인 라우트는 사용자 요청에 따라 인증 가드 없이 공개 접근 가능. 보호 페이지가 생기면 추출 예정.
- ❌ `/api/me` 같은 유저 정보 엔드포인트 — 백엔드 미제공이라 `authStore.user` 는 항상 `null`
- ❌ `authedRequest` 의 실제 프로덕션 호출 지점 — 현재는 유닛 테스트에서만 커버. `logout` / `deleteAccount` 는 401 의미 충돌 또는 일회성 이유로 의도적으로 `apiRequest` 를 직접 사용.
- ❌ 웹 디자인 mock 화면의 실제 백엔드 연동 — `VITE_USE_MOCK_API=false` 전환 전까지 화면 데이터는 `src/mock/dallyrun.ts` 정적 데이터 사용.
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
  - `DELETE /api/members/me` — 인증 필요 + JSON `{ password }`, 200 (바디 없음). soft delete + refresh token 폐기. 401 의미가 두 가지(`INVALID_TOKEN` / `INVALID_CREDENTIALS`)라 status 만으론 구분 불가 → UI 는 401 을 일괄 "비밀번호 불일치" 로 안내.
- `src/api/client.ts` 의 `apiRequest<T>` 는 body 가 `FormData` 이면 `Content-Type` 을 설정하지 않고 그대로 전송하여 multipart 를 지원한다.
- API 함수는 `src/api/auth.ts` 의 `loginWithEmail`, `signupWithEmail`, `refreshTokens`, `logout`, `deleteAccount`.
  - `logout(accessToken)` 은 서버 호출 실패(401/500 등)에도 `ApiError` 를 **swallow** 한다 — 네트워크 상태와 무관하게 로컬 토큰 정리를 보장하기 위함. 호출자가 반드시 이어서 `useAuthStore.getState().clear()` 를 실행해야 함.
  - `deleteAccount(accessToken, password)` 는 `authedRequest` 가 아닌 plain `apiRequest` 사용. 이 엔드포인트의 401 은 비번 불일치일 수 있어 자동 refresh 재시도가 사용자를 튕겨내는 부작용을 만들 수 있기 때문. UI 가 401 을 잡아 인라인 에러로 처리.
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

- 백엔드 베이스 URL 은 `VITE_API_BASE_URL` 환경 변수로 주입 (`.env.local` 또는 빌드 시 주입). 템플릿은 [`.env.example`](./.env.example) 참고.
- `src/api/client.ts` 의 `apiRequest<T>()` 를 통해 모든 요청을 수행한다. 직접 `fetch` 호출을 페이지/컴포넌트에 흩뿌리지 않는다.
- 민감한 값(비밀번호, 시크릿, OAuth 크리덴셜)은 문서·커밋·이슈·PR 본문 등 git 기록에 절대 포함하지 않는다.

#### Mock API 모드

- 기본값은 mock API 이다. `VITE_USE_MOCK_API` 가 명시적으로 `false` 가 아닐 때 `apiRequest()` 는 백엔드 fetch 대신 `src/api/mockApi.ts` 의 인메모리 핸들러로 분기한다. 실제 API 로 전환할 때만 `VITE_USE_MOCK_API=false` 와 `VITE_API_BASE_URL` 을 함께 설정한다.
- 페이지·스토어·`auth.ts`·`authedRequest.ts` 는 변경 없이 동일하게 동작 — 백엔드 없이 회원가입 → 로그인 → 프로필 → 로그아웃 → 회원탈퇴 전체 시퀀스를 UI 에서 끝까지 검증할 수 있다.
- 시드 계정: `test@dallyrun.com` / `Test1234!@`. 사용자 등록 정보는 모듈 인메모리 (페이지 전환 유지, F5 새로고침 시 시드만 남음).
- 새 endpoint 가 추가되면 `mockApi.ts` 의 switch 에 케이스를 함께 추가한다 (등록 안 된 라우트는 mock 모드에서 404).

## Code Quality

- **Testable 한 코드** 작성: 외부 의존성은 훅 또는 props 로 주입 가능한 형태로 설계한다.
- 기능 구현 시 **테스트 코드를 반드시 함께 작성**한다. 최소한 스모크 렌더 테스트 1건은 포함.
- `any` 사용 지양, 불가피할 때만 한정된 범위에서 주석과 함께 사용.
- PR 병합 전 `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` 모두 통과해야 한다.

## Code Review

Codex 가 PR 리뷰를 요청받으면 구현자가 아니라 **직접 코드 리뷰어**로 동작한다. 리뷰는
승인/칭찬보다 결함 발견을 우선하며, 별도 CI, hook, 서브에이전트에 위임하지 않는다.

### Review Scope

- 기준 diff 는 `main...HEAD` 이며, 열려있는 PR 이 있으면 PR 본문과 커밋 로그도 함께 읽는다.
- 리뷰 대상은 변경된 코드, 테스트, 문서, 설정, PR 설명의 일관성이다.
- CI 결과는 보조 신호로만 사용한다. 로컬 diff 를 직접 읽고 판단한다.
- 사용자 변경으로 보이는 기존 dirty worktree 는 되돌리지 않고, 리뷰 범위와 충돌할 때만 명시한다.

### Review Priorities

1. **버그 / 회귀 위험** — 런타임 오류, 잘못된 상태 전이, API 계약 위반, 라우팅/인증 흐름
   깨짐, 데이터 손실 가능성을 가장 먼저 본다.
2. **테스트 누락** — 새 기능, 위험한 분기, 회귀 가능성이 있는 수정에 필요한 테스트가 빠졌는지
   확인한다.
3. **아키텍처 / 유지보수성** — 단일 책임, 레이어 분리, import 규칙, `@/...` alias, 상태 관리
   경계, 재사용 가능한 유틸 위치를 점검한다.
4. **UI / 접근성 / 스타일** — 역할 기반 접근성, 반응형 레이아웃, CSS Modules, 전역 스타일 변경
   범위, 디자인 토큰 사용을 확인한다.
5. **Git / 문서 / 보안** — Conventional Commits, PR 본문 검증 결과, AGENTS.md 갱신 필요성,
   민감값 포함 여부를 확인한다.

### Review Output

- 리뷰 결과는 기본적으로 **한국어**로 작성한다. 코드 식별자, 에러 메시지, 외부 API 이름처럼 원문이
  중요한 항목만 영어를 유지한다.
- 발견 사항을 먼저 쓴다. 심각도 높은 순으로 정렬하고, 각 항목은 정확한 `파일:라인` 을 포함한다.
- 각 발견 사항은 "무엇이 깨지는지 / 어떤 조건에서 재현되는지 / 어떻게 고치면 좋은지" 를 짧게
  설명한다.
- 문제가 없으면 "발견 사항 없음" 을 명확히 쓰고, 남은 테스트 공백이나 수동 확인 필요성만 덧붙인다.
- 요약과 칭찬은 발견 사항 뒤에 짧게 둔다.
- 프로젝트 전용 체크리스트는 [`.agents/skills/source-command-review-pr/`](./.agents/skills/source-command-review-pr/SKILL.md)
  를 따른다.

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
- **import 문은 항상 파일 최상단**에 모아 둔다. 함수/블록 내부 import 와 동일 모듈 중복 import 금지 (ESLint `import/first` + `import/no-duplicates` 로 강제). 코드 분할이 필요한 진짜 동적 로딩만 예외이며, 그 경우에도 ESLint disable 코멘트로 의도를 표시한다.
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

저장소 루트의 `.agents/`, `.codex/`, `.github/` 에 프로젝트 전용 자동화 설정이 있다.

- [`.agents/skills/create-pr/`](./.agents/skills/create-pr/SKILL.md) — 현재 브랜치를 PR 로 올리는 표준 플로우
- [`.agents/skills/source-command-dev/`](./.agents/skills/source-command-dev/SKILL.md) — 개발 서버 실행 플로우
- [`.agents/skills/source-command-check/`](./.agents/skills/source-command-check/SKILL.md) — 로컬 검증 게이트 실행 플로우
- [`.agents/skills/source-command-test/`](./.agents/skills/source-command-test/SKILL.md) — Vitest 실행 플로우
- [`.agents/skills/source-command-review-pr/`](./.agents/skills/source-command-review-pr/SKILL.md) — 현재 브랜치/PR 리뷰 플로우
- [`.agents/skills/source-command-fix-issue/`](./.agents/skills/source-command-fix-issue/SKILL.md) — GitHub 이슈 처리 플로우
- [`.agents/hooks/architecture-alignment.md`](./.agents/hooks/architecture-alignment.md) — 레이어 분리 / 단일 책임 / 의존 방향 체크리스트 (명시 호출용)
- [`.agents/FEEDBACK.md`](./.agents/FEEDBACK.md) — 검증 실패 / 리뷰 지적 / 트레이드오프 교훈을 누적하는 피드백 루프
- [`.codex/agents/troubleshooting-recorder.toml`](./.codex/agents/troubleshooting-recorder.toml) — 피드백 루프 기록 기준을 담은 Codex 보조 에이전트 설정
- [`.github/pull_request_template.md`](./.github/pull_request_template.md) — PR 검증 게이트와 피드백 루프 체크리스트

> 프로젝트 규칙(React/테스트/스타일/커밋/검증 게이트)은 본 `AGENTS.md` 가 단일 소스(SSOT)다. Codex 전용 보조 지침은 `.agents/` 와 `.codex/` 에만 둔다.
