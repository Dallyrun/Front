import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { signupWithEmail } from '@/api/auth';
import Logo from '@/components/Logo/Logo';
import { useAuthStore } from '@/stores/authStore';
import type { AgeBracket, AuthTokens, Gender, SignupRequest } from '@/types/auth';
import { toUserMessage } from '@/utils/errorMessage';
import { NICKNAME_MAX_LENGTH, NICKNAME_MIN_LENGTH, isNicknameValid } from '@/utils/nickname';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  evaluatePassword,
  isPasswordValid,
} from '@/utils/password';

import styles from './SignupPage.module.css';

interface PasswordRule {
  key: keyof ReturnType<typeof evaluatePassword>;
  label: string;
}

const PASSWORD_RULES: PasswordRule[] = [
  { key: 'lengthOk', label: `${PASSWORD_MIN_LENGTH}~${PASSWORD_MAX_LENGTH}자 길이` },
  { key: 'hasLetter', label: '영문 포함' },
  { key: 'hasDigit', label: '숫자 포함' },
  { key: 'hasSpecial', label: '특수기호 포함' },
  { key: 'onlyAllowedChars', label: '허용 문자만 사용' },
];

const AGE_BRACKET_OPTIONS: { value: AgeBracket; label: string }[] = [
  { value: 20, label: '20대' },
  { value: 30, label: '30대' },
  { value: 40, label: '40대' },
  { value: 50, label: '50대' },
  { value: 60, label: '60대 이상' },
];

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'MALE', label: '남자' },
  { value: 'FEMALE', label: '여자' },
];

function SignupPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ageBracket, setAgeBracket] = useState<AgeBracket | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);

  useEffect(() => {
    if (!profileImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(profileImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [profileImage]);

  const passwordStatus = evaluatePassword(password);
  const passwordValid = isPasswordValid(password);
  const passwordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

  const nicknameValid = isNicknameValid(nickname);
  const nicknameInteracted = nickname.length > 0;
  const nicknameError = nicknameInteracted && !nicknameValid;

  const isFormValid =
    email.trim() !== '' &&
    passwordValid &&
    passwordConfirm !== '' &&
    !passwordMismatch &&
    profileImage !== null &&
    nicknameValid &&
    ageBracket !== null &&
    gender !== null;

  const mutation = useMutation<AuthTokens, Error, SignupRequest>({
    mutationFn: signupWithEmail,
    onSuccess: (tokens) => {
      setTokens(tokens);
      navigate('/home', { replace: true });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid || profileImage === null || ageBracket === null || gender === null) return;
    mutation.mutate({
      email,
      password,
      nickname,
      profileImage,
      ageBracket,
      gender,
    });
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
    ? toUserMessage(mutation.error, '회원가입에 실패했습니다.')
    : null;

  const passwordInteracted = password.length > 0;

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <Logo size="sm" withTagline={false} as="div" />
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
            aria-invalid={passwordInteracted && !passwordValid}
            aria-describedby="signup-password-rules"
          />
          <ul id="signup-password-rules" className={styles.ruleList}>
            {PASSWORD_RULES.map((rule) => {
              const met = passwordStatus[rule.key];
              return (
                <li
                  key={rule.key}
                  className={met ? styles.ruleMet : styles.ruleUnmet}
                  aria-label={`${rule.label} ${met ? '충족' : '미충족'}`}
                >
                  <span className={styles.ruleMark} aria-hidden="true">
                    {met ? '✓' : '·'}
                  </span>
                  {rule.label}
                </li>
              );
            })}
          </ul>
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

        {/* 프로필 이미지 (필수) */}
        <div className={styles.field}>
          <span className={styles.label}>프로필 이미지</span>
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
                {profileImage ? profileImage.name : '이미지를 선택해주세요.'}
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
            placeholder="달리런러너"
            minLength={NICKNAME_MIN_LENGTH}
            maxLength={NICKNAME_MAX_LENGTH}
            required
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            className={styles.input}
            aria-invalid={nicknameError}
            aria-describedby="signup-nickname-hint"
          />
          <p id="signup-nickname-hint" className={nicknameError ? styles.hintError : styles.hint}>
            {`${NICKNAME_MIN_LENGTH}~${NICKNAME_MAX_LENGTH}자, 한글/영문/숫자`}
          </p>
        </div>

        {/* 나이 */}
        <div className={styles.field}>
          <label htmlFor="signup-age-bracket" className={styles.label}>
            나이
          </label>
          <select
            id="signup-age-bracket"
            name="ageBracket"
            required
            value={ageBracket === null ? '' : String(ageBracket)}
            onChange={(event) => {
              const raw = event.target.value;
              setAgeBracket(raw === '' ? null : (Number(raw) as AgeBracket));
            }}
            className={styles.select}
          >
            <option value="" disabled>
              선택하세요
            </option>
            {AGE_BRACKET_OPTIONS.map((option) => (
              <option key={option.value} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 성별 */}
        <div className={styles.field}>
          <span className={styles.label} id="signup-gender-label">
            성별
          </span>
          <div
            className={styles.genderGroup}
            role="radiogroup"
            aria-labelledby="signup-gender-label"
          >
            {GENDER_OPTIONS.map((option) => {
              const inputId = `signup-gender-${option.value}`;
              const selected = gender === option.value;
              return (
                <label
                  key={option.value}
                  htmlFor={inputId}
                  className={`${styles.genderOption} ${selected ? styles.genderOptionSelected : ''}`}
                >
                  <input
                    id={inputId}
                    type="radio"
                    name="gender"
                    value={option.value}
                    checked={selected}
                    onChange={() => setGender(option.value)}
                    className={styles.visuallyHidden}
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
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
