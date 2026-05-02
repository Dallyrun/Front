# Feedback Loop

Use this file for reusable learnings from failed checks, review feedback, debugging, performance work, or trade-off decisions. Keep entries short and actionable.

Add an entry when:

- CI, local verification, or a reviewer catches something that future work could avoid.
- A bug fix reveals a project-specific testing, API, routing, styling, or state-management pattern.
- The same correction is needed more than once.
- A decision creates a trade-off future agents or teammates should remember.

Do not add an entry for routine code changes, simple documentation edits, or passing verification with no new lesson.

When the same lesson appears twice, promote it into a stronger harness: a test, lint rule, script, PR checklist item, or explicit `AGENTS.md` rule.

## Entry Template

```md
## YYYY-MM-DD - Short title

- Trigger:
- Symptom:
- Root cause:
- Fix:
- Harness update:
```

## Historical Entries

The entries below were migrated from the previous tool-specific troubleshooting archive when the repository became Codex-only.

## 2026-04-23 - jsdom localStorage 폴리필

- Trigger: `authStore` 에 zustand `persist` 미들웨어를 추가하면서 LoginPage / SignupPage 테스트가 실패.
- Symptom: `TypeError: storage.setItem is not a function` 이 `beforeEach` 의 `useAuthStore.getState().clear()` 시점에 발생.
- Root cause: jsdom 의 `localStorage` 가 zustand persist 가 기대하는 storage 인터페이스와 맞지 않음.
- Fix: `src/test/setup.ts` 에 인메모리 Map 기반 `Storage` 폴리필을 정의하고 `globalThis.localStorage` 에 주입.
- Harness update: storage 관련 테스트 실패 시 `src/test/setup.ts` 폴리필을 먼저 확인한다.

## 2026-04-23 - 토큰 localStorage 영속화

- Trigger: 백엔드 인증 API 연동 중 새로고침 후 세션 유지 필요.
- Symptom: 메모리 저장만으로는 새로고침/탭 재진입 시 인증 상태가 사라짐.
- Root cause: MVP 단계에서 cookie 기반 세션이 아직 없고, 클라이언트 세션 복원이 필요.
- Fix: zustand `persist` 미들웨어로 localStorage 의 `dallyrun-auth` 키에 토큰 저장. `partialize` 로 setter 직렬화 제외.
- Harness update: 백엔드가 cookie 기반으로 진화하면 localStorage 토큰 전략을 재검토한다.

## 2026-04-23 - `logout` 이 `ApiError` 를 swallow

- Trigger: 로그아웃 API 가 401/500 등으로 실패하는 경우의 처리 정책 결정.
- Symptom: 서버 로그아웃 실패를 그대로 노출하면 사용자가 로컬 세션에서 빠져나오지 못할 수 있음.
- Root cause: 로그아웃에서 사용자에게 중요한 것은 네트워크 상태와 무관한 로컬 토큰 정리.
- Fix: `logout(accessToken)` 은 `ApiError` 를 catch 하고 throw 하지 않음. 호출자는 이어서 `useAuthStore.getState().clear()` 를 실행.
- Harness update: 토스트 시스템 도입 시 어떤 로그아웃 실패를 사용자에게 알릴지 재검토한다.

## 2026-04-23 - jsdom `URL.createObjectURL` 폴리필

- Trigger: SignupPage 의 프로필 이미지 미리보기 테스트.
- Symptom: jsdom 에서 `URL.createObjectURL` 호출이 throw.
- Root cause: jsdom 환경에 브라우저 파일 미리보기 API 가 없음.
- Fix: `src/test/setup.ts` 에 `URL.createObjectURL` / `URL.revokeObjectURL` 모킹 추가.
- Harness update: 브라우저 전용 API 를 UI 테스트에서 쓰면 `src/test/setup.ts` 폴리필 대상인지 먼저 확인한다.

## 2026-04-22 - `TypeError: Failed to fetch` 사용자 메시지

- Trigger: 백엔드 미실행 또는 CORS preflight 실패 상태에서 UI 에러 노출 확인.
- Symptom: raw `Failed to fetch` 문구가 사용자에게 그대로 표시됨.
- Root cause: fetch reject 와 HTTP 에러 응답을 구분하지 않고 UI 에 전달.
- Fix: `apiRequest` 가 fetch 실패를 `NetworkError` 로 감싸고, UI 는 `toUserMessage` 로 한글 안내 문구로 변환.
- Harness update: API 호출 UI 는 raw 에러 대신 `toUserMessage` 를 통과한 메시지를 표시한다.

## 2026-04-22 - zustand persist 의 `createJSONStorage` 명시 제거

- Trigger: `authStore` persist 도입 시 `storage: createJSONStorage(() => localStorage)` 를 명시.
- Symptom: jsdom 환경에서 `setItem is not a function` 발생.
- Root cause: 명시 storage 설정이 테스트 환경 storage 호환성 문제를 노출.
- Fix: `storage:` 옵션을 제거하고 zustand 기본 localStorage + JSON 직렬화에 의존.
- Harness update: 단순 localStorage 케이스는 `createJSONStorage` 를 명시하지 않는 쪽을 기본값으로 삼는다.

## 2026-04-22 - `tsconfig.tsbuildinfo` 추적 해제

- Trigger: 초기 커밋에 `tsconfig.tsbuildinfo` 가 포함되어 반복 diff 발생.
- Symptom: 빌드마다 캐시 파일 변경이 git diff 노이즈로 남음.
- Root cause: TypeScript 빌드 캐시 파일이 추적 대상에 포함됨.
- Fix: `.gitignore` 에 `*.tsbuildinfo` 추가하고 트래킹 해제.
- Harness update: 빌드 캐시/산출물은 새로 생기면 추적 대상인지 먼저 확인한다.

## 2026-04-22 - 도구 설정 파일 prettier 미포맷으로 CI 실패

- Trigger: 새 도구 설정 디렉터리 추가 후 CI 활성화.
- Symptom: `format:check` 가 일부 마크다운 설정 파일에서 실패.
- Root cause: 설정 파일 추가 시점에는 CI 가 없어 prettier 위반이 사전에 잡히지 않음.
- Fix: prettier를 적용해 기존 파일 포맷 정리.
- Harness update: 새 디렉터리나 문서 파일을 추가하는 PR 도 `format:check` 를 실행한다.

## 2026-04-21 - 에이전트 규칙 파일 SSOT 정리

- Trigger: 초기 셋업에서 에이전트별 rules 디렉터리와 루트 규칙 파일이 이중화됨.
- Symptom: 자동 로드되는 파일과 별도 규칙 파일 사이에 누락/불일치 위험 발생.
- Root cause: 솔로 프로젝트에서 같은 규칙을 여러 위치에 유지하려는 구조.
- Fix: 프로젝트 공통 규칙은 `AGENTS.md` 로 모으고 보조 지침은 `.agents/` 로 제한.
- Harness update: 새 규칙은 먼저 `AGENTS.md` 또는 `.agents/` 에 둘 수 있는지 판단한다.
