import { Link } from 'react-router-dom';

import Logo from '@/components/Logo/Logo';
import { getPost, getRunRecord, goal } from '@/mock/dallyrun';

import styles from './HomePage.module.css';

function HomePage() {
  const latestRun = getRunRecord('hangang-night-8k');
  const latestPost = getPost('hangang-review');
  return (
    <main className={styles.home}>
      <header className={styles.header}>
        <Logo size="md" withTagline={false} as="div" />
        <nav className={styles.nav}>
          <Link to="/login">로그인</Link>
          <Link to="/signup">시작하기</Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>DALLYRUN WEB</span>
          <h1>러닝의 모든 순간을 더 넓은 화면에서.</h1>
          <p>
            GPS 트래킹은 앱에서, 기록 분석과 커뮤니티 활동은 웹에서. 달리런은 러너의 여정을 하나의
            경험으로 연결합니다.
          </p>
          <div className={styles.actions}>
            <Link to="/signup" className={styles.primary}>
              무료로 시작하기
            </Link>
            <Link to="/home" className={styles.secondary}>
              기능 둘러보기
            </Link>
          </div>
        </div>

        <div className={styles.preview} aria-label="달리런 웹 미리보기">
          <span>러닝 리듬</span>
          <h2>오늘의 러닝 홈</h2>
          <div className={styles.metricGrid}>
            <strong>{latestRun.distance}</strong>
            <strong>{latestRun.pace}</strong>
            <strong>7d</strong>
            <strong>10K</strong>
          </div>
          <p>
            {latestPost.title} · 좋아요 {latestPost.likeCount} · 댓글 {latestPost.commentCount}
          </p>
          <div className={styles.goal}>
            <span>목표 +{(goal.targetKm - goal.currentKm).toFixed(0)}km</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
