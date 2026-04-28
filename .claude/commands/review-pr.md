---
description: 현재 브랜치/PR 변경점을 프론트 규칙 기준으로 리뷰
---

# /review-pr

열려있는 PR 또는 현재 브랜치의 변경점을 스스로 리뷰한다.

## 동작

1. 컨텍스트 수집:
   - `git branch --show-current`
   - `git log --oneline main..HEAD`
   - `git diff main...HEAD --stat`
   - `git diff main...HEAD` (큰 변경이면 파일별로 나눠서)
   - 열린 PR 이 있으면 `gh pr view` 로 설명 확인
2. 아래 체크리스트를 **각 항목별로** 평가, 통과/의심/위반 3단계로 분류:

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
   - [ ] 커밋/PR 본문에 Claude/AI 언급(Co-Authored-By 등) **없음**
   - [ ] main 에 직접 커밋하지 않음 (PR 경유)

   **문서**
   - [ ] 새 라우트/컴포넌트/훅/스토어/라이브러리 → AGENTS.md 반영

3. 결과를 Markdown 체크리스트로 출력. 위반/의심 항목은 **정확한 파일:라인** 을 포함.

## 참고

- 프로젝트 지침: `AGENTS.md`
