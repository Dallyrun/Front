import { useMutation } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { deleteAccount, logout } from '@/api/auth';
import { ApiError } from '@/api/client';
import Logo from '@/components/Logo/Logo';
import { useAuthStore } from '@/stores/authStore';
import { toUserMessage } from '@/utils/errorMessage';

import styles from './MyPage.module.css';

interface DeleteAccountVars {
  accessToken: string;
  password: string;
}

function MyPage() {
  const navigate = useNavigate();
  const tokens = useAuthStore((state) => state.tokens);
  const clearAuth = useAuthStore((state) => state.clear);

  // 인증 가드 — ProtectedRoute 가 아직 없어 인라인 처리
  useEffect(() => {
    if (tokens === null) {
      navigate('/login', { replace: true });
    }
  }, [tokens, navigate]);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [password, setPassword] = useState('');

  const goToLogin = () => navigate('/login', { replace: true });

  const logoutMutation = useMutation<void, Error, string>({
    mutationFn: logout,
    onSettled: () => {
      // logout() 자체가 ApiError 를 swallow 하지만, 어떤 결과든 로컬 정리는 보장.
      clearAuth();
      goToLogin();
    },
  });

  const deleteMutation = useMutation<void, Error, DeleteAccountVars>({
    mutationFn: ({ accessToken, password: pw }) => deleteAccount(accessToken, pw),
    onSuccess: () => {
      clearAuth();
      goToLogin();
    },
  });

  const handleLogout = () => {
    if (!tokens) return;
    logoutMutation.mutate(tokens.accessToken);
  };

  const handleOpenWithdraw = () => {
    setPassword('');
    deleteMutation.reset();
    setShowWithdrawModal(true);
  };

  const handleCloseWithdraw = () => {
    setShowWithdrawModal(false);
  };

  const handleSubmitWithdraw = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tokens || password.trim() === '' || deleteMutation.isPending) return;
    deleteMutation.mutate({ accessToken: tokens.accessToken, password });
  };

  const withdrawErrorMessage = deleteMutation.error
    ? deleteMutation.error instanceof ApiError && deleteMutation.error.status === 401
      ? '비밀번호가 올바르지 않습니다.'
      : toUserMessage(deleteMutation.error, '회원탈퇴에 실패했습니다.')
    : null;

  // 가드가 발동하기 전 한 프레임 빈 화면을 짧게 보여줌. 토큰 없는 상태에서 본문 렌더 방지.
  if (!tokens) return null;

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <Logo size="sm" withTagline={false} />
        <h1 className={styles.title}>마이페이지</h1>
      </div>

      <section className={styles.card}>
        <p className={styles.intro}>계정 관리</p>
        <button
          type="button"
          className={styles.secondary}
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? '로그아웃 중…' : '로그아웃'}
        </button>
        <button
          type="button"
          className={styles.danger}
          onClick={handleOpenWithdraw}
          disabled={deleteMutation.isPending}
        >
          회원탈퇴
        </button>
      </section>

      {showWithdrawModal && (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onClick={(event) => {
            // 오버레이 자체 클릭 시에만 닫기 (모달 내부 클릭은 통과)
            if (event.target === event.currentTarget) handleCloseWithdraw();
          }}
        >
          <div
            className={styles.modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdraw-title"
          >
            <h2 id="withdraw-title" className={styles.modalTitle}>
              정말 탈퇴하시겠어요?
            </h2>
            <p className={styles.modalDescription}>
              탈퇴 후 같은 이메일·닉네임으로 재가입할 수 없습니다. 계속하려면 비밀번호를 다시 입력해
              주세요.
            </p>

            <form onSubmit={handleSubmitWithdraw} noValidate>
              <label htmlFor="withdraw-password" className={styles.label}>
                비밀번호
              </label>
              <input
                id="withdraw-password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                autoFocus
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={styles.input}
                disabled={deleteMutation.isPending}
              />

              {withdrawErrorMessage && (
                <p role="alert" className={styles.error}>
                  {withdrawErrorMessage}
                </p>
              )}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalCancel}
                  onClick={handleCloseWithdraw}
                  disabled={deleteMutation.isPending}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className={styles.modalConfirm}
                  disabled={password.trim() === '' || deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? '처리 중…' : '탈퇴하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default MyPage;
