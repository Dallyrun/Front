import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { loginWithEmail } from '@/api/auth';
import { ApiError } from '@/api/client';
import Logo from '@/components/Logo/Logo';
import { useAuthStore } from '@/stores/authStore';
import type { AuthTokens, LoginRequest } from '@/types/auth';
import { toUserMessage } from '@/utils/errorMessage';

import styles from './LoginPage.module.css';

function LoginPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation<AuthTokens, Error, LoginRequest>({
    mutationFn: loginWithEmail,
    onSuccess: (tokens) => {
      setTokens(tokens);
      navigate('/home', { replace: true });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate({ email, password });
  };

  const errorMessage = mutation.error
    ? mutation.error instanceof ApiError && mutation.error.status === 401
      ? '이메일 또는 비밀번호가 올바르지 않습니다.'
      : toUserMessage(mutation.error, '로그인에 실패했습니다.')
    : null;

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <Logo size="md" />
      </div>

      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="login-email" className={styles.label}>
            이메일
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="login-password" className={styles.label}>
            비밀번호
          </label>
          <input
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={styles.input}
          />
        </div>

        {errorMessage && (
          <p role="alert" className={styles.error}>
            {errorMessage}
          </p>
        )}

        <button type="submit" className={styles.submit} disabled={mutation.isPending}>
          {mutation.isPending ? '로그인 중…' : '로그인하기'}
        </button>
        <Link to="/password-reset" className={styles.resetLink}>
          비밀번호를 잊으셨나요?
        </Link>
      </form>

      <p className={styles.footer}>
        아직 계정이 없나요? <Link to="/signup">회원가입</Link>
      </p>
    </main>
  );
}

export default LoginPage;
