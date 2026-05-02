import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  CommunityListPage,
  CrewDetailPage,
  CrewSearchPage,
  DashboardHomePage,
  FollowersPage,
  GoalEditPage,
  GoalPage,
  NotificationsPage,
  PostComposePage,
  PostDetailPage,
  ProfilePage,
  RecordsPage,
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
  beforeEach(() => {
    localStorage.clear();
  });

  it('대시보드 홈의 핵심 CTA와 목표 카드를 렌더한다', () => {
    renderPage(<DashboardHomePage />);

    expect(screen.getByRole('heading', { level: 1, name: '러닝 인사이트 홈' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '피드 글쓰기' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { level: 2, name: '월간 목표' })).toBeInTheDocument();
  });

  it('목표 화면에서 현재 목표와 수정 진입점을 먼저 렌더한다', () => {
    renderPage(<GoalPage />);

    expect(screen.getByRole('heading', { level: 1, name: '목표' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '5월 러닝 목표' })).toBeInTheDocument();
    expect(screen.getByText('72%')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '목표 수정' })).toBeInTheDocument();
  });

  it('목표 설정 폼은 입력값에 맞춰 미리보기를 갱신하고 저장한다', async () => {
    const user = userEvent.setup();
    renderPage(<GoalEditPage />);

    await user.clear(screen.getByLabelText('목표 거리'));
    await user.type(screen.getByLabelText('목표 거리'), '100');

    expect(screen.getByText('58%')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '저장하기' }));
    expect(screen.getByText('목표가 mock 데이터에 저장됐어요.')).toBeInTheDocument();
  });

  it('기록 분석 기간 탭을 클릭하면 통계 범위가 바뀐다', async () => {
    const user = userEvent.setup();
    renderPage(<RecordsPage />);

    expect(screen.getByRole('tab', { name: '주간', selected: true })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: '이번 주 1km 스플릿' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: '월간' }));
    expect(screen.getByRole('tab', { name: '월간', selected: true })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: '이번 달 1km 스플릿' }),
    ).toBeInTheDocument();
    expect(screen.getByText('57.6 km')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: '연간' }));
    expect(screen.getByRole('tab', { name: '연간', selected: true })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: '올해 대표 1km 스플릿' }),
    ).toBeInTheDocument();
    expect(screen.getByText('247.8km')).toBeInTheDocument();
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

  it('게시글 상세에서 좋아요, 공유, 댓글을 바로 반영한다', async () => {
    const user = userEvent.setup();
    renderRoute(<PostDetailPage />, '/community/:postId', '/community/hangang-review');

    expect(screen.getByRole('heading', { level: 1, name: '게시글 상세' })).toBeInTheDocument();
    expect(screen.getByText('러닝 후기')).toBeInTheDocument();
    expect(screen.getAllByText('#한강러닝').length).toBeGreaterThan(0);
    expect(screen.getByText(/공유 2/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '좋아요 24' }));
    expect(screen.getByRole('button', { name: '좋아요 25' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('댓글 입력'), '저도 같이 달리고 싶어요');
    await user.click(screen.getByRole('button', { name: '등록' }));
    expect(screen.getByText('저도 같이 달리고 싶어요')).toBeInTheDocument();
  });

  it('게시글 작성 폼은 카테고리와 본문을 미리보기에 반영한다', async () => {
    const user = userEvent.setup();
    renderPage(<PostComposePage />);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '새 코스 공유');
    await user.click(screen.getByRole('tab', { name: '코스 공유' }));

    expect(screen.getByRole('link', { name: /새 코스 공유/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '코스 공유', selected: true })).toBeInTheDocument();
  });

  it('커뮤니티 목록에서 글 목록과 글쓰기 진입점을 먼저 렌더한다', () => {
    renderPage(<CommunityListPage />);

    expect(screen.getByRole('heading', { level: 1, name: '커뮤니티' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '전체 글' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '피드 글쓰기' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /한강 야간런 후기/ })).toBeInTheDocument();
  });

  it('크루 상세에서 모집글 탭과 모집글 만들기 CTA를 렌더한다', () => {
    renderRoute(<CrewDetailPage />, '/crews/:crewId', '/crews/hangang-crew');

    expect(screen.getByRole('heading', { level: 1, name: '크루 상세' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '모집글 만들기' })).toBeInTheDocument();
    expect(screen.getByText('멤버 124')).toBeInTheDocument();
    expect(screen.getAllByText('모집글').length).toBeGreaterThan(0);
  });

  it('크루 찾기에서 검색과 필터를 조합해 결과를 바꾼다', async () => {
    const user = userEvent.setup();
    renderPage(<CrewSearchPage />);

    expect(screen.getByLabelText('크루 검색')).toBeInTheDocument();
    expect(screen.getByText('2개 크루가 조건에 맞아요')).toBeInTheDocument();

    await user.type(screen.getByLabelText('크루 검색'), '성수');
    expect(screen.getByRole('link', { name: /성수 모닝런/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /한강 러닝크루/ })).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText('크루 검색'));
    await user.click(screen.getByRole('button', { name: "6'00" }));
    expect(screen.getByRole('link', { name: /성수 모닝런/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '주말 오전' }));
    expect(screen.getByText('조건에 맞는 크루가 없어요')).toBeInTheDocument();
  });

  it('프로필과 설정의 사용자 관리 항목을 렌더하고 상세 패널을 조작한다', async () => {
    const user = userEvent.setup();
    const profileView = renderPage(<ProfilePage />);

    expect(screen.getByRole('heading', { level: 1, name: '프로필 · 계정' })).toBeInTheDocument();
    expect(screen.getByText('팔로워 248 · 팔로잉 187')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '프로필 편집' })).toBeInTheDocument();

    profileView.unmount();
    renderPage(<SettingsPage />);

    expect(screen.getByRole('heading', { level: 1, name: '설정' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /데이터 다운로드/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /차단한 사용자/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /차단한 사용자/ }));
    expect(
      screen.getByRole('heading', { level: 3, name: '차단한 사용자 관리' }),
    ).toBeInTheDocument();
    await user.type(screen.getByLabelText('차단할 닉네임'), '불편한 러너');
    await user.click(screen.getByRole('button', { name: '차단 추가' }));
    expect(screen.getByText('불편한 러너')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /데이터 다운로드/ }));
    expect(
      screen.getByRole('heading', { level: 3, name: '데이터 다운로드 옵션' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다운로드 준비' }));
    expect(screen.getByText(/JSON 형식/)).toBeInTheDocument();
  });

  it('알림 필터, 팔로워 탭, 빈 상태 카탈로그를 렌더한다', async () => {
    const user = userEvent.setup();
    const notificationView = renderPage(<NotificationsPage />);

    for (const filter of ['전체', '소셜', '크루', '뱃지', '팔로우']) {
      expect(screen.getAllByText(filter).length).toBeGreaterThan(0);
    }

    await user.click(screen.getByRole('tab', { name: '크루' }));
    expect(screen.getByText('크루 일정이 변경됐어요')).toBeInTheDocument();

    notificationView.unmount();
    const followerView = renderPage(<FollowersPage />);
    expect(screen.getByRole('heading', { level: 1, name: '팔로워와 팔로잉' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '팔로워 248', selected: true })).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: '팔로잉 4' }));
    expect(screen.getByText('정원오빠')).toBeInTheDocument();

    followerView.unmount();
    renderPage(<StatesPage />);

    expect(screen.getByText('러닝 기록 0개')).toBeInTheDocument();
    expect(screen.getByText('모집글 0개')).toBeInTheDocument();
    expect(screen.getByText('팔로워/팔로잉 0명')).toBeInTheDocument();
  });
});
