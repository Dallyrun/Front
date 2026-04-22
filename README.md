# Dallyrun Front

달리런 서비스의 웹 프론트엔드. Vite + React + TypeScript 기반.

## Requirements

- Node.js 20+
- npm 10+

## Getting Started

```bash
npm install
npm run dev
```

기본 포트: `http://localhost:5173`

## Scripts

| Command              | 설명                     |
| -------------------- | ------------------------ |
| `npm run dev`        | 개발 서버                |
| `npm run build`      | 타입체크 + 프로덕션 빌드 |
| `npm run preview`    | 빌드 결과 로컬 프리뷰    |
| `npm run lint`       | ESLint                   |
| `npm run format`     | Prettier 자동 포맷       |
| `npm run typecheck`  | `tsc --noEmit`           |
| `npm run test`       | Vitest 1회 실행          |
| `npm run test:watch` | Vitest watch 모드        |

## Environment

`.env.local` 에 아래 변수를 정의한다.

```
VITE_API_BASE_URL=http://localhost:8080
```

## 기타

작업 컨벤션 및 아키텍처 설명은 [`CLAUDE.md`](./CLAUDE.md) 참고.
