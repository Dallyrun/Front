import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import WebShell from '@/components/WebShell/WebShell';
import {
  badges,
  crews,
  emptyStates,
  followers,
  following,
  getBadge,
  getPost,
  getRunRecord,
  goal,
  notifications,
  posts,
  profile,
  runRecords,
} from '@/mock/dallyrun';
import type {
  Crew,
  Goal,
  NotificationCategory,
  NotificationItem,
  Post,
  PostCategory,
  PrivacyScope,
  Recruit,
  RecruitType,
  RunRecord,
} from '@/types/dallyrun';
import {
  formatDistanceKm,
  formatDistanceText,
  formatSplitDistance,
  translate,
  useWebSettings,
  type WebSettings,
} from '@/utils/webSettings';

import styles from './WebPages.module.css';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

function Card({ title, children, className = '' }: CardProps) {
  const [settings] = useWebSettings();
  return (
    <section className={`${styles.card} ${className}`}>
      {title && <h2>{translate(formatDistanceText(title, settings.unit), settings.language)}</h2>}
      {children}
    </section>
  );
}

function Chip({
  children,
  tone = 'blue',
}: {
  children: ReactNode;
  tone?: 'blue' | 'softBlue' | 'green' | 'amber' | 'slate' | 'red';
}) {
  const [settings] = useWebSettings();
  const content =
    typeof children === 'string'
      ? translate(formatDistanceText(children, settings.unit), settings.language)
      : children;

  return <span className={`${styles.chip} ${styles[`chip${tone}`]}`}>{content}</span>;
}

function PrimaryLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className={styles.primaryButton}>
      {children}
    </Link>
  );
}

function SecondaryLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className={styles.secondaryButton}>
      {children}
    </Link>
  );
}

function PrimaryButton({
  children,
  disabled = false,
  onClick,
  type = 'button',
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}) {
  return (
    <button type={type} className={styles.primaryButton} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
}) {
  return (
    <button type={type} className={styles.secondaryButton} onClick={onClick}>
      {children}
    </button>
  );
}

function StatCard({
  label,
  value,
  caption,
  tone = 'blue',
}: {
  label: string;
  value: string;
  caption?: string;
  tone?: 'blue' | 'green';
}) {
  const [settings] = useWebSettings();
  return (
    <div className={styles.statCard}>
      <span className={`${styles.statAccent} ${styles[`statAccent${tone}`]}`} aria-hidden="true" />
      <span>{translate(label, settings.language)}</span>
      <strong>{formatDistanceText(translate(value, settings.language), settings.unit)}</strong>
      {caption && (
        <small>{formatDistanceText(translate(caption, settings.language), settings.unit)}</small>
      )}
    </div>
  );
}

function useWebDisplay() {
  const [settings, setSettings] = useWebSettings();
  const t = (value: string) => translate(value, settings.language);
  const td = (value: string) => formatDistanceText(t(value), settings.unit);
  const distance = (valueKm: number) => formatDistanceKm(valueKm, settings.unit);
  const splitDistance = (valueKm: number) => formatSplitDistance(valueKm, settings.unit);

  return { settings, setSettings, t, td, distance, splitDistance };
}

function displayDistanceText(text: string, settings: WebSettings) {
  return formatDistanceText(text, settings.unit);
}

type StoredStateUpdater<T> = T | ((current: T) => T);

function readStoredState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredState<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Mock state is best-effort; UI still works in memory when storage is unavailable.
  }
}

function useStoredState<T>(
  key: string,
  fallback: T,
): [T, (nextValue: StoredStateUpdater<T>) => void] {
  const [value, setValue] = useState<T>(() => readStoredState(key, fallback));

  const updateValue = (nextValue: StoredStateUpdater<T>) => {
    setValue((current) => {
      const resolved =
        typeof nextValue === 'function' ? (nextValue as (current: T) => T)(current) : nextValue;
      writeStoredState(key, resolved);
      return resolved;
    });
  };

  return [value, updateValue];
}

const goalStorageKey = 'dallyrun-web-goal';
const postsStorageKey = 'dallyrun-web-posts';
const crewsStorageKey = 'dallyrun-web-crews';
const profileStorageKey = 'dallyrun-web-profile';
const runMemoStorageKey = 'dallyrun-web-run-memos';

function useWebGoal() {
  return useStoredState<Goal>(goalStorageKey, goal);
}

function useWebPosts() {
  return useStoredState<Post[]>(postsStorageKey, posts);
}

function useWebCrews() {
  return useStoredState<Crew[]>(crewsStorageKey, crews);
}

function useWebProfile() {
  return useStoredState(profileStorageKey, profile);
}

function getWebCrew(webCrews: Crew[], id?: string) {
  const fallback = webCrews[0];
  if (!fallback) throw new Error('Mock crews are empty');
  return webCrews.find((crew) => crew.id === id) ?? fallback;
}

function getWebRecruit(webCrews: Crew[], crewId?: string, recruitId?: string) {
  const crew = getWebCrew(webCrews, crewId);
  const fallback = crew.recruits[0];
  if (!fallback) throw new Error(`Mock recruits are empty for crew ${crew.id}`);
  return {
    crew,
    recruit: crew.recruits.find((recruit) => recruit.id === recruitId) ?? fallback,
  };
}

const postCategories: PostCategory[] = ['러닝 후기', '코스 공유', '초보 Q&A', '장비'];
const recruitTypes: RecruitType[] = ['정기런', '번개런', '대회'];
const goalTargetPresets = [30, 50, 80, 100];
const notificationFilters: NotificationCategory[] = ['전체', '소셜', '크루', '뱃지', '팔로우'];
const privacyOptions: Array<{ value: PrivacyScope; label: string; description: string }> = [
  { value: 'PUBLIC', label: '전체 공개', description: '모든 러너가 볼 수 있어요' },
  { value: 'FOLLOWERS', label: '팔로워만', description: '나를 팔로우한 사람만 볼 수 있어요' },
  { value: 'PRIVATE', label: '비공개', description: '나만 볼 수 있어요' },
];

