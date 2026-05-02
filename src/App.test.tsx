import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import App from './App';

function renderRoute(route: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const routeCases = [
  ['/', /러닝의 모든 순간/],
  ['/login', /Dallyrun/],
  ['/signup', /회원가입/],
  ['/password-reset', /비밀번호를 잊어도/],
  ['/home', /^홈$/],
  ['/records', /기록 분석/],
  ['/records/hangang-night-8k', /러닝 기록 상세/],
  ['/goals', /목표/],
  ['/goals/edit', /목표 설정/],
  ['/badges', /뱃지 전체/],
  ['/badges/10k-club', /뱃지 상세/],
  ['/community', /커뮤니티/],
  ['/community/new', /게시글 작성/],
  ['/community/hangang-review', /게시글 상세/],
  ['/tags/한강러닝', /#한강러닝/],
  ['/crews', /크루 찾기/],
  ['/crews/hangang-crew', /크루 상세/],
  ['/crews/hangang-crew/recruits/new', /모집글 작성/],
  ['/crews/hangang-crew/recruits/friday-8k', /모집글 상세/],
  ['/profile', /프로필 · 계정/],
  ['/profile/edit', /프로필 편집/],
  ['/settings', /설정/],
  ['/followers', /팔로워와 팔로잉/],
  ['/notifications', /알림/],
  ['/states', /빈 상태와 로딩/],
  ['/error/forbidden', /오류 상태/],
  ['/error/server', /오류 상태/],
  ['/unknown', /오류 상태/],
] as const;

describe('App routes', () => {
  it.each(routeCases)('%s 경로를 렌더한다', (route, heading) => {
    renderRoute(route);

    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });
});
