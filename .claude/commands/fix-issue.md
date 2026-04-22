---
description: GitHub 이슈 번호를 받아 브랜치 → 구현 → 테스트 → PR 까지
---

# /fix-issue

인자: 이슈 번호 (예: `/fix-issue 42`)

## 동작

1. 이슈 컨텍스트 수집:
   - `gh issue view <num>` 으로 제목/본문/라벨 확인
   - 본문에 재현 방법/수용 기준이 있으면 체크리스트로 정리

2. **플랜 모드** 에 들어가서 구현 플랜을 먼저 작성하고 사용자 승인을 받는다.
   - CLAUDE.md Workflow 최상단 규칙: "작업 시작 시 반드시 플랜 모드로 계획을 세운 뒤 승인받고 구현한다."

3. 브랜치 생성:
   - 이슈가 버그 → `fix/issue-<num>-<slug>`
   - 이슈가 기능 → `feat/issue-<num>-<slug>`
   - 그 외 → `refactor/...` 등 성격에 맞게

4. 구현:
   - 변경이 닿는 소스/스타일 수정
   - 해당 기능의 테스트 코드 **반드시 함께 작성** (Vitest + RTL, 최소 스모크 1건)
   - 새 라우트/훅/스토어/라이브러리면 CLAUDE.md 도 업데이트

5. 검증: `/check` (typecheck + lint + test + build) 전부 통과

6. 커밋 (Conventional Commits, Claude/AI 언급 금지):

   ```
   fix: <한 줄 요약> (#<num>)
   ```

7. 푸시 후 PR 생성:
   - 제목: 커밋 메시지와 동일
   - 본문: Summary / Changes / Test plan / Follow-ups
   - 본문 끝에 `Closes #<num>` 추가

## 주의

- 이슈가 모호하면 먼저 `AskUserQuestion` 으로 범위/기대 결과를 확인.
- main 에는 절대 직접 커밋 금지.