function ProgressBar({ value }: { value: number }) {
  return (
    <div className={styles.progressTrack} aria-label={`진행률 ${value}%`}>
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

function RunListItem({ record }: { record: RunRecord }) {
  const { settings } = useWebDisplay();

  return (
    <Link to={`/records/${record.id}`} className={styles.listItem}>
      <span>
        <strong>{record.title}</strong>
        <small>
          {displayDistanceText(record.distance, settings)} · {record.duration}
        </small>
      </span>
      {record.prStatus && <Chip tone="amber">{record.prStatus}</Chip>}
    </Link>
  );
}

function PostListItem({ post }: { post: Post }) {
  const { t } = useWebDisplay();

  return (
    <Link to={`/community/${post.id}`} className={styles.postCard}>
      <span className={styles.postAvatar} aria-hidden="true">
        {post.author.slice(0, 1)}
      </span>
      <span className={styles.postContent}>
        <span className={styles.postTopline}>
          <Chip>{post.category}</Chip>
          <small>
            {post.author} · {post.crew} · {post.timeAgo}
          </small>
        </span>
        <strong>{post.title}</strong>
        <em>{post.body}</em>
        <span className={styles.postTags}>
          {post.hashtags.slice(0, 2).map((tag) => (
            <Chip key={tag} tone="slate">
              {tag}
            </Chip>
          ))}
        </span>
        <span className={styles.postMetrics}>
          <small>
            {t('좋아요')} {post.likeCount}
          </small>
          <small>
            {t('댓글')} {post.commentCount}
          </small>
          <small>
            {t('공유')} {post.shareCount}
          </small>
        </span>
      </span>
    </Link>
  );
}

function getRecruitTone(type: Recruit['type']) {
  return type === '정기런' ? 'green' : type === '번개런' ? 'amber' : 'blue';
}

function RecruitItem({ recruit, crewId }: { recruit: Recruit; crewId: string }) {
  const { settings, t } = useWebDisplay();
  const [dateLabel, dayLabel, timeLabel] = recruit.schedule.split(' ');

  return (
    <Link to={`/crews/${crewId}/recruits/${recruit.id}`} className={styles.recruitCard}>
      <span className={styles.recruitDate}>
        <strong>{dateLabel}</strong>
        <small>
          {dayLabel} {timeLabel}
        </small>
      </span>
      <span className={styles.recruitContent}>
        <span className={styles.recruitChips}>
          <Chip tone={getRecruitTone(recruit.type)}>{recruit.type}</Chip>
          <Chip tone="slate">{displayDistanceText(recruit.distance, settings)}</Chip>
        </span>
        <strong>{recruit.title}</strong>
        <small>
          {recruit.place} · {recruit.pace}
        </small>
      </span>
      <span className={styles.recruitStatus}>
        <strong>{recruit.participants}</strong>
        <small>{t('참여 현황')}</small>
      </span>
    </Link>
  );
}

type RecordRange = 'weekly' | 'monthly' | 'yearly';
type CrewFilterKey = 'area' | 'pace' | 'time' | 'level';
type CrewFilters = Record<CrewFilterKey, string>;

const recordRangeOptions: Array<{
  id: RecordRange;
  label: string;
  splitTitle: string;
  sessionTitle: string;
  distance: string;
  runCount: string;
  totalTime: string;
  averagePace: string;
  records: typeof runRecords;
}> = [
  {
    id: 'weekly',
    label: '주간',
    splitTitle: '이번 주 1km 스플릿',
    sessionTitle: '이번 주 러닝 세션',
    distance: '18.4 km',
    runCount: '3 runs',
    totalTime: '1h 52m',
    averagePace: '5\'42"',
    records: runRecords.slice(0, 2),
  },
  {
    id: 'monthly',
    label: '월간',
    splitTitle: '이번 달 1km 스플릿',
    sessionTitle: '이번 달 러닝 세션',
    distance: '57.6 km',
    runCount: '12 runs',
    totalTime: '5h 48m',
    averagePace: profile.averagePace,
    records: runRecords,
  },
  {
    id: 'yearly',
    label: '연간',
    splitTitle: '올해 대표 1km 스플릿',
    sessionTitle: '올해 주요 러닝 세션',
    distance: profile.totalDistance,
    runCount: `${profile.runCount} runs`,
    totalTime: '23h 12m',
    averagePace: profile.averagePace,
    records: runRecords,
  },
];

const crewFilterGroups: Array<{
  key: CrewFilterKey;
  label: string;
  options: string[];
}> = [
  { key: 'area', label: '지역', options: ['전체', '서울', '여의도', '성수'] },
  { key: 'pace', label: '페이스', options: ['전체', "5'30~6'30", "6'00"] },
  { key: 'time', label: '시간대', options: ['전체', '평일 저녁', '평일 오전', '주말 오전'] },
  { key: 'level', label: '레벨', options: ['전체', '초급', '중급'] },
];

export function DashboardHomePage() {
  const { settings, t, td, distance } = useWebDisplay();
  const [currentGoal] = useWebGoal();
  const progress = Math.min(
    100,
    Math.round((currentGoal.currentKm / Math.max(currentGoal.targetKm, 1)) * 100),
  );
  const remainingKm = Math.max(currentGoal.targetKm - currentGoal.currentKm, 0);
  const latestRun = getRunRecord('hangang-night-8k');
  const homeFeedPreviews = [
    {
      author: '달리는 수현',
      meta: t('한강 러닝크루 · 23분 전'),
      body: td('8.2km 야간런 완료. 마지막 1km 페이스가 가장 좋았어요.'),
      to: '/community/hangang-review',
    },
    {
      author: '정원오빠',
      meta: `${t('뱃지')} · ${t('댓글')} 12`,
      body: td('100km 클럽 뱃지를 달성했어요. 다음 목표는 꾸준히 150km입니다.'),
      to: '/badges/10k-club',
    },
  ];
  const homeCrewSchedules = [
    {
      day: '토요일',
      title: '잠실 새벽 6K 조깅',
      meta: `06:30 · 잠실나루 · 6'30" ${t('페이스')} · 8/12명`,
      to: '/crews/hangang-crew/recruits/friday-8k',
    },
    {
      day: '일요일',
      title: '성수 한강 회복런',
      meta: `19:00 · 서울숲 · 7'00" ${t('페이스')} · 5/10명`,
      to: '/crews/seongsu-morning',
    },
  ];

  return (
    <WebShell
      title="러닝 인사이트 홈"
      subtitle="오늘의 기록, 목표, 커뮤니티 소식을 한 화면에서 확인합니다."
      action={
        <>
          <SecondaryLink to="/records">기록 보기</SecondaryLink>
          <PrimaryLink to="/community/new">피드 글쓰기</PrimaryLink>
        </>
      }
    >
      <div className={styles.heroGrid}>
        <Card className={styles.heroCard}>
          <div>
            <Chip tone="softBlue">오늘 러닝 상태</Chip>
            <h2>어제 10K 완주 기록이 반영됐어요</h2>
            <p>
              {td(
                '최근 7일 누적 거리는 18.4km입니다. 기록 상세에서 구간별 페이스와 메모를 확인하고, 커뮤니티에 러닝 후기를 남길 수 있습니다.',
              )}
            </p>
            <div className={styles.actions}>
              <PrimaryLink to={`/records/${latestRun.id}`}>최근 기록 보기</PrimaryLink>
              <SecondaryLink to="/community/new">피드 글쓰기</SecondaryLink>
            </div>
          </div>
          <div className={styles.routePreview} aria-label="최근 러닝 요약">
            <span />
            <span />
            <span />
            <strong>{displayDistanceText(latestRun.distance, settings)}</strong>
            <strong>{latestRun.duration}</strong>
          </div>
        </Card>
        <Card title={`${currentGoal.period} 목표`}>
          <strong className={styles.bigNumber}>{progress}%</strong>
          <ProgressBar value={progress} />
          <p>
            {distance(currentGoal.targetKm)} {t('중')} {distance(currentGoal.currentKm)} {t('완료')}
          </p>
          <p>
            {t('이번 달 남은 목표까지')} {distance(remainingKm)}
            {t('가 남았습니다. 목표 수정에서 주간·월간 거리를 직접 조정할 수 있습니다.')}
          </p>
          <SecondaryLink to="/goals/edit">목표 수정</SecondaryLink>
        </Card>
      </div>
      <div className={styles.homeStatGrid}>
        <StatCard label="이번 주 거리" value="18.4 km" caption="지난주보다 +12%" />
        <StatCard label="평균 페이스" value="5'42&quot;" caption="최근 5회 평균" tone="green" />
        <StatCard label="연속 러닝" value="7일" caption="이번 주 3회 기록" />
        <StatCard label="신규 PR" value="10K" caption="04.28 달성" />
      </div>
      <div className={styles.twoColumn}>
        <Card>
          <div className={styles.panelHeader}>
            <h2>커뮤니티</h2>
            <PrimaryLink to="/community/new">피드 글쓰기</PrimaryLink>
          </div>
          {homeFeedPreviews.map((post) => (
            <Link key={post.body} to={post.to} className={styles.feedPreviewItem}>
              <span className={styles.feedAvatar}>달</span>
              <span>
                <strong>{post.author}</strong>
                <small>{post.meta}</small>
                <em>{post.body}</em>
              </span>
            </Link>
          ))}
        </Card>
        <Card>
          <div className={styles.panelHeader}>
            <h2>이번 주 크루 일정</h2>
            <SecondaryLink to="/crews">크루 찾기</SecondaryLink>
          </div>
          {homeCrewSchedules.map((schedule) => (
            <Link key={schedule.title} to={schedule.to} className={styles.scheduleItem}>
              <Chip tone="softBlue">{schedule.day}</Chip>
              <span>
                <strong>{schedule.title}</strong>
                <small>{schedule.meta}</small>
              </span>
            </Link>
          ))}
        </Card>
      </div>
    </WebShell>
  );
}

export function RecordsPage() {
  const { t, splitDistance } = useWebDisplay();
  const latestRun = getRunRecord('hangang-night-8k');
  const [selectedRange, setSelectedRange] = useState<RecordRange>('weekly');
  const currentRange =
    recordRangeOptions.find((option) => option.id === selectedRange) ?? recordRangeOptions[0]!;

  return (
    <WebShell
      title="기록 분석"
      subtitle="히스토리, 1km 스플릿, 누적 통계와 PR을 쉽게 돌아볼 수 있습니다."
    >
      <div className={styles.tabList} role="tablist" aria-label={t('기록 분석 기간')}>
        {recordRangeOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={option.id === selectedRange}
            className={`${styles.tabButton} ${
              option.id === selectedRange ? styles.tabButtonActive : ''
            }`}
            onClick={() => setSelectedRange(option.id)}
          >
            {t(option.label)}
          </button>
        ))}
      </div>
      <div className={styles.statGrid}>
        <StatCard label="총 누적 거리" value={currentRange.distance} />
        <StatCard label="총 러닝" value={currentRange.runCount} />
        <StatCard label="총 시간" value={currentRange.totalTime} />
        <StatCard label="평균 페이스" value={currentRange.averagePace} />
      </div>
      <div className={styles.twoColumn}>
        <Card title={currentRange.splitTitle}>
          {latestRun.splits.slice(0, 5).map((split) => (
            <div key={split.km} className={styles.splitRow}>
              <span>{splitDistance(split.km)}</span>
              <ProgressBar value={split.value} />
              <strong>{split.pace}</strong>
            </div>
          ))}
        </Card>
        <Card title={currentRange.sessionTitle}>
          {currentRange.records.map((record) => (
            <RunListItem key={record.id} record={record} />
          ))}
        </Card>
      </div>
    </WebShell>
  );
}

