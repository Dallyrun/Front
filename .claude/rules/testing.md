# 테스트 규칙 (Vitest + React Testing Library)

> 원본: `CLAUDE.md` 의 "Coding Conventions → Testing" 섹션.

## 위치

- 테스트 파일은 **대상 파일과 동일 폴더** 에 `*.test.ts(x)` 로 배치.
- 예: `src/pages/Login/LoginPage.tsx` → `src/pages/Login/LoginPage.test.tsx`

## 작성 원칙

- 모든 새 기능 PR 은 **최소 스모크 렌더 테스트 1건** 을 포함해야 리뷰 대상이 된다.
- 외부 의존성은 훅 또는 props 로 주입 가능한 형태로 설계해 Testable 한 코드를 유지한다.

## 쿼리 우선순위

1. **역할(role) 기반** — `getByRole`, `getByLabelText`
2. 텍스트 기반 — `getByText`
3. 테스트 ID — 최후수단 (`data-testid`)

## 네트워크 / 외부 호출

- MSW 도입 전까지는 `vi.mock` 으로 `@/api/*` 모듈을 직접 대체한다.
- mutation 함수의 호출 인자를 검증할 때는 `mock.calls[0]?.[0]` 로 첫 인자만 비교 (react-query 가 추가 context 를 넘기기 때문).

## Provider 래핑

React Router / react-query 를 사용하는 컴포넌트의 테스트는 다음 래퍼로 감싼다:

```tsx
function renderWithProviders(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}
```

## 실행

```bash
npm run test           # 전체 1회
npm run test:watch     # watch
npx vitest run path/to/File.test.tsx   # 단일 파일
```
