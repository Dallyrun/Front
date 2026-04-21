import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { loginWithEmail } from '@/api/auth';
import { ApiError } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import type { AuthResponse, LoginRequest } from '@/types/auth';

import styles from './LoginPage.module.css';

function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: loginWithEmail,
    onSuccess: ({ accessToken, refreshToken, user }) => {
      setAuth({ accessToken, refreshToken }, user);
      navigate('/', { replace: true });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate({ email, password });
  };

  const errorMessage = mutation.error
    ? mutation.error instanceof ApiError
      ? `로그인 실패 (${mutation.error.status})`
      : mutation.error.message
    : null;

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>로그인</h1>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <label className={styles.field}>
          <span className={styles.label}>이메일</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>비밀번호</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={styles.input}
          />
        </label>

        {errorMessage && (
          <p role="alert" className={styles.error}>
            {errorMessage}
          </p>
        )}

        <button type="submit" className={styles.submit} disabled={mutation.isPending}>
          {mutation.isPending ? '로그인 중…' : '로그인'}
        </button>
      </form>

      {/* TODO: 회원가입 페이지는 별도 PR에서 구현 */}
      <p className={styles.signupHint}>
        아직 계정이 없나요? <Link to="/signup">회원가입</Link>
      </p>
    </main>
  );
}

export default LoginPage;
