import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import logoIcon from '@/asset/dallyrunicon.png';
import { badges, crews, notifications, posts, profile, runRecords } from '@/mock/dallyrun';

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
  { to: '/goals', label: '목표', icon: 'G' },
  { to: '/community', label: '커뮤니티', icon: 'C' },
  { to: '/crews', label: '크루', icon: 'T' },
  { to: '/profile', label: '프로필', icon: 'P' },
  { to: '/settings', label: '설정', icon: 'S' },
];

function WebShell({ title, subtitle, action, children }: WebShellProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!normalizedQuery) return [];

    return [
      ...runRecords.map((record) => ({
        type: '기록',
        title: record.title,
        meta: `${record.place} · ${record.distance}`,
        to: `/records/${record.id}`,
      })),
      ...posts.map((post) => ({
        type: '커뮤니티',
        title: post.title,
        meta: `${post.category} · ${post.author}`,
        to: `/community/${post.id}`,
      })),
      ...crews.map((crew) => ({
        type: '크루',
        title: crew.name,
        meta: `${crew.area} · ${crew.activityTime}`,
        to: `/crews/${crew.id}`,
      })),
      ...badges.map((badge) => ({
        type: '뱃지',
        title: badge.title,
        meta: `${badge.status} · ${badge.category}`,
        to: `/badges/${badge.id}`,
      })),
    ]
      .filter((item) =>
        [item.title, item.meta, item.type].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        ),
      )
      .slice(0, 6);
  }, [normalizedQuery]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const [firstResult] = searchResults;
    if (firstResult) {
      setSearchQuery('');
      navigate(firstResult.to);
      return;
    }

    if (normalizedQuery) {
      navigate(`/tags/${encodeURIComponent(searchQuery.trim().replace(/^#/, ''))}`);
    }
  };

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
            <form className={styles.searchWrap} onSubmit={handleSearchSubmit}>
              <label className={styles.search}>
                <span aria-hidden="true">⌕</span>
                <input
                  placeholder="기록·크루 검색"
                  aria-label="기록·크루 검색"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </label>
              {normalizedQuery && (
                <div className={styles.searchResults} role="listbox">
                  {searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <Link key={`${item.type}-${item.to}`} to={item.to}>
                        <strong>{item.title}</strong>
                        <span>
                          {item.type} · {item.meta}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <span className={styles.emptySearch}>
                      검색 결과가 없어요. Enter로 태그 검색
                    </span>
                  )}
                </div>
              )}
            </form>
            <div className={styles.notificationWrap}>
              <button
                type="button"
                className={styles.iconButton}
                aria-label="알림"
                aria-expanded={isNotificationOpen}
                onClick={() => setIsNotificationOpen((current) => !current)}
              >
                N
              </button>
              {isNotificationOpen && (
                <div className={styles.notificationPanel}>
                  <strong>최근 알림</strong>
                  {notifications.slice(0, 5).map((item) => (
                    <Link key={item.id} to="/notifications">
                      <small>{item.category}</small>
                      <span>{item.title}</span>
                    </Link>
                  ))}
                  <Link to="/notifications" className={styles.notificationMore}>
                    전체 알림 보기
                  </Link>
                </div>
              )}
            </div>
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
