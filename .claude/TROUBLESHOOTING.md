# Troubleshooting · Trade-offs · Performance Log

> Historical archive. New shared feedback-loop entries go to [`.agents/FEEDBACK.md`](../.agents/FEEDBACK.md).

이 파일은 작업 중 발생한 **트러블슈팅 / 트레이드오프 / 성능 개선** 을 시간 역순으로 누적한다.
**새 항목은 항상 맨 위.** 매 턴 종료 시 `.claude/settings.json` 의 Stop 훅이 서브에이전트를 띄워
변경분을 검토하고 자동 추가한다 — 수동 실행은 필요 없음.

각 항목 형식:

- `## YYYY-MM-DD — 한 줄 제목 [Troubleshooting | Tradeoff | Performance]`
- **상황**: 어떤 작업 중이었나
- **현상 / 결정**: 무엇이 문제였나 / 무엇을 정했나
- **해결 / 근거**: 어떻게 풀었나 / 왜 그 선택인가
- **참조**: PR · 파일 · 커밋

---

## 2026-04-23 — jsdom localStorage 폴리필 [Troubleshooting]

- **상황**: `authStore` 에 zustand `persist` 미들웨어를 추가하면서 LoginPage / SignupPage 테스트가 갑자기 죽음.
- **현상**: `TypeError: storage.setItem is not a function` 이 `beforeEach` 의 `useAuthStore.getState().clear()` 시점에 발생. jsdom 의 localStorage 가 zustand 가 기대하는 인터페이스와 미세하게 안 맞음.
- **해결**: `src/test/setup.ts` 에 인메모리 Map 기반 `Storage` 폴리필 (`getItem`/`setItem`/`removeItem`/`clear`/`key`/`length`) 을 정의하고, `globalThis.localStorage` 에 주입. zustand persist 가 안전하게 동작.
- **참조**: PR #10, `src/test/setup.ts`

## 2026-04-23 — 토큰 localStorage 영속화 [Tradeoff]

- **상황**: 백엔드 인증 API 연동하면서 새로고침 후에도 세션이 유지되어야 함.
- **결정**: zustand `persist` 미들웨어로 localStorage 의 `dallyrun-auth` 키에 토큰 저장.
- **근거**: 대안 (메모리 / sessionStorage / HttpOnly cookie) 중 MVP 단계에선 단순성·UX 가 가장 큰 가치. XSS 위험은 인지하되, 백엔드가 cookie 기반으로 진화하면 그때 마이그레이션. `partialize` 로 setter 는 직렬화에서 제외.
- **참조**: PR #10, `src/stores/authStore.ts`

## 2026-04-23 — `logout` 이 `ApiError` 를 swallow [Tradeoff]

- **상황**: 로그아웃 API 가 401/500 등으로 실패하는 경우의 처리 정책 결정.
- **결정**: `logout(accessToken)` 은 `ApiError` 를 catch 하고 throw 하지 않음. 호출자는 반드시 이어서 `useAuthStore.getState().clear()` 를 실행.
- **근거**: 로컬 토큰 정리는 네트워크 상태와 무관하게 항상 보장돼야 함. "로그아웃 실패" 는 사용자 입장에서 의미 없는 메시지. 단, 다른 ApiError 를 swallow 하지 않으려면 명시적 분기 필요할 수 있음 — 추후 토스트 시스템 도입 시 재검토.
- **참조**: PR #10, `src/api/auth.ts`

## 2026-04-23 — jsdom `URL.createObjectURL` 폴리필 [Troubleshooting]

- **상황**: SignupPage 의 프로필 이미지 미리보기 (`URL.createObjectURL`) 테스트가 jsdom 에서 throw.
- **해결**: `src/test/setup.ts` 에 `URL.createObjectURL` / `URL.revokeObjectURL` 모킹 (각각 `'blob:mock'` 반환 / no-op).
- **참조**: PR #9, `src/test/setup.ts`

## 2026-04-22 — `TypeError: Failed to fetch` → `NetworkError` 친절 메시지 [Tradeoff]

- **상황**: 백엔드가 안 떠 있거나 CORS preflight 실패 시 UI 에 raw `Failed to fetch` 가 그대로 노출됨.
- **결정**: `apiRequest` 가 fetch 실패를 `NetworkError` 로 wrap, UI 에서는 `toUserMessage` 로 "서버에 연결할 수 없습니다…" 한글 메시지로 변환.
- **근거**: 사용자에겐 기술 용어 무의미. CORS preflight 실패도 같은 표면이므로 통합 처리 가능.
- **참조**: PR #11, `src/api/client.ts`, `src/utils/errorMessage.ts`

## 2026-04-22 — zustand persist 의 `createJSONStorage` 명시 제거 [Troubleshooting]

- **상황**: 처음 persist 도입 시 `storage: createJSONStorage(() => localStorage)` 명시.
- **현상**: jsdom 환경에서 `setItem is not a function` 발생.
- **해결**: `storage:` 옵션 자체를 제거하고 zustand 의 기본 storage(localStorage + JSON 직렬화)에 의존. 정상 동작.
- **교훈**: 단순한 localStorage 케이스는 `createJSONStorage` 를 명시하지 않는 게 호환성 측면에서 안전.
- **참조**: PR #10, `src/stores/authStore.ts`

## 2026-04-22 — `tsconfig.tsbuildinfo` 추적 해제 [Tradeoff]

- **상황**: 초기 init 커밋에 `tsconfig.tsbuildinfo` 가 같이 들어가 매번 git diff 노이즈 발생.
- **결정**: `.gitignore` 에 `*.tsbuildinfo` 추가하고 `git rm --cached` 로 트래킹 해제.
- **근거**: 빌드 캐시 파일은 매 빌드마다 변하므로 추적할 가치가 없음.
- **참조**: PR #5

## 2026-04-22 — `.claude/*` 파일 prettier 미포맷 → main CI 실패 [Troubleshooting]

- **상황**: PR #2 (.claude 셋업) 머지 후 PR #3 (CI) 가 합쳐지자 main CI 의 `format:check` 가 `.claude/commands/fix-issue.md`, `.claude/skills/create-pr/SKILL.md` 에서 실패.
- **원인**: PR #2 머지 시점엔 CI 가 없어서 prettier 위반이 못 잡혔던 것.
- **해결**: 핫픽스 PR (#4) 로 `prettier --write` 적용해 정리.
- **교훈**: 새 디렉터리 추가 PR 은 이후 CI 가 활성화되면 사전 검증이 필요. 이젠 CI 가 main 에 있어 같은 문제 재발 안 함.
- **참조**: PR #4

## 2026-04-21 — `.claude/rules/` 제거 (솔로 SSOT) [Tradeoff]

- **상황**: 초기 셋업에서 YAPP 스타일을 따라 `.claude/rules/*.md` 에 React/Test/Style/Commit 규칙 별도 파일을 두려 했음.
- **결정**: 솔로 작업이라 CLAUDE.md 와 이중관리되는 게 부담 — `.claude/rules/` 폴더를 제거하고 CLAUDE.md 가 단일 소스(SSOT).
- **근거**: Claude Code 가 자동 로드하는 파일은 CLAUDE.md 뿐. 별도 디렉터리는 누락 위험만 키움.
- **참조**: 초기 셋업 PR