export function RunningDetailPage() {
  const { settings, t, splitDistance } = useWebDisplay();
  const { runId } = useParams();
  const record = getRunRecord(runId);
  const [splitMode, setSplitMode] = useState<'전체' | 'BEST'>('전체');
  const [selectedPhoto, setSelectedPhoto] = useState(record.photos[0] ?? '');
  const [memoByRunId, setMemoByRunId] = useStoredState<Record<string, string>>(
    runMemoStorageKey,
    {},
  );
  const [memoDraft, setMemoDraft] = useState(memoByRunId[record.id] ?? record.memo);
  const [memoStatus, setMemoStatus] = useState('');
  const visibleSplits =
    splitMode === 'BEST' ? record.splits.filter((split) => split.isBest) : record.splits;

  const saveMemo = () => {
    setMemoByRunId({ ...memoByRunId, [record.id]: memoDraft });
    setMemoStatus(t('메모가 mock 데이터에 저장됐어요.'));
  };

  return (
    <WebShell
      title="러닝 기록 상세"
      subtitle="거리, 시간, 페이스, 칼로리와 모든 구간 기록을 확인합니다."
    >
      <Card className={styles.detailHero}>
        <div>
          <Chip>{record.runType}</Chip>
          {record.prStatus && <Chip tone="amber">{record.prStatus}</Chip>}
          <h2>{record.title}</h2>
          <p>
            {record.date} · {record.place}
          </p>
        </div>
        <div className={styles.statGrid}>
          <StatCard label="거리" value={displayDistanceText(record.distance, settings)} />
          <StatCard label="시간" value={record.duration} />
          <StatCard label="평균 페이스" value={record.pace} />
          <StatCard label="칼로리" value={record.calories} />
        </div>
      </Card>
      <div className={styles.twoColumn}>
        <Card title="구간별 페이스">
          <div className={styles.tabList} role="tablist" aria-label={t('스플릿 보기 방식')}>
            {(['전체', 'BEST'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={splitMode === mode}
                className={`${styles.tabButton} ${
                  splitMode === mode ? styles.tabButtonActive : ''
                }`}
                onClick={() => setSplitMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
          {visibleSplits.map((split) => (
            <div key={split.km} className={styles.splitRow}>
              <span>{splitDistance(split.km)}</span>
              <ProgressBar value={split.value} />
              <strong>{split.isBest ? 'BEST' : split.pace}</strong>
            </div>
          ))}
        </Card>
        <Card title="메모와 사진">
          <div className={styles.photoGrid}>
            {record.photos.map((photo) => (
              <button
                key={photo}
                type="button"
                className={`${styles.photoTile} ${
                  selectedPhoto === photo ? styles.photoTileActive : ''
                }`}
                aria-pressed={selectedPhoto === photo}
                onClick={() => setSelectedPhoto(photo)}
              >
                {photo}
              </button>
            ))}
          </div>
          <div className={styles.settingsPreview}>
            <strong>{t('선택한 사진')}</strong>
            <span>{selectedPhoto || t('사진 없음')}</span>
          </div>
          <label className={styles.compactSearch}>
            {t('러닝 메모')}
            <textarea
              aria-label={t('러닝 메모')}
              value={memoDraft}
              onChange={(event) => {
                setMemoDraft(event.target.value);
                setMemoStatus('');
              }}
            />
          </label>
          <div className={styles.actions}>
            <SecondaryButton
              onClick={() => {
                setMemoDraft(record.memo);
                setMemoStatus(t('기본 메모로 되돌렸어요.'));
              }}
            >
              {t('되돌리기')}
            </SecondaryButton>
            <PrimaryButton onClick={saveMemo}>{t('메모 저장')}</PrimaryButton>
          </div>
          {memoStatus && <p className={styles.statusMessage}>{memoStatus}</p>}
        </Card>
      </div>
    </WebShell>
  );
}

export function GoalPage() {
  const { t, distance } = useWebDisplay();
  const [currentGoal] = useWebGoal();
  const progress = Math.round((currentGoal.currentKm / currentGoal.targetKm) * 100);
  const remainingKm = Math.max(currentGoal.targetKm - currentGoal.currentKm, 0);
  const heatmapValues = [
    72, 44, 0, 88, 60, 38, 0, 92, 55, 28, 76, 0, 66, 82, 40, 0, 58, 94, 36, 64, 48,
  ];

  return (
    <WebShell
      title="목표"
      subtitle="현재 설정한 거리 목표와 달성 흐름을 먼저 확인합니다."
      action={<PrimaryLink to="/goals/edit">목표 수정</PrimaryLink>}
    >
      <section className={styles.goalHero}>
        <div>
          <Chip>{currentGoal.period} 목표</Chip>
          <h2>{currentGoal.title}</h2>
          <p>
            {currentGoal.startDate} - {currentGoal.endDate}
          </p>
          <div className={styles.goalProgressSummary}>
            <strong>{progress}%</strong>
            <span>
              {distance(currentGoal.targetKm)} {t('중')} {distance(currentGoal.currentKm)}{' '}
              {t('완료')} · {t('남은 거리')} {distance(remainingKm)}
            </span>
          </div>
          <ProgressBar value={progress} />
        </div>
        <div className={styles.goalHeroStats}>
          <span>
            <strong>{distance(currentGoal.currentKm)}</strong>
            {t('현재 거리')}
          </span>
          <span>
            <strong>{distance(currentGoal.targetKm)}</strong>
            {t('목표 거리')}
          </span>
          <span>
            <strong>{distance(remainingKm)}</strong>
            {t('남은 거리')}
          </span>
          <span>
            <strong>12회</strong>
            {t('이번 목표 러닝')}
          </span>
        </div>
      </section>
      <div className={styles.twoColumn}>
        <Card title="달성 캘린더">
          <div className={styles.goalHeatmap} aria-label={t('목표 달성 캘린더')}>
            {heatmapValues.map((value, index) => (
              <span
                key={`goal-heat-${index}-${value}`}
                className={value >= 75 ? styles.heatStrong : value > 0 ? styles.heatMedium : ''}
              />
            ))}
          </div>
          <p>{t('러닝한 날이 많을수록 진하게 표시됩니다.')}</p>
        </Card>
        <Card title="목표에 반영된 최근 기록">
          {runRecords.slice(0, 3).map((record) => (
            <RunListItem key={record.id} record={record} />
          ))}
        </Card>
      </div>
      <Card title="목표 관리">
        <div className={styles.goalManagement}>
          <span>
            <strong>{t('목표를 바꾸고 싶나요?')}</strong>
            {t('기간과 거리만 수정하면 현재 달성률이 다시 계산됩니다.')}
          </span>
          <SecondaryLink to="/goals/edit">목표 설정 / 수정</SecondaryLink>
        </div>
      </Card>
    </WebShell>
  );
}

export function GoalEditPage() {
  const { t, distance } = useWebDisplay();
  const navigate = useNavigate();
  const [storedGoal, setStoredGoal] = useWebGoal();
  const [draft, setDraft] = useState<Goal>(storedGoal);
  const [status, setStatus] = useState('');
  const previewProgress = Math.min(
    100,
    Math.round((draft.currentKm / Math.max(Number(draft.targetKm), 1)) * 100),
  );
  const remainingKm = Math.max(Number(draft.targetKm) - draft.currentKm, 0);
  const isGoalInvalid = draft.title.trim().length === 0 || Number(draft.targetKm) <= 0;

  const saveGoal = () => {
    if (isGoalInvalid) {
      setStatus(t('목표 이름과 목표 거리를 확인해주세요.'));
      return;
    }
    setStoredGoal(draft);
    setStatus(t('목표가 mock 데이터에 저장됐어요.'));
  };

  return (
    <WebShell
      title="목표 설정"
      subtitle="주간·월간 거리 목표를 직접 입력하고 수정합니다."
      action={
        <>
          <SecondaryLink to="/goals">{t('목표 보기')}</SecondaryLink>
          <PrimaryButton onClick={saveGoal}>{t('저장하기')}</PrimaryButton>
        </>
      }
    >
      <div className={styles.twoColumn}>
        <Card title="거리 목표">
          <div className={styles.formGrid}>
            <label>
              {t('목표 이름')}
              <input
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              />
            </label>
            <div className={styles.formField}>
              <span>{t('기간')}</span>
              <div className={styles.inlineSegment} role="tablist" aria-label={t('목표 기간')}>
                {(['주간', '월간'] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    role="tab"
                    aria-selected={draft.period === period}
                    className={`${styles.filterButton} ${
                      draft.period === period ? styles.filterButtonActive : ''
                    }`}
                    onClick={() => setDraft({ ...draft, period })}
                  >
                    {t(period)}
                  </button>
                ))}
              </div>
            </div>
            <label>
              {t('목표 거리')}
              <input
                type="number"
                min="1"
                value={draft.targetKm}
                onChange={(event) =>
                  setDraft({ ...draft, targetKm: Number(event.target.value || 0) })
                }
              />
            </label>
            <label>
              {t('현재 거리')}
              <input
                type="number"
                min="0"
                value={draft.currentKm}
                onChange={(event) =>
                  setDraft({ ...draft, currentKm: Number(event.target.value || 0) })
                }
              />
            </label>
            <label>
              {t('시작일')}
              <input
                value={draft.startDate}
                onChange={(event) => setDraft({ ...draft, startDate: event.target.value })}
              />
            </label>
            <label>
              {t('종료일')}
              <input
                value={draft.endDate}
                onChange={(event) => setDraft({ ...draft, endDate: event.target.value })}
              />
            </label>
            <div className={styles.formWide}>
              <strong>{t('거리 프리셋')}</strong>
              <div className={styles.inlineSegment} aria-label={t('목표 거리 프리셋')}>
                {goalTargetPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`${styles.filterButton} ${
                      draft.targetKm === preset ? styles.filterButtonActive : ''
                    }`}
                    aria-pressed={draft.targetKm === preset}
                    onClick={() => setDraft({ ...draft, targetKm: preset })}
                  >
                    {distance(preset)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {status && <p className={styles.statusMessage}>{status}</p>}
        </Card>
        <Card title="목표 미리보기">
          <strong className={styles.bigNumber}>{previewProgress}%</strong>
          <ProgressBar value={previewProgress} />
          <p>
            {distance(draft.targetKm)} {t('중')} {distance(draft.currentKm)} {t('완료')} ·{' '}
            {t('남은 거리')} {distance(remainingKm)}
          </p>
          <p>
            {t('러닝')} 12회 · {t('평균 페이스')} 5'34&quot;
          </p>
          <div className={styles.actions}>
            <SecondaryButton onClick={() => setDraft(storedGoal)}>{t('되돌리기')}</SecondaryButton>
            <PrimaryButton
              disabled={isGoalInvalid}
              onClick={() => {
                saveGoal();
                if (!isGoalInvalid) navigate('/goals');
              }}
            >
              {t('저장 후 보기')}
            </PrimaryButton>
          </div>
        </Card>
      </div>
    </WebShell>
  );
}

export function BadgeListPage() {
  const [statusFilter, setStatusFilter] = useState<'전체' | '획득' | '미획득'>('전체');
  const filteredBadges =
    statusFilter === '전체' ? badges : badges.filter((badge) => badge.status === statusFilter);

  return (
    <WebShell title="뱃지 전체" subtitle="획득한 뱃지와 아직 남은 조건을 한눈에 봅니다.">
      <div className={styles.tabList} role="tablist" aria-label="뱃지 상태 필터">
        {(['전체', '획득', '미획득'] as const).map((label) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={statusFilter === label}
            className={`${styles.tabButton} ${
              statusFilter === label ? styles.tabButtonActive : ''
            }`}
            onClick={() => setStatusFilter(label)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={styles.cardGrid}>
        {filteredBadges.map((badge) => (
          <Link key={badge.id} to={`/badges/${badge.id}`} className={styles.badgeCard}>
            <span aria-hidden="true">{badge.status === '획득' ? '★' : '☆'}</span>
            <strong>{badge.title}</strong>
            <small>{badge.description}</small>
          </Link>
        ))}
      </div>
    </WebShell>
  );
}

export function BadgeDetailPage() {
  const { settings, t } = useWebDisplay();
  const { badgeId } = useParams();
  const badge = getBadge(badgeId);
  const [activeTab, setActiveTab] = useState<'조건' | '관련 기록'>('조건');
  const [status, setStatus] = useState('');
  const badgeProgressValue = badge.status === '획득' ? 100 : 85;

  return (
    <WebShell
      title="뱃지 상세"
      subtitle="뱃지 조건과 달성 상태, 관련 기록을 확인합니다."
      action={<SecondaryLink to="/badges">뱃지 목록</SecondaryLink>}
    >
      <Card className={styles.detailHero}>
        <div className={styles.badgeMark}>10K</div>
        <div>
          <Chip tone={badge.status === '획득' ? 'green' : 'slate'}>{badge.status}</Chip>
          <h2>{badge.title}</h2>
          <p>{badge.description}</p>
          <ProgressBar value={badgeProgressValue} />
          <p>
            {t('조건 달성')} {displayDistanceText(badge.progress, settings)}
          </p>
        </div>
      </Card>
      <div className={styles.tabList} role="tablist" aria-label="뱃지 상세 탭">
        {(['조건', '관련 기록'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`${styles.tabButton} ${activeTab === tab ? styles.tabButtonActive : ''}`}
            onClick={() => {
              setActiveTab(tab);
              setStatus('');
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      {activeTab === '조건' && (
        <Card title="획득 조건">
          {[
            '단일 러닝 기록 거리 10km 이상',
            'GPS 기록이 정상 저장된 러닝',
            '삭제되지 않은 공개 가능 기록',
          ].map((condition, index) => (
            <label key={condition} className={styles.settingToggle}>
              <span>
                <strong>조건 {index + 1}</strong>
                <small>{condition}</small>
              </span>
              <input type="checkbox" checked={badge.status === '획득' || index < 2} readOnly />
            </label>
          ))}
        </Card>
      )}
      {activeTab === '관련 기록' && (
        <Card title="관련 기록">
          <RunListItem record={getRunRecord('tempo-10k')} />
          <div className={styles.actions}>
            <SecondaryLink to="/community/new">게시글 작성으로 이동</SecondaryLink>
            <PrimaryButton onClick={() => setStatus('뱃지를 게시글 첨부 mock 상태로 준비했어요.')}>
              뱃지 첨부하기
            </PrimaryButton>
          </div>
          {status && <p className={styles.statusMessage}>{status}</p>}
        </Card>
      )}
    </WebShell>
  );
}

export function PostComposePage() {
  const navigate = useNavigate();
  const [webPosts, setWebPosts] = useWebPosts();
  const [title, setTitle] = useState('한강 야간런 후기');
  const [body, setBody] = useState(
    '오늘 한강에서 8.2km 달렸어요. 페이스가 안정적이라 기분 좋은 러닝이었습니다.',
  );
  const [category, setCategory] = useState<PostCategory>('러닝 후기');
  const [hashtagInput, setHashtagInput] = useState('#한강런 #야간런 #8km');
  const [attachedRunId, setAttachedRunId] = useState(runRecords[0]?.id ?? '');
  const [status, setStatus] = useState('');
  const hashtags = hashtagInput
    .split(/\s+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
    .slice(0, 6);
  const attachedRun = getRunRecord(attachedRunId);
  const previewPost: Post = {
    id: 'preview',
    title: title || '제목을 입력하세요',
    author: profile.nickname,
    crew: '개인 피드',
    timeAgo: '방금',
    category,
    body: body || '내용을 입력하면 미리보기에 바로 반영됩니다.',
    hashtags,
    attachedRunId,
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    comments: [],
  };

  const publishPost = () => {
    const nextPost = {
      ...previewPost,
      id: `post-${Date.now()}`,
      title: previewPost.title.trim(),
      body: previewPost.body.trim(),
    };
    setWebPosts([nextPost, ...webPosts.filter((post) => post.id !== nextPost.id)]);
    setStatus('게시글이 mock 피드에 등록됐어요.');
    navigate(`/community/${nextPost.id}`);
  };

  return (
    <WebShell
      title="게시글 작성"
      subtitle="러닝 기록, 사진, 해시태그를 넣어 게시글을 작성합니다."
      action={<PrimaryButton onClick={publishPost}>게시하기</PrimaryButton>}
    >
      <div className={styles.twoColumn}>
        <Card title="새 게시글">
          <div className={styles.formGrid}>
            <label>
              제목
              <input value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label>
              내용
              <textarea value={body} onChange={(event) => setBody(event.target.value)} />
            </label>
            <label>
              해시태그
              <input
                value={hashtagInput}
                onChange={(event) => setHashtagInput(event.target.value)}
                placeholder="#한강러닝 #야간런"
              />
            </label>
            <label>
              첨부 기록
              <select
                value={attachedRunId}
                onChange={(event) => setAttachedRunId(event.target.value)}
              >
                {runRecords.map((record) => (
                  <option key={record.id} value={record.id}>
                    {record.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <small>{body.length}/500</small>
          <div className={styles.tabList} role="tablist" aria-label="게시글 카테고리">
            {postCategories.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={category === item}
                className={`${styles.tabButton} ${category === item ? styles.tabButtonActive : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          {status && <p className={styles.statusMessage}>{status}</p>}
          <RunListItem record={attachedRun} />
        </Card>
        <Card title="미리보기">
          <PostListItem post={previewPost} />
          <Card title="@ 자동완성">
            <p>@runner_mingi 민지</p>
            <p>@hangang_su 수현</p>
          </Card>
        </Card>
      </div>
    </WebShell>
  );
}

export function CommunityListPage() {
  const [webPosts] = useWebPosts();
  const [selectedCategory, setSelectedCategory] = useState<'전체' | PostCategory>('전체');
  const [sortMode, setSortMode] = useState<'latest' | 'popular'>('latest');
  const categoryCounts = postCategories.map((category) => ({
    category,
    count: webPosts.filter((post) => post.category === category).length,
  }));
  const filteredPosts = webPosts
    .filter((post) => selectedCategory === '전체' || post.category === selectedCategory)
    .sort((left, right) =>
      sortMode === 'popular'
        ? right.likeCount + right.commentCount - (left.likeCount + left.commentCount)
        : 0,
    );

  return (
    <WebShell
      title="커뮤니티"
      subtitle="러너들의 기록, 코스, 질문과 후기를 한곳에서 둘러봅니다."
      action={<PrimaryLink to="/community/new">피드 글쓰기</PrimaryLink>}
    >
      <section className={styles.communityHero}>
        <div>
          <Chip>전체 피드</Chip>
          <h2>오늘 올라온 러닝 이야기</h2>
          <p>기록을 붙인 후기부터 코스 공유까지, 관심 있는 글을 눌러 자세히 확인해요.</p>
        </div>
        <div className={styles.communityHeroStats}>
          <span>
            <strong>{webPosts.length}</strong>
            게시글
          </span>
          <span>
            <strong>{webPosts.reduce((sum, post) => sum + post.commentCount, 0)}</strong>
            댓글
          </span>
          <span>
            <strong>{webPosts.reduce((sum, post) => sum + post.likeCount, 0)}</strong>
            좋아요
          </span>
        </div>
      </section>
      <div className={styles.twoColumn}>
        <Card>
          <div className={styles.panelHeader}>
            <h2>전체 글</h2>
            <div className={styles.tabList} role="tablist" aria-label="게시글 정렬">
              {[
                ['latest', '최신순'],
                ['popular', '인기순'],
              ].map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  role="tab"
                  aria-selected={sortMode === mode}
                  className={`${styles.tabButton} ${
                    sortMode === mode ? styles.tabButtonActive : ''
                  }`}
                  onClick={() => setSortMode(mode as typeof sortMode)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.tabs}>
            {(['전체', ...postCategories] as Array<'전체' | PostCategory>).map((item) => (
              <button
                key={item}
                type="button"
                className={`${styles.filterButton} ${
                  selectedCategory === item ? styles.filterButtonActive : ''
                }`}
                aria-pressed={selectedCategory === item}
                onClick={() => setSelectedCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => <PostListItem key={post.id} post={post} />)
          ) : (
            <div className={styles.emptyInline}>조건에 맞는 글이 없어요.</div>
          )}
        </Card>
        <div className={styles.sideStack}>
          <Card title="카테고리">
            <div className={styles.categoryList}>
              {categoryCounts.map((item) => (
                <button
                  key={item.category}
                  type="button"
                  className={styles.categoryButton}
                  onClick={() => setSelectedCategory(item.category)}
                >
                  <strong>{item.category}</strong>
                  <small>{item.count}개 글</small>
                </button>
              ))}
            </div>
          </Card>
          <Card title="인기 해시태그">
            <div className={styles.tabs}>
              <SecondaryLink to="/tags/한강러닝">#한강러닝</SecondaryLink>
              <SecondaryLink to="/tags/야간런">#야간런</SecondaryLink>
              <SecondaryLink to="/tags/코스공유">#코스공유</SecondaryLink>
            </div>
          </Card>
          <Card title="활발한 크루">
            {crews.map((crew) => (
              <Link key={crew.id} to={`/crews/${crew.id}`} className={styles.compactCrewItem}>
                <span className={styles.crewAvatar} aria-hidden="true">
                  {crew.name.slice(0, 1)}
                </span>
                <span>
                  <strong>{crew.name}</strong>
                  <small>
                    {crew.memberCount}명 · {crew.activityTime}
                  </small>
                </span>
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </WebShell>
  );
}

export function PostDetailPage() {
  const { postId } = useParams();
  const [webPosts, setWebPosts] = useWebPosts();
  const post = webPosts.find((item) => item.id === postId) ?? getPost(postId);
  const [commentText, setCommentText] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const run = post.attachedRunId ? getRunRecord(post.attachedRunId) : null;

  const updatePost = (nextPost: Post) => {
    setWebPosts((currentPosts) =>
      currentPosts.map((item) => (item.id === nextPost.id ? nextPost : item)),
    );
  };

  const toggleLike = () => {
    const nextLiked = !hasLiked;
    setHasLiked(nextLiked);
    updatePost({ ...post, likeCount: Math.max(0, post.likeCount + (nextLiked ? 1 : -1)) });
  };

  const addComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    updatePost({
      ...post,
      comments: [trimmed, ...post.comments],
      commentCount: post.commentCount + 1,
    });
    setCommentText('');
  };

  const sharePost = () => {
    updatePost({ ...post, shareCount: post.shareCount + 1 });
    setShareStatus('공유 카운트가 mock으로 반영됐어요.');
  };

  return (
    <WebShell
      title="게시글 상세"
      subtitle="게시글 내용, 좋아요, 댓글, 공유를 확인합니다."
      action={<SecondaryLink to="/community/new">피드 글쓰기</SecondaryLink>}
    >
      <div className={styles.twoColumn}>
        <Card className={styles.postDetailCard}>
          <div className={styles.postDetailAuthor}>
            <span className={styles.postAvatar} aria-hidden="true">
              {post.author.slice(0, 1)}
            </span>
            <span>
              <strong>{post.author}</strong>
              <small>
                {post.crew} · {post.timeAgo}
              </small>
            </span>
          </div>
          <h2>{post.title}</h2>
          <div className={styles.tabs}>
            <Chip>{post.category}</Chip>
            {post.hashtags.map((tag) => (
              <Chip key={tag} tone="slate">
                {tag}
              </Chip>
            ))}
          </div>
          <p className={styles.postDetailBody}>{post.body}</p>
          {run && <RunListItem record={run} />}
          <p className={styles.postDetailMetrics}>
            <button type="button" onClick={toggleLike}>
              좋아요 {post.likeCount}
            </button>
            <strong>댓글 {post.commentCount}</strong>
            <button type="button" onClick={sharePost}>
              공유 {post.shareCount}
            </button>
          </p>
          {shareStatus && <p className={styles.statusMessage}>{shareStatus}</p>}
          <div className={styles.inlineForm}>
            <input
              aria-label="댓글 입력"
              placeholder="댓글을 입력하세요"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addComment();
              }}
            />
            <PrimaryButton onClick={addComment}>등록</PrimaryButton>
          </div>
          <div className={styles.commentList}>
            {post.comments.length > 0 ? (
              post.comments.map((comment) => <p key={comment}>{comment}</p>)
            ) : (
              <div className={styles.emptyInline}>첫 댓글을 남겨보세요.</div>
            )}
          </div>
        </Card>
        <Card title="같은 크루 글">
          {webPosts
            .filter((item) => item.id !== post.id)
            .map((item) => (
              <PostListItem key={item.id} post={item} />
            ))}
        </Card>
      </div>
    </WebShell>
  );
}

export function CrewSearchPage() {
  const [webCrews] = useWebCrews();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<CrewFilters>({
    area: '전체',
    pace: '전체',
    time: '전체',
    level: '전체',
  });

  const normalizedQuery = query.trim().toLowerCase();
  const filteredCrews = webCrews.filter((crew) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [crew.name, crew.area, crew.description].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );
    const matchesArea = filters.area === '전체' || crew.area.includes(filters.area);
    const matchesPace = filters.pace === '전체' || crew.averagePace === filters.pace;
    const matchesTime = filters.time === '전체' || crew.activityTime === filters.time;
    const matchesLevel = filters.level === '전체' || crew.level === filters.level;

    return matchesQuery && matchesArea && matchesPace && matchesTime && matchesLevel;
  });

  const updateFilter = (key: CrewFilterKey, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <WebShell
      title="크루 찾기"
      subtitle="지역, 페이스, 시간대로 크루를 탐색합니다."
      action={<SecondaryLink to="/crews/hangang-crew">크루 만들기</SecondaryLink>}
    >
      <Card className={styles.crewSearchPanel}>
        <label className={styles.crewSearchField}>
          <span>크루 검색</span>
          <input
            aria-label="크루 검색"
            placeholder="크루 이름이나 지역으로 검색"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className={styles.crewFilterGrid}>
          {crewFilterGroups.map((group) => (
            <div key={group.key} className={styles.crewFilterGroup}>
              <strong>{group.label}</strong>
              <div role="group" aria-label={`${group.label} 필터`}>
                {group.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`${styles.filterButton} ${
                      filters[group.key] === option ? styles.filterButtonActive : ''
                    }`}
                    aria-pressed={filters[group.key] === option}
                    onClick={() => updateFilter(group.key, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className={styles.filterSummary}>
          {filteredCrews.length}개 크루가 조건에 맞아요
          {query.trim() && ` · 검색어 "${query.trim()}"`}
        </p>
      </Card>
      {filteredCrews.length > 0 ? (
        <div className={styles.crewGrid}>
          {filteredCrews.map((crew) => {
            const nextRecruit = crew.recruits[0];

            return (
              <Link key={crew.id} to={`/crews/${crew.id}`} className={styles.crewCard}>
                <span className={styles.crewCardHeader}>
                  <span className={styles.crewAvatar} aria-hidden="true">
                    {crew.name.slice(0, 1)}
                  </span>
                  <span>
                    <strong>{crew.name}</strong>
                    <small>{crew.area}</small>
                  </span>
                </span>
                <span className={styles.crewDescription}>{crew.description}</span>
                <span className={styles.crewMetaGrid}>
                  <span>
                    <strong>{crew.memberCount}명</strong>
                    멤버
                  </span>
                  <span>
                    <strong>{crew.averagePace}</strong>
                    평균 페이스
                  </span>
                  <span>
                    <strong>{crew.activityTime}</strong>
                    활동 시간
                  </span>
                </span>
                <span className={styles.crewRecruitHint}>
                  {nextRecruit ? (
                    <>
                      <Chip tone={getRecruitTone(nextRecruit.type)}>{nextRecruit.type}</Chip>
                      <span>
                        <strong>{nextRecruit.title}</strong>
                        <small>
                          {nextRecruit.schedule} · {nextRecruit.participants}
                        </small>
                      </span>
                    </>
                  ) : (
                    <>
                      <Chip tone="slate">모집 없음</Chip>
                      <span>
                        <strong>새 모집글을 기다리는 중</strong>
                        <small>크루 상세에서 멤버와 소개를 확인할 수 있어요</small>
                      </span>
                    </>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card className={styles.emptyCard}>
          <strong>조건에 맞는 크루가 없어요</strong>
          <small>검색어를 줄이거나 필터를 전체로 바꿔보세요.</small>
        </Card>
      )}
    </WebShell>
  );
}

export function CrewDetailPage() {
  const { crewId } = useParams();
  const [webCrews] = useWebCrews();
  const crew = getWebCrew(webCrews, crewId);
  const [activeTab, setActiveTab] = useState<'모집글' | '멤버' | '소개'>('모집글');
  return (
    <WebShell
      title="크루 상세"
      subtitle="크루 소개, 멤버, 모집글을 확인합니다."
      action={<PrimaryLink to={`/crews/${crew.id}/recruits/new`}>모집글 만들기</PrimaryLink>}
    >
      <Card className={styles.detailHero}>
        <div>
          <h2>{crew.name}</h2>
          <p>{crew.description}</p>
          <div className={styles.tabs}>
            <Chip>멤버 {crew.memberCount}</Chip>
            <Chip tone="slate">평균 {crew.averagePace}</Chip>
            <Chip tone="slate">{crew.activityTime}</Chip>
          </div>
          <div className={styles.tabList} role="tablist" aria-label="크루 상세 탭">
            {(['모집글', '멤버', '소개'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={`${styles.tabButton} ${activeTab === tab ? styles.tabButtonActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </Card>
      {activeTab === '모집글' && (
        <Card title="모집글">
          {crew.recruits.length > 0 ? (
            crew.recruits.map((recruit) => (
              <RecruitItem key={recruit.id} recruit={recruit} crewId={crew.id} />
            ))
          ) : (
            <div className={styles.emptyInline}>아직 열린 모집글이 없어요.</div>
          )}
        </Card>
      )}
      {activeTab === '멤버' && (
        <Card title="멤버">
          {crew.members.map((member) => (
            <div key={member} className={styles.listItem}>
              <strong>{member}</strong>
              <small>크루 멤버</small>
            </div>
          ))}
        </Card>
      )}
      {activeTab === '소개' && (
        <Card title="크루 소개">
          <p>{crew.description}</p>
          <div className={styles.crewMetaGrid}>
            <span>
              <strong>{crew.area}</strong>
              활동 지역
            </span>
            <span>
              <strong>{crew.activityTime}</strong>
              활동 시간
            </span>
            <span>
              <strong>{crew.level}</strong>
              레벨
            </span>
          </div>
        </Card>
      )}
    </WebShell>
  );
}

export function RecruitComposePage() {
  const { settings, t } = useWebDisplay();
  const { crewId } = useParams();
  const [webCrews, setWebCrews] = useWebCrews();
  const crew = getWebCrew(webCrews, crewId);
  const [title, setTitle] = useState('내일 오후 7시 한강 정모');
  const [schedule, setSchedule] = useState('2026.05.01 금 19:00');
  const [place, setPlace] = useState('여의도공원');
  const [pace, setPace] = useState("6'00 페이스");
  const [participants, setParticipants] = useState('20명');
  const [distance, setDistance] = useState('8km');
  const [description, setDescription] = useState(
    '편하게 달릴 수 있는 분 환영해요. 집결 후 가벼운 스트레칭을 하고 함께 달립니다.',
  );
  const [type, setType] = useState<RecruitType>('정기런');
  const [shouldNotify, setShouldNotify] = useState(true);
  const [status, setStatus] = useState('');
  const canPublish =
    title.trim().length > 0 &&
    schedule.trim().length > 0 &&
    place.trim().length > 0 &&
    participants.trim().length > 0;

  const publishRecruit = () => {
    if (!canPublish) {
      setStatus('제목, 일정, 장소, 인원은 꼭 입력해주세요.');
      return;
    }

    const nextRecruit: Recruit = {
      id: `recruit-${Date.now()}`,
      type,
      title: title.trim(),
      schedule: schedule.trim(),
      place: place.trim(),
      distance: distance.trim() || '거리 미정',
      pace: pace.trim() || '페이스 미정',
      participants: participants.trim(),
      description: description.trim() || '상세 설명이 아직 없어요.',
    };

    setWebCrews((current) =>
      current.map((item) =>
        item.id === crew.id ? { ...item, recruits: [nextRecruit, ...item.recruits] } : item,
      ),
    );
    setStatus(`${crew.name}에 모집글이 등록됐어요. 크루 상세에서 바로 확인할 수 있습니다.`);
  };

  return (
    <WebShell
      title="모집글 작성"
      subtitle="일정, 장소, 페이스, 인원, 모임 유형과 푸시 알림 여부를 설정합니다."
      action={
        <PrimaryButton onClick={publishRecruit} disabled={!canPublish}>
          게시하기
        </PrimaryButton>
      }
    >
      <div className={styles.twoColumn}>
        <Card title="모집 정보">
          <div className={styles.formGrid}>
            <label>
              크루
              <input value={crew.name} readOnly />
            </label>
            <label>
              제목
              <input value={title} onChange={(event) => setTitle(event.target.value)} />
            </label>
            <label>
              일정
              <input value={schedule} onChange={(event) => setSchedule(event.target.value)} />
            </label>
            <label>
              장소
              <input value={place} onChange={(event) => setPlace(event.target.value)} />
            </label>
            <label>
              페이스
              <input value={pace} onChange={(event) => setPace(event.target.value)} />
            </label>
            <label>
              인원
              <input
                value={participants}
                onChange={(event) => setParticipants(event.target.value)}
              />
            </label>
            <label>
              거리
              <input value={distance} onChange={(event) => setDistance(event.target.value)} />
            </label>
          </div>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          <small>{description.length}/300</small>
          <div className={styles.tabList} role="tablist" aria-label="모집 유형">
            {recruitTypes.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={type === item}
                className={`${styles.tabButton} ${type === item ? styles.tabButtonActive : ''}`}
                onClick={() => setType(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={shouldNotify}
              onChange={(event) => setShouldNotify(event.target.checked)}
            />{' '}
            크루 멤버에게 푸시 알림 보내기
          </label>
          {status && <p className={styles.statusMessage}>{status}</p>}
        </Card>
        <Card title="모집글 미리보기">
          <div className={styles.recruitCard}>
            <span className={styles.recruitDate}>
              <strong>{schedule.split(' ')[1] ?? '일정'}</strong>
              <small>{schedule.split(' ')[2] ?? ''}</small>
            </span>
            <span className={styles.recruitContent}>
              <span className={styles.recruitChips}>
                <Chip tone={getRecruitTone(type)}>{type}</Chip>
                <Chip tone="slate">{displayDistanceText(distance, settings)}</Chip>
              </span>
              <strong>{title || '제목을 입력하세요'}</strong>
              <small>
                {place} · {pace} · {shouldNotify ? t('푸시 알림 전송') : t('푸시 알림 없음')}
              </small>
            </span>
            <span className={styles.recruitStatus}>
              <strong>{participants}</strong>
              <small>{t('모집 인원')}</small>
            </span>
          </div>
          <p>{description}</p>
        </Card>
      </div>
    </WebShell>
  );
}

export function RecruitDetailPage() {
  const { settings } = useWebDisplay();
  const { crewId, recruitId } = useParams();
  const [webCrews] = useWebCrews();
  const { crew, recruit } = getWebRecruit(webCrews, crewId, recruitId);
  const [isJoined, setIsJoined] = useState(false);
  const participantText = useMemo(() => {
    if (!isJoined) return recruit.participants;
    return recruit.participants.replace(/^(\d+)/, (value) => String(Number(value) + 1));
  }, [isJoined, recruit.participants]);

  return (
    <WebShell
      title="모집글 상세"
      subtitle="모집글 정보와 참여 상태를 확인합니다."
      action={
        <PrimaryButton onClick={() => setIsJoined((current) => !current)}>
          {isJoined ? '참여 취소' : '참여하기'}
        </PrimaryButton>
      }
    >
      <Card className={styles.detailHero}>
        <div>
          <Chip tone="green">{recruit.type}</Chip>
          <h2>{recruit.title}</h2>
          <p>{crew.name}</p>
          <div className={styles.tabs}>
            <Chip tone="slate">{recruit.schedule}</Chip>
            <Chip tone="slate">{recruit.place}</Chip>
            <Chip tone="slate">{displayDistanceText(recruit.distance, settings)}</Chip>
            <Chip tone="slate">{recruit.pace}</Chip>
            <Chip tone="slate">{participantText}</Chip>
          </div>
        </div>
      </Card>
      <div className={styles.twoColumn}>
        <Card title="상세 설명">
          <p>{recruit.description}</p>
        </Card>
        <Card title="참여 러너">
          {isJoined && (
            <div className={styles.listItem}>
              <strong>{profile.nickname}</strong>
              <small>참여 완료</small>
            </div>
          )}
          {crew.members.map((member) => (
            <p key={member}>{member}</p>
          ))}
        </Card>
      </div>
    </WebShell>
  );
}

export function ProfilePage() {
  const { settings, t } = useWebDisplay();
  const [webProfile] = useWebProfile();
  return (
    <WebShell
      title="프로필 · 계정"
      subtitle="공개 프로필, 크루, 뱃지와 공개 범위를 한 화면에서 정리합니다."
    >
      <section className={styles.profileHero}>
        <div className={styles.profileHeroAvatar} aria-hidden="true">
          JM
        </div>
        <div className={styles.profileHeroContent}>
          <h2>{webProfile.nickname}</h2>
          <p>{webProfile.bio}</p>
          <Link to="/followers" className={styles.inlineLink}>
            {t('팔로워')} {webProfile.followerCount} · {t('팔로잉')} {webProfile.followingCount}
          </Link>
          <div className={styles.profileHeroStats}>
            <span>
              <strong>{displayDistanceText(webProfile.totalDistance, settings)}</strong>
              {t('누적 거리')}
            </span>
            <span>
              <strong>{webProfile.runCount}</strong>
              {t('러닝')}
            </span>
            <span>
              <strong>{webProfile.averagePace}</strong>
              {t('평균 페이스')}
            </span>
            <span>
              <strong>{webProfile.badgeCount}</strong>
              {t('뱃지')}
            </span>
          </div>
        </div>
        <Link to="/profile/edit" className={styles.profileHeroAction}>
          프로필 편집
        </Link>
      </section>
      <div className={styles.twoColumn}>
        <Card title="공개 범위">
          <div className={styles.privacyList}>
            {privacyOptions.map((option) => (
              <span
                key={option.value}
                className={`${styles.privacyItem} ${
                  webProfile.privacy === option.value ? styles.privacyItemActive : ''
                }`}
              >
                <strong>{option.label}</strong>
                {option.description}
              </span>
            ))}
          </div>
        </Card>
        <Card title="내 크루">
          {crews.map((crew) => (
            <Link key={crew.id} to={`/crews/${crew.id}`} className={styles.listItem}>
              <strong>{crew.name}</strong>
              <small>{crew.area}</small>
            </Link>
          ))}
        </Card>
      </div>
      <Card title="계정 설정">
        <div className={styles.goalManagement}>
          <span>
            <strong>{t('설정에서 계정을 관리할 수 있어요')}</strong>
            {t('알림, 측정 단위, 언어, 데이터 다운로드, 로그아웃과 회원탈퇴를 설정합니다.')}
          </span>
          <PrimaryLink to="/settings">설정 열기</PrimaryLink>
        </div>
      </Card>
    </WebShell>
  );
}

export function ProfileEditPage() {
  const [webProfile, setWebProfile] = useWebProfile();
  const [nickname, setNickname] = useState(webProfile.nickname);
  const [bio, setBio] = useState(webProfile.bio);
  const [privacy, setPrivacy] = useState<PrivacyScope>(webProfile.privacy);
  const [status, setStatus] = useState('');
  const saveProfile = () => {
    setWebProfile({ ...webProfile, nickname, bio, privacy });
    setStatus('프로필이 mock 데이터에 저장됐어요.');
  };

  return (
    <WebShell
      title="프로필 편집"
      subtitle="닉네임, 이미지, 소개, 공개 범위를 수정합니다."
      action={
        <>
          <SecondaryLink to="/profile">프로필 보기</SecondaryLink>
          <PrimaryButton onClick={saveProfile}>저장하기</PrimaryButton>
        </>
      }
    >
      <div className={styles.twoColumn}>
        <Card title="프로필 정보">
          <div className={styles.formGrid}>
            <label>
              닉네임
              <input value={nickname} onChange={(event) => setNickname(event.target.value)} />
            </label>
            <label>
              한 줄 소개
              <input value={bio} onChange={(event) => setBio(event.target.value)} />
            </label>
          </div>
          <div className={styles.tabList} role="tablist" aria-label="프로필 공개 범위">
            {privacyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={privacy === option.value}
                className={`${styles.tabButton} ${
                  privacy === option.value ? styles.tabButtonActive : ''
                }`}
                onClick={() => setPrivacy(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {status && <p className={styles.statusMessage}>{status}</p>}
        </Card>
        <Card title="프로필 미리보기">
          <h2>{nickname || '닉네임'}</h2>
          <p>{bio || '한 줄 소개를 입력하세요.'}</p>
          <Chip>
            {privacyOptions.find((option) => option.value === privacy)?.label ?? '전체 공개'}
          </Chip>
        </Card>
      </div>
    </WebShell>
  );
}

export function SettingsPage() {
  const { settings, setSettings, t, distance } = useWebDisplay();
  const [webProfile, setWebProfile] = useWebProfile();
  const [activePanel, setActivePanel] = useState<
    | 'privacy'
    | 'notifications'
    | 'display'
    | 'blocked'
    | 'download'
    | 'version'
    | 'logout'
    | 'delete'
  >('privacy');
  const [status, setStatus] = useState('');
  const [blockedUsers, setBlockedUsers] = useStoredState('dallyrun-web-blocked-users', [
    '광고 계정',
    '스팸 러너',
  ]);
  const [blockedInput, setBlockedInput] = useState('');
  const [downloadOptions, setDownloadOptions] = useState({
    records: true,
    posts: true,
    profile: true,
    format: 'JSON',
  });
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const notificationSettingItems: Array<{
    key: 'notificationSocial' | 'notificationCrew' | 'notificationBadge';
    label: string;
    description: string;
  }> = [
    { key: 'notificationSocial', label: '소셜 알림', description: '좋아요, 댓글, 팔로우 알림' },
    { key: 'notificationCrew', label: '크루 알림', description: '모집글과 일정 변경 알림' },
    { key: 'notificationBadge', label: '뱃지 알림', description: '새 뱃지 획득 알림' },
  ];
  const downloadSettingItems: Array<{
    key: 'records' | 'posts' | 'profile';
    label: string;
    description: string;
  }> = [
    { key: 'records', label: '러닝 기록', description: '거리, 시간, 페이스, 메모' },
    { key: 'posts', label: '커뮤니티 활동', description: '게시글, 댓글, 좋아요' },
    { key: 'profile', label: '프로필 정보', description: '닉네임, 소개, 공개 범위' },
  ];
  const settingMenuItems: Array<{
    key: typeof activePanel;
    label: string;
    description: string;
  }> = [
    { key: 'privacy', label: '공개 범위', description: '프로필과 기록 공개 대상을 설정' },
    { key: 'notifications', label: '알림', description: '소셜, 크루, 뱃지 알림 관리' },
    { key: 'display', label: '표시 설정', description: '측정 단위와 언어 변경' },
    { key: 'blocked', label: '차단한 사용자', description: '차단 목록 추가와 해제' },
    { key: 'download', label: '데이터 다운로드', description: '내 데이터 내보내기 옵션' },
    { key: 'version', label: '버전/정보', description: '서비스 버전과 정책 정보' },
    { key: 'logout', label: '로그아웃', description: '현재 브라우저 세션 종료' },
    { key: 'delete', label: '회원탈퇴', description: '계정 삭제 전 확인' },
  ];

  const openPanel = (panel: typeof activePanel) => {
    setActivePanel(panel);
    setStatus('');
  };

  const addBlockedUser = () => {
    const nextName = blockedInput.trim();
    if (!nextName || blockedUsers.includes(nextName)) return;
    setBlockedUsers([...blockedUsers, nextName]);
    setBlockedInput('');
    setStatus(`${nextName}님을 차단 목록에 추가했어요.`);
  };

  const downloadCount = Object.values(downloadOptions).filter((value) => value === true).length;

  return (
    <WebShell title="설정" subtitle="공개 범위, 알림, 단위, 언어, 데이터와 계정을 관리합니다.">
      <div className={styles.twoColumn}>
        <Card title="설정 메뉴">
          <div className={styles.settingsMenu}>
            {settingMenuItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`${styles.settingsMenuButton} ${
                  activePanel === item.key ? styles.settingsMenuButtonActive : ''
                }`}
                onClick={() => openPanel(item.key)}
              >
                <strong>{t(item.label)}</strong>
                <span>{t(item.description)}</span>
              </button>
            ))}
          </div>
        </Card>
        <Card title="상세 설정" className={styles.settingsDetailCard}>
          {activePanel === 'privacy' && (
            <div className={styles.settingsPanel}>
              <h3>{t('공개 범위 설정')}</h3>
              <p>{t('프로필, 누적 통계, 러닝 기록이 누구에게 보일지 선택합니다.')}</p>
              <div className={styles.settingsSegment}>
                {privacyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.settingChoice} ${
                      webProfile.privacy === option.value ? styles.settingChoiceActive : ''
                    }`}
                    onClick={() => {
                      setWebProfile({ ...webProfile, privacy: option.value });
                      setStatus(`${t(option.label)}${t('로 공개 범위를 변경했어요.')}`);
                    }}
                  >
                    <strong>{t(option.label)}</strong>
                    <span>{t(option.description)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activePanel === 'notifications' && (
            <div className={styles.settingsPanel}>
              <h3>{t('알림 설정')}</h3>
              <p>{t('필요한 알림만 남겨두면 대시보드와 알림 페이지가 덜 번잡해집니다.')}</p>
              <div className={styles.toggleList}>
                {notificationSettingItems.map(({ key, label, description }) => (
                  <label key={key} className={styles.settingToggle}>
                    <span>
                      <strong>{t(label)}</strong>
                      <small>{t(description)}</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={(event) =>
                        setSettings({ ...settings, [key]: event.target.checked })
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activePanel === 'display' && (
            <div className={styles.settingsPanel}>
              <h3>{t('표시 설정')}</h3>
              <p>{t('러닝 거리와 화면 언어 표기를 현재 사용 습관에 맞춥니다.')}</p>
              <div className={styles.formGrid}>
                <label>
                  {t('측정 단위')}
                  <select
                    value={settings.unit}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        unit: event.target.value === 'mile' ? 'mile' : 'km',
                      })
                    }
                  >
                    <option value="km">km</option>
                    <option value="mile">mile</option>
                  </select>
                </label>
                <label>
                  {t('언어')}
                  <select
                    value={settings.language}
                    onChange={(event) =>
                      setSettings({
                        ...settings,
                        language: event.target.value === 'en' ? 'en' : 'ko',
                      })
                    }
                  >
                    <option value="ko">{t('한국어')}</option>
                    <option value="en">English</option>
                  </select>
                </label>
              </div>
              <div className={styles.settingsPreview}>
                <strong>{t('미리보기')}</strong>
                <span>
                  {settings.language === 'en' ? 'English' : t('한국어')} · {distance(8.2)} ·{' '}
                  {t('평균 페이스')} 5'23&quot;
                </span>
              </div>
            </div>
          )}

          {activePanel === 'blocked' && (
            <div className={styles.settingsPanel}>
              <h3>차단한 사용자 관리</h3>
              <p>차단한 사용자는 내 게시글과 프로필 활동에서 숨겨집니다.</p>
              <div className={styles.inlineForm}>
                <input
                  aria-label="차단할 닉네임"
                  placeholder="닉네임 입력"
                  value={blockedInput}
                  onChange={(event) => setBlockedInput(event.target.value)}
                />
                <PrimaryButton onClick={addBlockedUser}>차단 추가</PrimaryButton>
              </div>
              <div className={styles.mockList}>
                {blockedUsers.length > 0 ? (
                  blockedUsers.map((name) => (
                    <div key={name} className={styles.listItem}>
                      <span>
                        <strong>{name}</strong>
                        <small>차단됨</small>
                      </span>
                      <SecondaryButton
                        onClick={() => {
                          setBlockedUsers(blockedUsers.filter((item) => item !== name));
                          setStatus(`${name}님 차단을 해제했어요.`);
                        }}
                      >
                        차단 해제
                      </SecondaryButton>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyInline}>차단한 사용자가 없어요.</div>
                )}
              </div>
            </div>
          )}

          {activePanel === 'download' && (
            <div className={styles.settingsPanel}>
              <h3>데이터 다운로드 옵션</h3>
              <p>내 러닝 기록과 커뮤니티 활동 데이터를 선택해서 내보냅니다.</p>
              <div className={styles.toggleList}>
                {downloadSettingItems.map(({ key, label, description }) => (
                  <label key={key} className={styles.settingToggle}>
                    <span>
                      <strong>{label}</strong>
                      <small>{description}</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={downloadOptions[key]}
                      onChange={(event) =>
                        setDownloadOptions({ ...downloadOptions, [key]: event.target.checked })
                      }
                    />
                  </label>
                ))}
              </div>
              <label className={styles.compactSearch}>
                파일 형식
                <select
                  value={downloadOptions.format}
                  onChange={(event) =>
                    setDownloadOptions({ ...downloadOptions, format: event.target.value })
                  }
                >
                  <option>JSON</option>
                  <option>CSV</option>
                </select>
              </label>
              <PrimaryButton
                onClick={() =>
                  setStatus(
                    `${downloadOptions.format} 형식으로 ${downloadCount}개 데이터 묶음을 준비했어요.`,
                  )
                }
              >
                다운로드 준비
              </PrimaryButton>
            </div>
          )}

          {activePanel === 'version' && (
            <div className={styles.settingsPanel}>
              <h3>버전과 서비스 정보</h3>
              <div className={styles.settingsPreview}>
                <strong>Dallyrun Web 1.0.0</strong>
                <span>마지막 업데이트 2026.05.02 · mock 프론트엔드 빌드</span>
              </div>
              <div className={styles.actions}>
                <SecondaryButton onClick={() => setStatus('이용약관 mock 문서를 열었어요.')}>
                  이용약관
                </SecondaryButton>
                <SecondaryButton
                  onClick={() => setStatus('개인정보 처리방침 mock 문서를 열었어요.')}
                >
                  개인정보 처리방침
                </SecondaryButton>
              </div>
            </div>
          )}

          {activePanel === 'logout' && (
            <div className={styles.settingsPanel}>
              <h3>로그아웃</h3>
              <p>이 브라우저의 mock 세션만 종료합니다. 저장된 디자인 데이터는 유지됩니다.</p>
              <PrimaryButton onClick={() => setStatus('mock 세션을 로그아웃 처리했어요.')}>
                현재 브라우저에서 로그아웃
              </PrimaryButton>
            </div>
          )}

          {activePanel === 'delete' && (
            <div className={styles.settingsPanel}>
              <h3>회원탈퇴 확인</h3>
              <p>실제 API 연결 전까지는 삭제하지 않고 확인 흐름만 표시합니다.</p>
              <label className={styles.compactSearch}>
                확인 문구
                <input
                  aria-label="회원탈퇴 확인 문구"
                  placeholder="탈퇴 입력"
                  value={deleteConfirm}
                  onChange={(event) => setDeleteConfirm(event.target.value)}
                />
              </label>
              <PrimaryButton
                onClick={() => setStatus('회원탈퇴 mock 확인이 완료됐어요.')}
                disabled={deleteConfirm !== '탈퇴'}
              >
                회원탈퇴 확인
              </PrimaryButton>
            </div>
          )}

          {status && <p className={styles.statusMessage}>{status}</p>}
        </Card>
      </div>
    </WebShell>
  );
}

export function FollowersPage() {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [query, setQuery] = useState('');
  const [followedUsers, setFollowedUsers] = useState<string[]>(following);
  const sourceUsers = activeTab === 'followers' ? followers : followedUsers;
  const filteredUsers = sourceUsers.filter((name) =>
    name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const toggleFollow = (name: string) => {
    setFollowedUsers((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
  };

  return (
    <WebShell
      title="팔로워와 팔로잉"
      subtitle="탭으로 팔로워와 팔로잉을 분리해 검색하고 관리합니다."
    >
      <Card>
        <div className={styles.panelHeader}>
          <div className={styles.tabList} role="tablist" aria-label="팔로워 탭">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'followers'}
              className={`${styles.tabButton} ${
                activeTab === 'followers' ? styles.tabButtonActive : ''
              }`}
              onClick={() => setActiveTab('followers')}
            >
              팔로워 {profile.followerCount}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'following'}
              className={`${styles.tabButton} ${
                activeTab === 'following' ? styles.tabButtonActive : ''
              }`}
              onClick={() => setActiveTab('following')}
            >
              팔로잉 {followedUsers.length}
            </button>
          </div>
          <label className={styles.compactSearch}>
            <span>검색</span>
            <input
              aria-label="사용자 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="닉네임 검색"
            />
          </label>
        </div>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((name) => (
            <div key={name} className={styles.listItem}>
              <span>
                <strong>{name}</strong>
                <small>{activeTab === 'followers' ? '팔로워 · 서울' : '팔로잉 중 · 한강'}</small>
              </span>
              <button
                type="button"
                className={`${styles.filterButton} ${
                  followedUsers.includes(name) ? styles.filterButtonActive : ''
                }`}
                onClick={() => toggleFollow(name)}
              >
                {followedUsers.includes(name) ? '팔로잉' : '팔로우'}
              </button>
            </div>
          ))
        ) : (
          <div className={styles.emptyInline}>검색 결과가 없어요.</div>
        )}
      </Card>
    </WebShell>
  );
}

export function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<NotificationCategory>('전체');
  const [readIds, setReadIds] = useState<string[]>([]);
  const filteredNotifications =
    activeFilter === '전체'
      ? notifications
      : notifications.filter((item) => item.category === activeFilter);

  return (
    <WebShell
      title="알림"
      subtitle="최근 알림 전체를 확인합니다. 카테고리별로 빠르게 좁혀볼 수 있습니다."
      action={
        <SecondaryButton onClick={() => setReadIds(notifications.map((item) => item.id))}>
          모두 읽음
        </SecondaryButton>
      }
    >
      <div className={styles.tabList} role="tablist" aria-label="알림 필터">
        {notificationFilters.map((label) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={activeFilter === label}
            className={`${styles.tabButton} ${activeFilter === label ? styles.tabButtonActive : ''}`}
            onClick={() => setActiveFilter(label)}
          >
            {label}
          </button>
        ))}
      </div>
      <Card>
        {filteredNotifications.map((item: NotificationItem) => (
          <div key={item.id} className={styles.listItem}>
            <Chip
              tone={
                item.category === '뱃지' ? 'amber' : item.category === '크루' ? 'green' : 'blue'
              }
            >
              {item.category}
            </Chip>
            <span>
              <strong>{item.title}</strong>
              <small>{item.body}</small>
            </span>
            <button
              type="button"
              className={styles.filterButton}
              onClick={() =>
                setReadIds((current) =>
                  current.includes(item.id)
                    ? current.filter((id) => id !== item.id)
                    : [...current, item.id],
                )
              }
            >
              {readIds.includes(item.id) ? '읽음' : item.timeAgo}
            </button>
          </div>
        ))}
        {filteredNotifications.length === 0 && (
          <div className={styles.emptyInline}>이 카테고리에는 알림이 없어요.</div>
        )}
      </Card>
    </WebShell>
  );
}

export function HashtagPage() {
  const { tag } = useParams();
  const [webPosts] = useWebPosts();
  const tagLabel = `#${tag ?? '한강러닝'}`;
  const relatedTags = ['#한강러닝', '#야간런', '#5K', '#코스공유', '#8km'];
  const filteredPosts = webPosts.filter((post) => post.hashtags.includes(tagLabel));

  return (
    <WebShell title={tagLabel} subtitle="해시태그가 붙은 피드 게시물을 모아봅니다.">
      <Card>
        <div className={styles.tabs}>
          {relatedTags.map((item) => (
            <Link
              key={item}
              to={`/tags/${encodeURIComponent(item.replace('#', ''))}`}
              className={`${styles.filterButton} ${
                item === tagLabel ? styles.filterButtonActive : ''
              }`}
            >
              {item}
            </Link>
          ))}
        </div>
      </Card>
      <div className={styles.cardGrid}>
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => <PostListItem key={post.id} post={post} />)
        ) : (
          <div className={styles.emptyCard}>
            <strong>태그가 붙은 글이 없어요</strong>
            <span>다른 관련 태그를 눌러보세요.</span>
          </div>
        )}
      </div>
    </WebShell>
  );
}

export function StatesPage() {
  return (
    <WebShell title="빈 상태와 로딩" subtitle="카드와 리스트 단위의 공통 상태 패턴입니다.">
      <Card title="빈 상태 패턴 카탈로그">
        <div className={styles.cardGrid}>
          {Object.values(emptyStates).map((label) => (
            <div key={label} className={styles.emptyCard}>
              <strong>{label}</strong>
              <span>데이터가 없을 때 다음 행동을 안내합니다.</span>
            </div>
          ))}
        </div>
      </Card>
      <Card title="로딩 스켈레톤">
        <div className={styles.skeleton} />
        <div className={styles.skeletonShort} />
      </Card>
    </WebShell>
  );
}

export function ErrorStatePage({ kind }: { kind: 'notFound' | 'forbidden' | 'server' }) {
  const copy = {
    notFound: ['404', '페이지를 찾을 수 없어요', '홈으로'],
    forbidden: ['접근 제한', '로그인이 필요한 화면입니다', '홈으로'],
    server: ['서버 오류', '잠시 후 다시 시도해주세요', '다시 시도'],
  }[kind];
  return (
    <WebShell title="오류 상태" subtitle="잘못된 경로, 접근 제한, 서버 오류를 안내합니다.">
      <Card className={styles.errorCard}>
        <strong>{copy[0]}</strong>
        <h2>{copy[1]}</h2>
        <p>사용자가 다음 행동을 알 수 있도록 홈으로 이동하거나 다시 시도합니다.</p>
        <PrimaryLink to="/home">{copy[2]}</PrimaryLink>
      </Card>
    </WebShell>
  );
}
