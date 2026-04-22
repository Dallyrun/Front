import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from '@/stores/authStore';

import SignupPage from './SignupPage';

const { signupWithEmailMock } = vi.hoisted(() => ({
  signupWithEmailMock: vi.fn(),
}));

vi.mock('@/api/auth', () => ({
  signupWithEmail: signupWithEmailMock,
}));

function renderSignupPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('SignupPage', () => {
  beforeEach(() => {
    signupWithEmailMock.mockReset();
    useAuthStore.getState().clear();
  });

  it('모든 필드와 제출 버튼, 로그인 링크를 렌더한다', () => {
    renderSignupPage();

    expect(screen.getByRole('heading', { level: 1, name: /회원가입/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/이메일/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^비밀번호$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호 확인/)).toBeInTheDocument();
    expect(screen.getByLabelText(/닉네임/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /회원가입하기/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /로그인/ })).toBeInTheDocument();
  });

  it('비밀번호가 8자 미만이면 제출 버튼이 비활성 상태다', async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await user.type(screen.getByLabelText(/이메일/), 'test@example.com');
    await user.type(screen.getByLabelText(/^비밀번호$/), 'short');
    await user.type(screen.getByLabelText(/비밀번호 확인/), 'short');
    await user.type(screen.getByLabelText(/닉네임/), '러너');

    expect(screen.getByRole('button', { name: /회원가입하기/ })).toBeDisabled();
    expect(screen.getByText(/최소 8자 이상/)).toBeInTheDocument();
  });

  it('비밀번호 확인이 일치하지 않으면 에러 메시지와 함께 제출이 막힌다', async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await user.type(screen.getByLabelText(/이메일/), 'test@example.com');
    await user.type(screen.getByLabelText(/^비밀번호$/), 'secret12345');
    await user.type(screen.getByLabelText(/비밀번호 확인/), 'different99');
    await user.type(screen.getByLabelText(/닉네임/), '러너');

    expect(screen.getByText(/일치하지 않습니다/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /회원가입하기/ })).toBeDisabled();
  });

  it('유효한 값으로 제출 시 signupWithEmail 이 FormData 가 될 필드들로 호출된다', async () => {
    signupWithEmailMock.mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      user: { id: 'u1', email: 'test@example.com', nickname: '러너' },
    });
    const user = userEvent.setup();
    renderSignupPage();

    await user.type(screen.getByLabelText(/이메일/), 'test@example.com');
    await user.type(screen.getByLabelText(/^비밀번호$/), 'secret12345');
    await user.type(screen.getByLabelText(/비밀번호 확인/), 'secret12345');
    await user.type(screen.getByLabelText(/닉네임/), '러너');

    const submitButton = screen.getByRole('button', { name: /회원가입하기/ });
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    expect(signupWithEmailMock).toHaveBeenCalledTimes(1);
    const payload = signupWithEmailMock.mock.calls[0]?.[0];
    expect(payload).toMatchObject({
      email: 'test@example.com',
      password: 'secret12345',
      nickname: '러너',
      profileImage: null,
    });

    await vi.waitFor(() => {
      expect(useAuthStore.getState().token?.accessToken).toBe('access');
    });
  });
});
