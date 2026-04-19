import styles from './HomePage.module.css';

function HomePage() {
  return (
    <main className={styles.home}>
      <h1 className={styles.title}>Dallyrun</h1>
      <p className={styles.subtitle}>달리런 웹 프론트 초기 셋업이 완료되었습니다.</p>
    </main>
  );
}

export default HomePage;
