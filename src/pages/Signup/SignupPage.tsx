import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { signupWithEmail } from '@/api/auth';
import { ApiError } from '@/api/client';
import Logo from '@/components/Logo/Logo';
import { useAuthStore } from '@/stores/authStore';
import type { AuthResponse, SignupRequest } from '@/types/auth';

import styles from './SignupPage.module.css';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 100;

function SignupPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(profileImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImage]);

  const passwordTooShort = password.length > 0 && password.length < PASSWORD_MIN_LENGTH;
  const passwordTooLong = password.length > PASSWORD_MAX_LENGTH;
  const passwordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

  const passwordLengthValid =
    password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH;

  const isFormValid =
    email.trim() !== '' &&
    passwordLengthValid &&
    passwordConfirm !== '' &&
    !passwordMismatch &&
    nickname.trim() !== '';

  const mutation = useMutation<AuthResponse, Error, SignupRequest>({
    mutationFn: signupWithEmail,
    onSuccess: ({ accessToken, refreshToken, user }) => {
      setAuth({ accessToken, refreshToken }, user);
      navigate('/', { replace: true });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid) return;
    mutation.mutate({ email, password, nickname, profileImage });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setProfileImage(file);
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const errorMessage = mutation.error
    ? mutation.error instanceof ApiError
      ? `회원가입에 실패했습니다 (${mutation.error.status})`
      : mutation.error.message
    : null;

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <Logo size="sm" withTagline={false} />
        <h1 className={styles.title}>회원가입</h1>
        <p className={styles.subtitle}>이메일로 간편하게 시작해보세요.</p>
      </div>

      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        {/* 이메일 */}
        <div className={styles.field}>
          <label htmlFor="signup-email" className={styles.label}>
            이메일
          </label>
          <input
            id="signup-email"
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

        {/* 비밀번호 */}
        <div className={styles.field}>
          <label htmlFor="signup-password" className={styles.label}>
            비밀번호
          </label>
          <input
            id="signup-password"
            type="password"
            name="password"
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            maxLength={PASSWORD_MAX_LENGTH}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={styles.input}
            aria-invalid={passwordTooShort || passwordTooLong}
            aria-describedby="signup-password-hint"
          />
          <p
            id="signup-password-hint"
            className={passwordTooShort || passwordTooLong ? styles.hintError : styles.hint}
          >
            {passwordTooShort
              ? `비밀번호는 최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`
              : passwordTooLong
                ? `비밀번호는 최대 ${PASSWORD_MAX_LENGTH}자 이하여야 합니다.`
                : `${PASSWORD_MIN_LENGTH}자 이상 ${PASSWORD_MAX_LENGTH}자 이하`}
          </p>
        </div>

        {/* 비밀번호 확인 */}
        <div className={styles.field}>
          <label htmlFor="signup-password-confirm" className={styles.label}>
            비밀번호 확인
          </label>
          <input
            id="signup-password-confirm"
            type="password"
            name="passwordConfirm"
            autoComplete="new-password"
            required
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            className={styles.input}
            aria-invalid={passwordMismatch}
            aria-describedby="signup-password-confirm-hint"
          />
          {passwordConfirm.length > 0 && (
            <p
              id="signup-password-confirm-hint"
              className={passwordMismatch ? styles.hintError : styles.hintSuccess}
            >
              {passwordMismatch ? '비밀번호가 일치하지 않습니다.' : '비밀번호가 일치합니다.'}
            </p>
          )}
        </div>

        {/* 프로필 이미지 */}
        <div className={styles.field}>
          <span className={styles.label}>
            프로필 이미지 <span className={styles.optional}>(선택)</span>
          </span>
          <div className={styles.profileRow}>
            <button
              type="button"
              className={styles.avatarButton}
              onClick={() => fileInputRef.current?.click()}
              aria-label="프로필 이미지 선택"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="선택한 프로필 미리보기" className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarPlaceholder} aria-hidden="true">
                  +
                </span>
              )}
            </button>
            <div className={styles.profileActions}>
              <input
                ref={fileInputRef}
                id="signup-profile-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.hiddenFileInput}
                aria-label="프로필 이미지 파일"
              />
              <p className={styles.profileHint}>
                {profileImage ? profileImage.name : '이미지를 선택하면 미리보기가 표시됩니다.'}
              </p>
              {profileImage && (
                <button type="button" className={styles.linkButton} onClick={removeProfileImage}>
                  제거
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 닉네임 */}
        <div className={styles.field}>
          <label htmlFor="signup-nickname" className={styles.label}>
            닉네임
          </label>
          <input
            id="signup-nickname"
            type="text"
            name="nickname"
            autoComplete="nickname"
            placeholder="달리런 러너"
            required
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            className={styles.input}
          />
        </div>

        {errorMessage && (
          <p role="alert" className={styles.error}>
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          className={styles.submit}
          disabled={!isFormValid || mutation.isPending}
        >
          {mutation.isPending ? '가입 처리 중…' : '회원가입하기'}
        </button>
      </form>

      <p className={styles.footer}>
        이미 계정이 있나요? <Link to="/login">로그인</Link>
      </p>
    </main>
  );
}

export default SignupPage;
