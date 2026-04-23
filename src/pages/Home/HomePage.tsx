import { Link } from 'react-router-dom';

import Logo from '@/components/Logo/Logo';

import styles from './HomePage.module.css';

function HomePage() {
  return (
    <main className={styles.home}>
      <Logo size="lg" />

      <div className={styles.actions}>
        <Link to="/login" className={styles.primary}>
          로그인
        </Link>
        <Link to="/signup" className={styles.secondary}>
          회원가입
        </Link>
      </div>
    </main>
  );
}

export default HomePage;
