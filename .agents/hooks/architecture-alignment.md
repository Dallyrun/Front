---
description: Reminder to align with Dallyrun Front layered architecture
trigger: explicit
---

# Architecture Alignment Hook

## Objective

Dallyrun Front 의 모든 코드 변경이 [`AGENTS.md`](../../AGENTS.md) 의 **Architecture > Directory Layout / Routes / Auth** 섹션이 정의한 레이어 분리를 따르도록 한다. 백엔드의 도메인 분리(DDD)와 달리, 프론트엔드는 _역할 기반 레이어_ 로 분리한다.

## Checklist

새 파일을 만들거나 기존 파일을 리팩터하기 전에 점검한다.

### 1. 레이어 식별 (Layer Isolation)

코드가 다음 중 어디에 속하는지 먼저 결정한다. 한 파일이 두 레이어 책임을 동시에 가지면 분리한다.

| 책임                         | 위치                               |
| ---------------------------- | ---------------------------------- |
| 라우트 단위 페이지 / 화면    | `src/pages/<Page>/<Page>.tsx`      |
| 재사용 가능한 UI 컴포넌트    | `src/components/<Name>/<Name>.tsx` |
| 공용 커스텀 훅               | `src/hooks/use<Xxx>.ts`            |
| 전역 클라이언트 상태         | `src/stores/`                      |
| 백엔드 HTTP 호출             | `src/api/`                         |
| 순수 로직 / 입력 검증 / 변환 | `src/utils/`                       |
| 공유 타입 / 응답 스키마      | `src/types/`                       |
| 정적 자산                    | `src/asset/`                       |
| 테스트 셋업                  | `src/test/setup.ts`                |

기존 어느 레이어에도 깔끔하게 안 맞는다면, 새 레이어가 정말 필요한지 또는 기존 파일을 더 잘게 쪼갤 수 있는지 검토한다. 새 레이어를 추가하면 `AGENTS.md` Directory Layout 섹션도 함께 갱신한다.

### 2. 단일 책임 (Layered Responsibility)

- **`pages/`** — 라우트 진입점. 라우터 / 스토어 / 훅 / API 호출을 _조립_ 만 한다. 비즈니스 로직(검증, 변환, 에러 메시지)은 인라인하지 말고 `utils/` 또는 `api/` 로 추출한다.
- **`components/`** — 프레젠테이션. 컴포넌트 안에서 직접 `fetch` 하지 않고 props 또는 훅으로 데이터를 주입받는다.
- **`hooks/`** — React 의존성을 가진 재사용 로직. 페이지·컴포넌트를 import 하지 않는다.
- **`stores/`** — Zustand 스토어. UI 컴포넌트나 페이지를 import 하지 않는다.
- **`api/`** — HTTP 호출만 담당. `apiRequest` / `authedRequest` 를 통해서만 통신하고, 컴포넌트 / 페이지를 import 하지 않는다. 응답 envelope · 에러 클래스(`ApiError`, `NetworkError`)는 여기서만 다룬다.
- **`utils/`** — 순수 함수. `React`, `fetch`, store, DOM 에 의존하지 않는다 (테스트 용이성). 입력 → 출력만 가지는 함수만 둔다.
- **`types/`** — 타입 선언만. 런타임 코드 금지.

### 3. 의존 방향 (Dependency Rule)

```
pages  →  components, hooks, stores, api, utils, types   ✅
components → components, hooks, utils, types            ✅
hooks  →  stores, api, utils, types                     ✅
stores →  api, utils, types                             ✅
api    →  utils, types                                  ✅
utils  →  utils, types                                  ✅
types  →  types                                         ✅
```

- 화살표 반대 방향은 모두 금지 (예: `utils` → `api` ❌, `components` → `pages` ❌, `stores` → `components` ❌).
- 도메인 간 결합이 필요해 보이면 공통 의존성을 더 낮은 레이어(`utils` / `types`) 로 끌어내거나 호출자(`pages`) 가 양쪽을 조립한다.
- 절대 경로 import 는 항상 `@/...` (tsconfig + Vite 별칭). 같은 폴더 내에서만 상대 경로 사용.
- import 문은 항상 파일 최상단에 모은다. 함수 / 블록 내부 import 와 동일 모듈 중복 import 금지.

### 4. 테스트 위치

- 테스트는 대상 파일과 동일 폴더에 `*.test.ts(x)` 로 둔다 (`Logo/Logo.test.tsx`, `utils/password.test.ts`).
- 새 페이지 / 컴포넌트 / 훅 / 유틸은 최소 스모크 테스트 1건을 함께 추가한다.
- API 호출은 MSW 도입 전까지 `apiRequest` 를 모킹한다.

### 5. 검증 게이트 & 문서

- 변경 범위에 맞는 [Verification Gates](../../AGENTS.md#verification-gates) 를 실행하고 PR 본문에 결과를 남긴다.
- 새 페이지·컴포넌트·훅·스토어·라이브러리·환경 변수가 추가되면 `AGENTS.md` 의 해당 섹션을 같은 PR 에서 갱신한다.
- 트러블슈팅 / 트레이드오프 / 성능 개선 결정은 [`.agents/FEEDBACK.md`](../FEEDBACK.md) 에 누적한다.

## Reference

- [`AGENTS.md`](../../AGENTS.md) — 프로젝트 규칙의 단일 소스(SSOT)
- [`AGENTS.md` > Architecture](../../AGENTS.md#architecture) — 레이어와 디렉터리 정의
- [`AGENTS.md` > Coding Conventions](../../AGENTS.md#coding-conventions) — 네이밍·스타일·import 규칙
- [`.agents/FEEDBACK.md`](../FEEDBACK.md) — 누적된 교훈
