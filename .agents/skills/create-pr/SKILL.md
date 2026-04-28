---
name: create-pr
description: 현재 브랜치의 변경점을 요약해 Dallyrun Front 규칙에 맞춰 PR 제목과 본문 초안을 만든다. 브랜치 push 가 필요하면 함께 수행하고 gh pr create 로 PR 을 올린다.
---

# create-pr

Dallyrun Front 저장소에서 PR 생성 플로우를 표준화한다.

## 입력

- 선택: PR 제목 힌트 (짧은 문구). 없으면 커밋 메시지와 diff 에서 추론.
- 선택: 연관 이슈 번호. 있으면 본문에 `Closes #<num>` 추가.

## 절차

1. **현재 상태 파악** (아래 명령을 병렬 실행)
   - `git status --short`
   - `git branch --show-current`
   - `git log --oneline main..HEAD`
   - `git diff main...HEAD --stat`
   - 원격 추적 여부 (`git rev-parse --abbrev-ref --symbolic-full-name @{u}` 또는 실패 시 미푸시로 판단)

2. **커밋 누락 확인**
   - 스테이지/미커밋 변경이 있으면 사용자에게 알리고 **진행 중단**.
   - main 브랜치에 있으면 경고 후 중단 (`.Codex/rules/conventional-commits.md` 참고).

3. **푸시**
   - 원격 추적이 없으면 `git push -u origin <branch>`
   - 이미 추적 중이고 ahead 면 `git push`

4. **PR 초안 작성**
   - 제목: Conventional Commits prefix + 한 줄 요약 (70자 이하)
   - 본문 템플릿:

     ```
     ## Summary
     - 1~3줄 요약

     ## Changes
     - 파일/모듈 단위 주요 변경점

     ## Test plan
     - [x] npm run typecheck
     - [x] npm run lint
     - [x] npm run test
     - [x] npm run build
     - [ ] 추가 수동 검증 항목 (있으면)

     ## Follow-ups
     - 이번 스코프 밖이지만 인지하고 있는 후속 작업
     ```

   - 연관 이슈가 있으면 본문 맨 끝에 `Closes #<num>`

5. **PR 생성**
   - `gh pr create --title "<title>" --body "$(cat <<'EOF' ... EOF)"` 패턴으로 HEREDOC 사용
   - 생성 후 반환된 URL 을 사용자에게 표시

## 금지

- 제목/본문에 Codex/AI 언급(`Co-Authored-By` 포함) 금지.
- main 에 직접 푸시 금지.
- 민감값(토큰/시크릿/OAuth 크리덴셜) 포함 금지.

## 실패 처리

- `gh pr create` 가 실패하면 원인(미푸시, 보호 브랜치 등)을 해석해서 사용자에게 알린다.
- 이미 열려있는 PR 이 있으면 새로 만들지 말고 URL 만 출력한다 (`gh pr view --json url`).
