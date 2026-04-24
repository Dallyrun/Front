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

const validPassword = 'Abcd1234!';
const validNickname = '러너runner';

async function fillValidFields(
  user: ReturnType<typeof userEvent.setup>,
  overrides: { password?: string; nickname?: string } = {},
) {
  await user.type(screen.getByLabelText(/이메일/), 'test@example.com');
  await user.type(screen.getByLabelText(/^비밀번호$/), overrides.password ?? validPassword);
  await user.type(screen.getByLabelText(/비밀번호 확인/), overrides.password ?? validPassword);
  await user.upload(
    screen.getByLabelText(/프로필 이미지 파일/),
    new File(['dummy'], 'avatar.png', { type: 'image/png' }),
  );
  await user.type(screen.getByLabelText(/^닉네임$/), overrides.nickname ?? validNickname);
  await user.selectOptions(screen.getByLabelText(/^나이$/), '30');
  await user.click(screen.getByRole('radio', { name: /남자/ }));
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
    expect(screen.getByLabelText(/프로필 이미지 파일/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^닉네임$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^나이$/)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /남자/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /여자/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /회원가입하기/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /로그인/ })).toBeInTheDocument();
  });

  it('프로필 이미지를 선택하지 않으면 제출 버튼이 비활성이다', async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await user.type(screen.getByLabelText(/이메일/), 'test@example.com');
    await user.type(screen.getByLabelText(/^비밀번호$/), validPassword);
    await user.type(screen.getByLabelText(/비밀번호 확인/), validPassword);
    await user.type(screen.getByLabelText(/^닉네임$/), validNickname);
    await user.selectOptions(screen.getByLabelText(/^나이$/), '30');
    await user.click(screen.getByRole('radio', { name: /남자/ }));

    expect(screen.getByRole('button', { name: /회원가입하기/ })).toBeDisabled();
  });

  it('닉네임 규칙을 위반하면 제출이 비활성이다', async () => {
    const user = userEvent.setup();
    renderSignupPage();

    const submitButton = screen.getByRole('button', { name: /회원가입하기/ });
    const nicknameInput = screen.getByLabelText(/^닉네임$/);

    await user.type(screen.getByLabelText(/이메일/), 'test@example.com');
    await user.type(screen.getByLabelText(/^비밀번호$/), validPassword);
    await user.type(screen.getByLabelText(/비밀번호 확인/), validPassword);
    await user.upload(
      screen.getByLabelText(/프로필 이미지 파일/),
      new File(['dummy'], 'avatar.png', { type: 'image/png' }),
    );
    await user.selectOptions(screen.getByLabelText(/^나이$/), '30');
    await user.click(screen.getByRole('radio', { name: /여자/ }));

    // 1자 (너무 짧음)
    await user.type(nicknameInput, 'a');
    expect(submitButton).toBeDisabled();

    // 특수문자 포함
    await user.clear(nicknameInput);
    await user.type(nicknameInput, '러너!');
    expect(submitButton).toBeDisabled();

    // 공백 포함
    await user.clear(nicknameInput);
    await user.type(nicknameInput, '러 너');
    expect(submitButton).toBeDisabled();
  });

  it('나이 미선택 시 제출이 비활성이다', async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await user.type(screen.getByLabelText(/이메일/), 'test@example.com');
    await user.type(screen.getByLabelText(/^비밀번호$/), validPassword);
    await user.type(screen.getByLabelText(/비밀번호 확인/), validPassword);
    await user.upload(
      screen.getByLabelText(/프로필 이미지 파일/),
      new File(['dummy'], 'avatar.png', { type: 'image/png' }),
    );
    await user.type(screen.getByLabelText(/^닉네임$/), validNickname);
    await user.click(screen.getByRole('radio', { name: /남자/ }));

    expect(screen.getByRole('button', { name: /회원가입하기/ })).toBeDisabled();
  });

  it('성별 미선택 시 제출이 비활성이다', async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await user.type(screen.getByLabelText(/이메일/), 'test@example.com');
    await user.type(screen.getByLabelText(/^비밀번호$/), validPassword);
    await user.type(screen.getByLabelText(/비밀번호 확인/), validPassword);
    await user.upload(
      screen.getByLabelText(/프로필 이미지 파일/),
      new File(['dummy'], 'avatar.png', { type: 'image/png' }),
    );
    await user.type(screen.getByLabelText(/^닉네임$/), validNickname);
    await user.selectOptions(screen.getByLabelText(/^나이$/), '40');

    expect(screen.getByRole('button', { name: /회원가입하기/ })).toBeDisabled();
  });

  it('비밀번호 확인이 일치하지 않으면 에러 메시지와 함께 제출이 막힌다', async () => {
    const user = userEvent.setup();
    renderSignupPage();

    await user.type(screen.getByLabelText(/이메일/), 'test@example.com');
    await user.type(screen.getByLabelText(/^비밀번호$/), validPassword);
    await user.type(screen.getByLabelText(/비밀번호 확인/), 'Different99!');

    expect(screen.getByText(/일치하지 않습니다/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /회원가입하기/ })).toBeDisabled();
  });

  it('모든 필드 유효 + 프로필 이미지 업로드 + 나이/성별 선택 시 signupWithEmail 이 호출된다', async () => {
    signupWithEmailMock.mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    const user = userEvent.setup();
    renderSignupPage();

    await fillValidFields(user);

    const submitButton = screen.getByRole('button', { name: /회원가입하기/ });
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    expect(signupWithEmailMock).toHaveBeenCalledTimes(1);
    const payload = signupWithEmailMock.mock.calls[0]?.[0];
    expect(payload).toMatchObject({
      email: 'test@example.com',
      password: validPassword,
      nickname: validNickname,
      ageBracket: 30,
      gender: 'MALE',
    });
    expect(payload?.profileImage).toBeInstanceOf(File);
    expect(payload?.profileImage?.name).toBe('avatar.png');

    await vi.waitFor(() => {
      expect(useAuthStore.getState().tokens?.accessToken).toBe('access');
    });
  });
});
