import logoIcon from '@/asset/dallyrunicon.png';

import styles from './Logo.module.css';

export type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
  size?: LogoSize;
  withTagline?: boolean;
  withIcon?: boolean;
  as?: 'h1' | 'h2' | 'div';
}

function Logo({ size = 'md', withTagline = true, withIcon = true, as: Tag = 'h1' }: LogoProps) {
  return (
    <div className={`${styles.root} ${styles[size]}`}>
      {withIcon && (
        <img src={logoIcon} alt="" aria-hidden="true" className={styles.icon} draggable={false} />
      )}
      <Tag className={styles.wordmark}>Dallyrun</Tag>
      {withTagline && <p className={styles.tagline}>달리는 즐거움, 달리런</p>}
    </div>
  );
}

export default Logo;
