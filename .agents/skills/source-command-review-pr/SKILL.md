---
name: 'source-command-review-pr'
description: '현재 브랜치/PR 변경점을 프론트 규칙 기준으로 리뷰'
---

# source-command-review-pr

Use this skill when the user asks to run the migrated source command `review-pr`.

## Command Template

# /review-pr

열려있는 PR 또는 현재 브랜치의 변경점을 직접 리뷰한다.

## 동작

1. 컨텍스트 수집:
   - `git branch --show-current`
   - `git log --oneline main..HEAD`
   - `git diff main...HEAD --stat`
   - `git diff main...HEAD` (큰 변경이면 파일별로 나눠서)
   - 열린 PR 이 있으면 `gh pr view` 로 설명 확인
2. 루트 `AGENTS.md` 의 `Code Review` 섹션을 기준으로 발견 사항을 먼저 찾는다:

   **리뷰 원칙**
   - 직접 `main...HEAD` diff 와 PR 본문을 읽고 판단한다.
   - CI, hook, 서브에이전트 결과는 보조 신호로만 사용한다.
   - 리뷰 결과는 기본적으로 **한국어**로 작성한다. 코드 식별자, 에러 메시지, 외부 API 이름처럼
     원문이 중요한 항목만 영어를 유지한다.
   - 발견 사항은 버그/회귀 위험/테스트 누락을 우선하고 심각도 순으로 제시한다.
   - 각 발견 사항에는 정확한 `파일:라인`, 재현 조건 또는 영향, 수정 방향을 포함한다.
   - 발견 사항이 없으면 "발견 사항 없음" 을 명확히 쓰고 남은 테스트 공백만 적는다.

3. 아래 체크리스트를 **각 항목별로** 평가, 통과/의심/위반 3단계로 분류:

   **코드 품질**
   - [ ] 새/수정 컴포넌트에 props interface 가 명시돼 있는가 (`React.FC` 금지)
   - [ ] 함수형 컴포넌트 + 훅만 사용
   - [ ] 상태 분리: 로컬(useState) / 서버(react-query) / 전역(Zustand)
   - [ ] 컴포넌트/페이지가 폴더 단위로 구성 (`Name/Name.tsx`, `.module.css`, `.test.tsx`)
   - [ ] `any`, `!` non-null assertion, `console.log` 미사용
   - [ ] alias import 는 `@/...`

   **테스트**
   - [ ] 새 기능에 최소 스모크 렌더 테스트 1건 포함
   - [ ] role 기반 쿼리 우선 (`getByRole`, `getByLabelText`)
   - [ ] 네트워크 호출은 `vi.mock` 으로 격리

   **스타일**
   - [ ] 전역 스타일 변경은 `src/index.css` 에만
   - [ ] 반복되는 값은 CSS custom property 로 승격

   **Git / PR**
   - [ ] 커밋 메시지가 Conventional Commits 형식
   - [ ] 커밋/PR 본문에 Codex/AI 언급(Co-Authored-By 등) **없음**
   - [ ] main 에 직접 커밋하지 않음 (PR 경유)

   **문서**
   - [ ] 새 라우트/컴포넌트/훅/스토어/라이브러리 → AGENTS.md 반영

4. 결과를 Markdown 으로 출력한다:
   - 발견 사항이 있으면 심각도 순 목록을 먼저 출력
   - 그 다음 체크리스트 평가를 출력
   - 위반/의심 항목은 **정확한 파일:라인** 을 포함
   - 마지막에 `확인 질문` / `요약` 을 짧게 출력

## 참고

- 프로젝트 지침: `AGENTS.md`
