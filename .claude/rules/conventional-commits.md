# Git 커밋 & PR 규칙

> 원본: `CLAUDE.md` 의 "Git Convention" 섹션.

## Conventional Commits

커밋 메시지 **첫 줄**은 다음 중 하나의 prefix 로 시작한다.

| Prefix | 용도 |
|---|---|
| `feat:` | 새 기능 |
| `fix:` | 버그 수정 |
| `refactor:` | 동작 변화 없는 구조 개선 |
| `docs:` | 문서 변경 |
| `test:` | 테스트 추가/수정 |
| `chore:` | 빌드 / 의존성 / 자잘한 하우스키핑 |
| `ci:` | CI 설정 |

예:
```
feat: add email/password login scaffolding
fix: handle 401 in auth store (#42)
refactor(pages): split HomePage into Hero and Summary sections
```

## 금지 사항

- 커밋 메시지·PR 본문·이슈 등 **git 기록에 Claude/AI 관련 언급 금지**. `Co-Authored-By: Claude` 포함.
- `main` 브랜치에는 **직접 커밋 금지**. 반드시 PR 을 통해 머지한다.
- 민감값(비밀번호, 시크릿, OAuth 크리덴셜)을 커밋/PR/이슈 본문에 포함하지 않는다.

## 브랜치 네이밍

- 기능: `feat/<feature-name>`
- 버그: `fix/<bug-name>`
- 리팩터: `refactor/<scope>`
- 이슈 기반: `feat/issue-<num>-<slug>` 또는 `fix/issue-<num>-<slug>`

## PR 본문 구성 (권장)

```
## Summary
- 1~3줄 요약

## Changes
- 파일/모듈 단위 변경 요약

## Test plan
- [x] typecheck
- [x] lint
- [x] test
- [x] build
- [ ] 수동 확인 항목 ...

## Follow-ups
- 스코프 밖이지만 인지하고 있는 후속 작업
```

## 머지 후

- 병합된 원격 브랜치는 삭제 (`gh pr merge --delete-branch`).
- 로컬 브랜치 정리: `git fetch --prune` + 로컬 브랜치 삭제.
