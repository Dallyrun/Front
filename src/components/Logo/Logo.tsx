import styles from './Logo.module.css';

export type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
  size?: LogoSize;
  withTagline?: boolean;
  as?: 'h1' | 'h2' | 'div';
}

function Logo({ size = 'md', withTagline = true, as: Tag = 'h1' }: LogoProps) {
  return (
    <div className={`${styles.root} ${styles[size]}`}>
      <Tag className={styles.wordmark}>Dallyrun</Tag>
      {withTagline && <p className={styles.tagline}>달리는 즐거움, 달리런</p>}
    </div>
  );
}

export default Logo;
