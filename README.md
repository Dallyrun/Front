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

`.env.local` 에 아래 변수를 정의한다 (`.env.example` 참고).

```
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK_API=false
```

### Mock API 모드

백엔드 없이 회원가입 → 로그인 → 마이페이지 → 로그아웃 → 회원탈퇴 전체 시퀀스를 검증하고 싶다면 `VITE_USE_MOCK_API=true` 로 설정하고 `npm run dev` 실행.

모든 API 호출이 [`src/api/mockApi.ts`](./src/api/mockApi.ts) 의 인메모리 핸들러로 라우팅된다. 시드 계정:

- email: `test@dallyrun.com`
- password: `Test1234!@`

상태는 모듈 인메모리 — 페이지 전환 시엔 유지되고, 풀 새로고침(F5) 시엔 시드만 남는다.

## 기타

작업 컨벤션 및 아키텍처 설명은 [`AGENTS.md`](./AGENTS.md) 참고.
