import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from '@/stores/authStore';

import LoginPage from './LoginPage';

const { loginWithEmailMock } = vi.hoisted(() => ({
  loginWithEmailMock: vi.fn(),
}));

vi.mock('@/api/auth', () => ({
  loginWithEmail: loginWithEmailMock,
}));

function renderLoginPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    loginWithEmailMock.mockReset();
    useAuthStore.getState().clear();
  });

  it('로고와 이메일/비밀번호 입력, 제출 버튼, 회원가입 링크를 렌더한다', () => {
    renderLoginPage();

    expect(screen.getByRole('heading', { level: 1, name: /Dallyrun/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/이메일/)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인하기/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /회원가입/ })).toBeInTheDocument();
  });

  it('폼 제출 시 loginWithEmail 이 올바른 인자로 호출되고 스토어에 토큰이 저장된다', async () => {
    loginWithEmailMock.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 'user-1', email: 'test@example.com', nickname: '테스터' },
    });

    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/이메일/), 'test@example.com');
    await user.type(screen.getByLabelText(/비밀번호/), 'secret123');
    await user.click(screen.getByRole('button', { name: /로그인하기/ }));

    expect(loginWithEmailMock).toHaveBeenCalledTimes(1);
    expect(loginWithEmailMock.mock.calls[0]?.[0]).toEqual({
      email: 'test@example.com',
      password: 'secret123',
    });

    await vi.waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.token?.accessToken).toBe('access-token');
      expect(state.user?.email).toBe('test@example.com');
    });
  });
});
