---
name: 'source-command-test'
description: 'Vitest 실행 (전체 또는 특정 파일/테스트 이름)'
---

# source-command-test

Use this skill when the user asks to run the migrated source command `test`.

## Command Template

# /test

Vitest 를 실행한다.

## 사용법

- 인자 없음 → `npm run test` (전체 1회)
- 인자가 파일 경로처럼 생긴 경우 (`src/...` 또는 `*.test.tsx`) → `npx vitest run <path>`
- 인자가 테스트 이름처럼 생긴 경우 → `npx vitest run -t "<name>"`

## 동작

1. 인자 파싱해 위 규칙 적용
2. Bash 로 실행
3. 실패한 테스트가 있으면 에러 로그를 그대로 사용자에게 전달하고, 수정 제안은 **하지 않는다** (사용자가 원할 때만).

## 참고

- 테스트 파일은 대상과 같은 폴더의 `*.test.ts(x)` 이어야 한다 (`.Codex/rules/testing.md`).
