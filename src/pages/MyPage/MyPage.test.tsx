import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';

import MyPage from './MyPage';

const { logoutMock, deleteAccountMock } = vi.hoisted(() => ({
  logoutMock: vi.fn(),
  deleteAccountMock: vi.fn(),
}));

vi.mock('@/api/auth', () => ({
  logout: logoutMock,
  deleteAccount: deleteAccountMock,
}));

function renderMyPage(initialEntry = '/mypage') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/login" element={<div>로그인 화면</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function setLoggedIn() {
  useAuthStore.getState().setTokens({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  });
}

describe('MyPage', () => {
  beforeEach(() => {
    logoutMock.mockReset();
    deleteAccountMock.mockReset();
    useAuthStore.getState().clear();
  });

  it('인증된 상태에서 마이페이지 헤딩과 두 버튼을 렌더한다', () => {
    setLoggedIn();
    renderMyPage();

    expect(screen.getByRole('heading', { level: 1, name: /마이페이지/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^로그아웃/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^회원탈퇴$/ })).toBeInTheDocument();
  });

  it('비인증(tokens null) 상태로 진입하면 /login 으로 리다이렉트', async () => {
    // tokens 미설정 상태
    renderMyPage();
    await vi.waitFor(() => {
      expect(screen.getByText(/로그인 화면/)).toBeInTheDocument();
    });
  });

  it('로그아웃 클릭 시 logout 호출 + store 클리어 + /login 이동', async () => {
    logoutMock.mockResolvedValue(undefined);
    setLoggedIn();
    const user = userEvent.setup();
    renderMyPage();

    await user.click(screen.getByRole('button', { name: /^로그아웃/ }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(logoutMock.mock.calls[0]?.[0]).toBe('access-token');
    await vi.waitFor(() => {
      expect(useAuthStore.getState().tokens).toBeNull();
      expect(screen.getByText(/로그인 화면/)).toBeInTheDocument();
    });
  });

  it('회원탈퇴 클릭 시 모달이 열리고, 취소 누르면 닫힌다', async () => {
    setLoggedIn();
    const user = userEvent.setup();
    renderMyPage();

    await user.click(screen.getByRole('button', { name: /^회원탈퇴$/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/^비밀번호$/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^취소$/ }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('탈퇴 성공 시 deleteAccount 호출 + store 클리어 + /login 이동', async () => {
    deleteAccountMock.mockResolvedValue(undefined);
    setLoggedIn();
    const user = userEvent.setup();
    renderMyPage();

    await user.click(screen.getByRole('button', { name: /^회원탈퇴$/ }));
    await user.type(screen.getByLabelText(/^비밀번호$/), 'mySecret123!');
    await user.click(screen.getByRole('button', { name: /^탈퇴하기$/ }));

    expect(deleteAccountMock).toHaveBeenCalledTimes(1);
    expect(deleteAccountMock.mock.calls[0]?.[0]).toBe('access-token');
    expect(deleteAccountMock.mock.calls[0]?.[1]).toBe('mySecret123!');
    await vi.waitFor(() => {
      expect(useAuthStore.getState().tokens).toBeNull();
      expect(screen.getByText(/로그인 화면/)).toBeInTheDocument();
    });
  });

  it('탈퇴 401 응답 시 인라인 에러 표시 + 모달 유지', async () => {
    deleteAccountMock.mockRejectedValue(new ApiError(401, 'INVALID_CREDENTIALS'));
    setLoggedIn();
    const user = userEvent.setup();
    renderMyPage();

    await user.click(screen.getByRole('button', { name: /^회원탈퇴$/ }));
    await user.type(screen.getByLabelText(/^비밀번호$/), 'wrong');
    await user.click(screen.getByRole('button', { name: /^탈퇴하기$/ }));

    await vi.waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/비밀번호가 올바르지 않습니다/);
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(useAuthStore.getState().tokens).not.toBeNull();
  });
});
