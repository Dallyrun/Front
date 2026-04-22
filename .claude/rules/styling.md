# 스타일 규칙 (Plain CSS + CSS Modules)

> 원본: `CLAUDE.md` 의 "Coding Conventions → Styling" 섹션.

## 기본 원칙

- Plain CSS + CSS Modules (`*.module.css`) 조합만 사용. CSS-in-JS 미도입.
- 글로벌 스타일은 **`src/index.css` 에만** 둔다.
- 컴포넌트 전용 스타일은 `ComponentName.module.css` 에 두고 `import styles from './ComponentName.module.css'` 로 사용.

## CSS Custom Property

- 하드코딩된 색상/사이즈를 **여러 곳에서 재사용** 해야 할 경우, `:root` 의 CSS custom property 로 승격한다.
- 예: 브랜드 컬러, 공통 radius, spacing scale 등.

## 인라인 스타일

- 원칙적으로 금지.
- **동적 계산이 필요한 경우에만** 사용 (예: 런타임에 결정되는 좌표/크기).

## 네이밍

- CSS Module 클래스명은 `camelCase` 사용 — `styles.titleText`, `styles.submitButton`.
- 상태별 변형은 같은 파일 내에서 `submit` / `submitDisabled` 식으로 관리.

## 다크 모드

- `@media (prefers-color-scheme: ...)` 기반.
- 현재는 `src/index.css` 에서 기본 팔레트를 시스템 스킴에 따라 스위치.
