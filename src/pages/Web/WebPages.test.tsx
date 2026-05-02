import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import {
  CrewDetailPage,
  DashboardHomePage,
  FollowersPage,
  NotificationsPage,
  PostDetailPage,
  ProfilePage,
  RunningDetailPage,
  SettingsPage,
  StatesPage,
} from './WebPages';

function renderPage(element: ReactElement, route = '/') {
  return render(<MemoryRouter initialEntries={[route]}>{element}</MemoryRouter>);
}

function renderRoute(element: ReactElement, path: string, route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Web design pages', () => {
  it('대시보드 홈의 핵심 CTA와 목표 카드를 렌더한다', () => {
    renderPage(<DashboardHomePage />);

    expect(screen.getByRole('heading', { level: 1, name: '러닝 인사이트 홈' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '피드 글쓰기' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { level: 2, name: '월간 목표' })).toBeInTheDocument();
  });

  it('러닝 상세에서 4개 핵심 지표와 메모/사진을 렌더한다', () => {
    renderRoute(<RunningDetailPage />, '/records/:runId', '/records/hangang-night-8k');

    expect(screen.getByRole('heading', { level: 1, name: '러닝 기록 상세' })).toBeInTheDocument();
    expect(screen.getByText('거리')).toBeInTheDocument();
    expect(screen.getByText('시간')).toBeInTheDocument();
    expect(screen.getByText('평균 페이스')).toBeInTheDocument();
    expect(screen.getByText('칼로리')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '메모와 사진' })).toBeInTheDocument();
  });

  it('게시글 상세에서 카테고리, 해시태그, 공유 카운터를 렌더한다', () => {
    renderRoute(<PostDetailPage />, '/community/:postId', '/community/hangang-review');

    expect(screen.getByRole('heading', { level: 1, name: '게시글 상세' })).toBeInTheDocument();
    expect(screen.getByText('러닝 후기')).toBeInTheDocument();
    expect(screen.getAllByText('#한강러닝').length).toBeGreaterThan(0);
    expect(screen.getByText(/공유 2/)).toBeInTheDocument();
  });

  it('크루 상세에서 모집글 탭과 모집글 만들기 CTA를 렌더한다', () => {
    renderRoute(<CrewDetailPage />, '/crews/:crewId', '/crews/hangang-crew');

    expect(screen.getByRole('heading', { level: 1, name: '크루 상세' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '모집글 만들기' })).toBeInTheDocument();
    expect(screen.getByText('멤버 124')).toBeInTheDocument();
    expect(screen.getAllByText('모집글').length).toBeGreaterThan(0);
  });

  it('프로필과 설정의 사용자 관리 항목을 렌더한다', () => {
    renderPage(<ProfilePage />);

    expect(screen.getByRole('heading', { level: 1, name: '프로필 · 계정' })).toBeInTheDocument();
    expect(screen.getByText('팔로워 248 · 팔로잉 187')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '프로필 편집' })).toBeInTheDocument();

    renderPage(<SettingsPage />);

    expect(screen.getByRole('heading', { level: 1, name: '설정' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /데이터 다운로드/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /차단한 사용자/ })).toBeInTheDocument();
  });

  it('알림 필터, 팔로워 탭, 빈 상태 카탈로그를 렌더한다', () => {
    renderPage(<NotificationsPage />);

    for (const filter of ['전체', '소셜', '크루', '뱃지', '팔로우']) {
      expect(screen.getAllByText(filter).length).toBeGreaterThan(0);
    }

    renderPage(<FollowersPage />);

    expect(screen.getByRole('heading', { level: 1, name: '팔로워와 팔로잉' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '팔로워 248명' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '팔로잉 187명' })).toBeInTheDocument();

    renderPage(<StatesPage />);

    expect(screen.getByText('러닝 기록 0개')).toBeInTheDocument();
    expect(screen.getByText('모집글 0개')).toBeInTheDocument();
    expect(screen.getByText('팔로워/팔로잉 0명')).toBeInTheDocument();
  });
});
