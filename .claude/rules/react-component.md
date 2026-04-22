# React / TypeScript 컴포넌트 규칙

> 원본: `CLAUDE.md` 의 "Coding Conventions → React / TypeScript" 섹션.
> 본 문서는 별도로 찾아보기 편하도록 분리한 사본이다.

## 기본 원칙

- **함수형 컴포넌트 + 훅** 만 사용. 클래스 컴포넌트 금지.
- Props 는 `interface` 또는 `type` 으로 명시적으로 선언. `React.FC` 사용 지양.
- 하나의 파일은 **하나의 명확한 책임** 만 가진다 (단일 책임 원칙).

## 상태 관리 계층 분리

| 종류 | 도구 |
|---|---|
| 로컬 UI 상태 | `useState` / `useReducer` |
| 서버 상태 (백엔드 데이터) | `@tanstack/react-query` |
| 전역 클라이언트 상태 (인증 세션, 테마 등) | Zustand 스토어 (`src/stores/`) |

## 폴더 구성

컴포넌트/페이지는 **폴더 단위** 로 구성한다:

```
ComponentName/
├─ ComponentName.tsx
├─ ComponentName.module.css
└─ ComponentName.test.tsx
```

## Import

- 절대 경로 import 는 `@/...` 을 사용
- 상대 경로는 **같은 폴더 내에서만** 사용

## 금지 사항

- `any` 사용 지양. 불가피할 때만 한정 범위 + 주석과 함께.
- `!` non-null assertion 금지 (대신 타입 가드 / early return 사용).
- `console.log` 커밋 금지. 디버그용은 PR 올리기 전에 제거.

## 네이밍

- 컴포넌트/페이지/타입: `PascalCase`
- 함수/변수/훅 파일: `camelCase` (훅은 `useXxx`)
- 상수: `SCREAMING_SNAKE_CASE`
- CSS Module 클래스: `camelCase` (e.g. `styles.titleText`)
- Boolean: `is`, `has`, `can`, `should` prefix 선호
