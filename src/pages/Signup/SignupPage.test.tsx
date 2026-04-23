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

async function fillCommonFields(user: ReturnType<typeof userEvent.setup>, password: string) {
  await user.type(screen.getByLabelText(/이메일/), 'test@example.com');
  await user.type(screen.getByLabelText(/^비밀번호$/), password);
  await user.type(screen.getByLabelText(/비밀번호 확인/), password);
  await user.type(screen.getByLabelText(/닉네임/), '러너');
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

  it('비밀번호가 규칙 중 하나라도 위반하면 제출 버튼이 비활성 상태다', async () => {
    const user = userEvent.setup();
    renderSignupPage();

    const submitButton = screen.getByRole('button', { name: /회원가입하기/ });
    const passwordInput = screen.getByLabelText(/^비밀번호$/);
    const passwordConfirmInput = screen.getByLabelText(/비밀번호 확인/);

    // 길이 미달
    await fillCommonFields(user, 'Ab1!');
    expect(submitButton).toBeDisabled();

    // 영문 없음
    await user.clear(passwordInput);
    await user.clear(passwordConfirmInput);
    await user.type(passwordInput, '12345678!');
    await user.type(passwordConfirmInput, '12345678!');
    expect(submitButton).toBeDisabled();

    // 숫자 없음
    await user.clear(passwordInput);
    await user.clear(passwordConfirmInput);
    await user.type(passwordInput, 'abcdefgh!');
    await user.type(passwordConfirmInput, 'abcdefgh!');
    expect(submitButton).toBeDisabled();

    // 특수문자 없음
    await user.clear(passwordInput);
    await user.clear(passwordConfirmInput);
    await user.type(passwordInput, 'abcdefg1');
    await user.type(passwordConfirmInput, 'abcdefg1');
    expect(submitButton).toBeDisabled();
  });

  it('규칙 체크리스트가 실시간으로 충족 여부를 표시한다', async () => {
    const user = userEvent.setup();
    renderSignupPage();

    const passwordInput = screen.getByLabelText(/^비밀번호$/);

    // 길이만 만족
    await user.type(passwordInput, 'abcdefgh');
    const lengthRule = screen.getByLabelText(/8~30자 길이 충족/);
    expect(lengthRule).toBeInTheDocument();
    expect(screen.getByLabelText(/영문 포함 충족/)).toBeInTheDocument();
    expect(screen.getByLabelText(/숫자 포함 미충족/)).toBeInTheDocument();
    expect(screen.getByLabelText(/특수기호 포함 미충족/)).toBeInTheDocument();

    // 숫자/특수기호 추가해 모두 충족
    await user.clear(passwordInput);
    await user.type(passwordInput, 'Abcd1234!');
    expect(screen.getByLabelText(/8~30자 길이 충족/)).toBeInTheDocument();
    expect(screen.getByLabelText(/영문 포함 충족/)).toBeInTheDocument();
    expect(screen.getByLabelText(/숫자 포함 충족/)).toBeInTheDocument();
    expect(screen.getByLabelText(/특수기호 포함 충족/)).toBeInTheDocument();
  });

  it('비ASCII 문자(한글/공백/이모지)가 포함되면 제출 버튼이 비활성 상태다', async () => {
    const user = userEvent.setup();
    renderSignupPage();

    const submitButton = screen.getByRole('button', { name: /회원가입하기/ });
    const passwordInput = screen.getByLabelText(/^비밀번호$/);
    const passwordConfirmInput = screen.getByLabelText(/비밀번호 확인/);

    await user.type(screen.getByLabelText(/이메일/), 'test@example.com');
    await user.type(screen.getByLabelText(/닉네임/), '러너');

    // 한글이 섞인 경우 — 다른 규칙은 전부 충족하지만 허용 문자 위반
    await user.type(passwordInput, 'Password1!가');
    await user.type(passwordConfirmInput, 'Password1!가');
    expect(screen.getByLabelText(/허용 문자만 사용 미충족/)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // 공백이 섞인 경우
    await user.clear(passwordInput);
    await user.clear(passwordConfirmInput);
    await user.type(passwordInput, 'Pass 1234!');
    await user.type(passwordConfirmInput, 'Pass 1234!');
    expect(screen.getByLabelText(/허용 문자만 사용 미충족/)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('비밀번호 확인이 일치하지 않으면 에러 메시지와 함께 제출이 막힌다', async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await user.type(screen.getByLabelText(/이메일/), 'test@example.com');
    await user.type(screen.getByLabelText(/^비밀번호$/), 'Abcd1234!');
    await user.type(screen.getByLabelText(/비밀번호 확인/), 'Different99!');
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

    await fillCommonFields(user, 'Abcd1234!');

    const submitButton = screen.getByRole('button', { name: /회원가입하기/ });
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    expect(signupWithEmailMock).toHaveBeenCalledTimes(1);
    const payload = signupWithEmailMock.mock.calls[0]?.[0];
    expect(payload).toMatchObject({
      email: 'test@example.com',
      password: 'Abcd1234!',
      nickname: '러너',
      profileImage: null,
    });

    await vi.waitFor(() => {
      expect(useAuthStore.getState().token?.accessToken).toBe('access');
    });
  });
});
