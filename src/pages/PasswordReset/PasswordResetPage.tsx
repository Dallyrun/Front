import { Link } from 'react-router-dom';

import Logo from '@/components/Logo/Logo';

import styles from './PasswordResetPage.module.css';

const passwordRules = [
  '8자 이상 30자 이하',
  '영문 포함',
  '숫자 포함',
  '특수기호 포함',
  '허용 문자만 사용',
];

function PasswordResetPage() {
  return (
    <main className={styles.page}>
      <section className={styles.visual}>
        <Logo size="md" withTagline={false} as="div" />
        <h1>비밀번호를 잊어도 러닝 기록은 그대로.</h1>
        <p>가입한 이메일로 재설정 링크를 받고, 안전하게 새 비밀번호로 다시 시작하세요.</p>
        <div className={styles.insight}>
          <span>이번 주 거리</span>
          <strong>18.4 km</strong>
          <small>회복런 · 6'10&quot; pace</small>
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="reset-title">
        <h2 id="reset-title">비밀번호 재설정</h2>
        <p>가입한 이메일 주소를 입력하면 재설정 링크를 보내드려요.</p>
        <label>
          이메일
          <input type="email" defaultValue="runner@dallyrun.kr" />
        </label>
        <div className={styles.info}>
          <strong>안내</strong>
          <span>메일이 오지 않으면 스팸함을 확인하거나 1분 후 다시 요청해주세요.</span>
        </div>
        <button type="button">재설정 링크 보내기</button>
        <Link to="/login">로그인으로 돌아가기</Link>

        <div className={styles.newPassword}>
          <strong>발송 완료 + 새 비밀번호 입력</strong>
          <label>
            새 비밀번호
            <input type="password" defaultValue="mockpassword" />
          </label>
          <button type="button">비밀번호 변경</button>
          <ul>
            {passwordRules.map((rule) => (
              <li key={rule}>✓ {rule}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

export default PasswordResetPage;
