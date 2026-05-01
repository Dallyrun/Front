---
name: 'source-command-dev'
description: '개발 서버(Vite) 실행'
---

# source-command-dev

Use this skill when the user asks to run the migrated source command `dev`.

## Command Template

# /dev

로컬 개발 서버를 시작한다.

## 동작

1. Bash 로 다음 명령을 실행: `npm run dev`
2. 기본 포트는 `http://localhost:5173`
3. 서버 실행 후 사용자에게 접속 URL 을 알려준다.

## 주의

- 백엔드 연동이 필요하면 `.env.local` 에 `VITE_API_BASE_URL` 이 설정돼 있는지 먼저 확인.
- 이미 5173 이 사용 중이면 Vite 가 다른 포트를 자동으로 잡는다. 그 경우 실제 포트를 사용자에게 알려준다.
