---
description: typecheck + lint + test + build 일괄 실행
---

# /check

PR 머지 전 통과해야 할 CI 상당의 검증을 로컬에서 한 번에 돌린다.

## 동작 (순서)

1. `npm run typecheck` — TypeScript 타입 검사 (`tsc --noEmit`)
2. `npm run lint` — ESLint
3. `npm run test` — Vitest 1회 실행
4. `npm run build` — 프로덕션 빌드 (`tsc -b && vite build`)

## 실패 처리

- 각 단계의 stderr 를 보존해서 사용자에게 **어느 단계에서 어떤 에러가 떴는지** 명확히 보고.
- 앞 단계가 실패해도 뒤 단계를 자동으로 스킵하지 않고 그대로 진행한다 (실패가 중첩되면 원인 파악이 더 쉬움).
- 모든 단계 통과 시 ✅ 체크리스트로 요약.

## 왜 필요한가

CLAUDE.md Code Quality 섹션: "PR 병합 전 `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` 모두 통과해야 한다."
