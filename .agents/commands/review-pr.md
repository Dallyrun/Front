---
description: 현재 브랜치 또는 열린 PR 을 Dallyrun Front 규칙 기준으로 리뷰한다.
---

# /review-pr

현재 브랜치나 열린 PR 을 `.agents/agents/pr-reviewer.md` 지침에 따라 리뷰한다.

## 사용

- `/review-pr`
- `/review-pr <PR 번호 또는 URL>`
- `/review-pr main...HEAD`

## 절차

1. `.agents/agents/pr-reviewer.md` 를 읽고 리뷰어 역할로 전환한다.
2. PR 번호/URL 이 있으면 해당 PR 을 기준으로, 없으면 현재 브랜치의 `main...HEAD` 변경분을 기준으로 한다.
3. `git diff`, `gh pr view`, 테스트/문서 변경 여부를 확인한다.
4. 발견한 문제를 심각도 순으로 출력한다.

이 커맨드는 CI 를 실행하거나 PR 을 차단하지 않는다. 사람이 리뷰 전에 빠르게 위험 지점을 볼 수
있도록 돕는 로컬 리뷰 절차다.
