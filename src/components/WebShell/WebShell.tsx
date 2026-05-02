import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

import logoIcon from '@/asset/dallyrunicon.png';
import { profile } from '@/mock/dallyrun';

import styles from './WebShell.module.css';

interface WebShellProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}

const navItems = [
  { to: '/home', label: '홈', icon: 'H' },
  { to: '/records', label: '기록', icon: 'R' },
  { to: '/goals/edit', label: '목표', icon: 'G' },
  { to: '/community/hangang-review', label: '커뮤니티', icon: 'C' },
  { to: '/crews', label: '크루', icon: 'T' },
  { to: '/profile', label: '프로필', icon: 'P' },
  { to: '/settings', label: '설정', icon: 'S' },
];

function WebShell({ title, subtitle, action, children }: WebShellProps) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="주요 메뉴">
        <div className={styles.brand}>
          <img src={logoIcon} alt="" aria-hidden="true" draggable={false} />
          <span>
            <strong>달리런</strong>
            <small>Dallyrun</small>
          </span>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.sidebarProfile}>
          <img src={logoIcon} alt="" aria-hidden="true" className={styles.sidebarAvatar} />
          <span>
            <strong>정민</strong>
            <small>{profile.yearLabel}</small>
          </span>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className={styles.headerTools}>
            <label className={styles.search}>
              <span aria-hidden="true">⌕</span>
              <input placeholder="기록·크루 검색" aria-label="기록·크루 검색" />
            </label>
            <NavLink to="/notifications" className={styles.iconButton} aria-label="알림">
              N
            </NavLink>
            <NavLink to="/profile" className={styles.topAvatar} aria-label="프로필">
              JM
            </NavLink>
            {action}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

export default WebShell;
