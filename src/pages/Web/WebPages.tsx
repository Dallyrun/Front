import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';

import WebShell from '@/components/WebShell/WebShell';
import {
  badges,
  crews,
  emptyStates,
  followers,
  following,
  getBadge,
  getCrew,
  getPost,
  getRecruit,
  getRunRecord,
  goal,
  notifications,
  posts,
  profile,
  runRecords,
} from '@/mock/dallyrun';
import type { NotificationItem, Post, Recruit, RunRecord } from '@/types/dallyrun';

import styles from './WebPages.module.css';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

function Card({ title, children, className = '' }: CardProps) {
  return (
    <section className={`${styles.card} ${className}`}>
      {title && <h2>{title}</h2>}
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
  return <span className={`${styles.chip} ${styles[`chip${tone}`]}`}>{children}</span>;
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
  return (
    <div className={styles.statCard}>
      <span className={`${styles.statAccent} ${styles[`statAccent${tone}`]}`} aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
      {caption && <small>{caption}</small>}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className={styles.progressTrack} aria-label={`진행률 ${value}%`}>
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

function RunListItem({ record }: { record: RunRecord }) {
  return (
    <Link to={`/records/${record.id}`} className={styles.listItem}>
      <span>
        <strong>{record.title}</strong>
        <small>
          {record.distance} · {record.duration}
        </small>
      </span>
      {record.prStatus && <Chip tone="amber">{record.prStatus}</Chip>}
    </Link>
  );
}

function PostListItem({ post }: { post: Post }) {
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
          <small>좋아요 {post.likeCount}</small>
          <small>댓글 {post.commentCount}</small>
          <small>공유 {post.shareCount}</small>
        </span>
      </span>
    </Link>
  );
}

function getRecruitTone(type: Recruit['type']) {
  return type === '정기런' ? 'green' : type === '번개런' ? 'amber' : 'blue';
}

function RecruitItem({ recruit, crewId }: { recruit: Recruit; crewId: string }) {
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
          <Chip tone="slate">{recruit.distance}</Chip>
        </span>
        <strong>{recruit.title}</strong>
        <small>
          {recruit.place} · {recruit.pace}
        </small>
      </span>
      <span className={styles.recruitStatus}>
        <strong>{recruit.participants}</strong>
        <small>참여 현황</small>
      </span>
    </Link>
  );
}

type RecordRange = 'weekly' | 'monthly' | 'yearly';

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

export function DashboardHomePage() {
  const progress = Math.round((goal.currentKm / goal.targetKm) * 100);
  const latestRun = getRunRecord('hangang-night-8k');
  const primaryCrew = getCrew('hangang-crew');
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
              최근 7일 누적 거리는 18.4km입니다. 기록 상세에서 구간별 페이스와 메모를 확인하고,
              커뮤니티에 러닝 후기를 남길 수 있습니다.
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
            <strong>{latestRun.distance}</strong>
            <strong>{latestRun.duration}</strong>
          </div>
        </Card>
        <Card title="월간 목표">
          <strong className={styles.bigNumber}>{progress}%</strong>
          <ProgressBar value={progress} />
          <p>
            {goal.targetKm}km 중 {goal.currentKm}km 완료. 남은 거리{' '}
            {(goal.targetKm - goal.currentKm).toFixed(1)}km
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
          {posts.map((post) => (
            <Link key={post.id} to={`/community/${post.id}`} className={styles.feedPreviewItem}>
              <span className={styles.feedAvatar}>달</span>
              <span>
                <strong>{post.author}</strong>
                <small>
                  {post.crew} · {post.timeAgo}
                </small>
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
          {primaryCrew.recruits.slice(0, 2).map((recruit) => (
            <Link
              key={recruit.id}
              to={`/crews/${primaryCrew.id}/recruits/${recruit.id}`}
              className={styles.scheduleItem}
            >
              <Chip tone={recruit.type === '정기런' ? 'green' : 'softBlue'}>
                {recruit.schedule.split(' ')[0]}
              </Chip>
              <span>
                <strong>{recruit.title}</strong>
                <small>
                  {recruit.schedule} · {recruit.place} · {recruit.pace} · {recruit.participants}
                </small>
              </span>
            </Link>
          ))}
        </Card>
      </div>
    </WebShell>
  );
}

export function RecordsPage() {
  const latestRun = getRunRecord('hangang-night-8k');
  const [selectedRange, setSelectedRange] = useState<RecordRange>('weekly');
  const currentRange =
    recordRangeOptions.find((option) => option.id === selectedRange) ?? recordRangeOptions[0]!;

  return (
    <WebShell
      title="기록 분석"
      subtitle="히스토리, 1km 스플릿, 누적 통계와 PR을 쉽게 돌아볼 수 있습니다."
    >
      <div className={styles.tabList} role="tablist" aria-label="기록 분석 기간">
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
            {option.label}
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
              <span>{split.km}km</span>
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
  const { runId } = useParams();
  const record = getRunRecord(runId);
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
          <StatCard label="거리" value={record.distance} />
          <StatCard label="시간" value={record.duration} />
          <StatCard label="평균 페이스" value={record.pace} />
          <StatCard label="칼로리" value={record.calories} />
        </div>
      </Card>
      <div className={styles.twoColumn}>
        <Card title="구간별 페이스">
          {record.splits.map((split) => (
            <div key={split.km} className={styles.splitRow}>
              <span>{split.km}km</span>
              <ProgressBar value={split.value} />
              <strong>{split.isBest ? 'BEST' : split.pace}</strong>
            </div>
          ))}
        </Card>
        <Card title="메모와 사진">
          <div className={styles.photoGrid}>
            {record.photos.map((photo) => (
              <span key={photo}>{photo}</span>
            ))}
          </div>
          <p>{record.memo}</p>
        </Card>
      </div>
    </WebShell>
  );
}

export function GoalPage() {
  const progress = Math.round((goal.currentKm / goal.targetKm) * 100);
  const remainingKm = Math.max(goal.targetKm - goal.currentKm, 0).toFixed(1);
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
          <Chip>{goal.period} 목표</Chip>
          <h2>{goal.title}</h2>
          <p>
            {goal.startDate} - {goal.endDate}
          </p>
          <div className={styles.goalProgressSummary}>
            <strong>{progress}%</strong>
            <span>
              {goal.targetKm}km 중 {goal.currentKm}km 완료 · 남은 거리 {remainingKm}km
            </span>
          </div>
          <ProgressBar value={progress} />
        </div>
        <div className={styles.goalHeroStats}>
          <span>
            <strong>{goal.currentKm}km</strong>
            현재 거리
          </span>
          <span>
            <strong>{goal.targetKm}km</strong>
            목표 거리
          </span>
          <span>
            <strong>{remainingKm}km</strong>
            남은 거리
          </span>
          <span>
            <strong>12회</strong>
            이번 목표 러닝
          </span>
        </div>
      </section>
      <div className={styles.twoColumn}>
        <Card title="달성 캘린더">
          <div className={styles.goalHeatmap} aria-label="목표 달성 캘린더">
            {heatmapValues.map((value, index) => (
              <span
                key={`goal-heat-${index}-${value}`}
                className={value >= 75 ? styles.heatStrong : value > 0 ? styles.heatMedium : ''}
              />
            ))}
          </div>
          <p>러닝한 날이 많을수록 진하게 표시됩니다.</p>
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
            <strong>목표를 바꾸고 싶나요?</strong>
            기간과 거리만 수정하면 현재 달성률이 다시 계산됩니다.
          </span>
          <SecondaryLink to="/goals/edit">목표 설정 / 수정</SecondaryLink>
        </div>
      </Card>
    </WebShell>
  );
}

export function GoalEditPage() {
  return (
    <WebShell
      title="목표 설정"
      subtitle="주간·월간 거리 목표를 직접 입력하고 수정합니다."
      action={<PrimaryLink to="/goals">저장하기</PrimaryLink>}
    >
      <div className={styles.twoColumn}>
        <Card title="거리 목표">
          <div className={styles.formGrid}>
            <label>
              목표 이름
              <input defaultValue={goal.title} />
            </label>
            <label>
              기간
              <select defaultValue={goal.period}>
                <option>주간</option>
                <option>월간</option>
              </select>
            </label>
            <label>
              목표 거리
              <input defaultValue={goal.targetKm} />
            </label>
            <label>
              시작일
              <input defaultValue={goal.startDate} />
            </label>
            <label>
              종료일
              <input defaultValue={goal.endDate} />
            </label>
          </div>
        </Card>
        <Card title="목표 미리보기">
          <strong className={styles.bigNumber}>72%</strong>
          <ProgressBar value={72} />
          <p>80km 중 57.6km 완료</p>
          <p>러닝 12회 · 평균 페이스 5'34&quot;</p>
        </Card>
      </div>
    </WebShell>
  );
}

export function BadgeListPage() {
  return (
    <WebShell title="뱃지 전체" subtitle="획득한 뱃지와 아직 남은 조건을 한눈에 봅니다.">
      <div className={styles.tabs}>
        <Chip>전체</Chip>
        <Chip tone="green">획득</Chip>
        <Chip tone="slate">미획득</Chip>
      </div>
      <div className={styles.cardGrid}>
        {badges.map((badge) => (
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
  const { badgeId } = useParams();
  const badge = getBadge(badgeId);
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
          <ProgressBar value={badge.status === '획득' ? 100 : 85} />
          <p>조건 달성 {badge.progress}</p>
        </div>
      </Card>
      <div className={styles.twoColumn}>
        <Card title="획득 조건">
          <p>조건 1 단일 러닝 기록 거리 10km 이상</p>
          <p>조건 2 GPS 기록이 정상 저장된 러닝</p>
          <p>조건 3 삭제되지 않은 공개 가능 기록</p>
        </Card>
        <Card title="관련 기록">
          <RunListItem record={getRunRecord('tempo-10k')} />
          <SecondaryLink to="/community/new">게시글에 공유</SecondaryLink>
        </Card>
      </div>
    </WebShell>
  );
}

export function PostComposePage() {
  return (
    <WebShell
      title="게시글 작성"
      subtitle="러닝 기록, 사진, 해시태그를 넣어 게시글을 작성합니다."
      action={<PrimaryLink to="/community/hangang-review">게시하기</PrimaryLink>}
    >
      <div className={styles.twoColumn}>
        <Card title="새 게시글">
          <div className={styles.formGrid}>
            <label>
              제목
              <input defaultValue="한강 야간런 후기" />
            </label>
            <label>
              내용
              <textarea defaultValue="오늘 한강에서 8.2km 달렸어요. 페이스가 안정적이라 기분 좋은 러닝이었습니다." />
            </label>
          </div>
          <small>84/500</small>
          <div className={styles.tabs}>
            <Chip>러닝 후기</Chip>
            <Chip tone="slate">코스 공유</Chip>
            <Chip tone="slate">초보 Q&A</Chip>
            <Chip tone="slate">장비</Chip>
          </div>
          <p>#한강런 #야간런 #8km</p>
          <RunListItem record={getRunRecord('hangang-night-8k')} />
        </Card>
        <Card title="미리보기">
          <PostListItem post={getPost('hangang-review')} />
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
  const categoryCounts = ['러닝 후기', '코스 공유', '초보 Q&A', '장비'].map((category) => ({
    category,
    count: posts.filter((post) => post.category === category).length,
  }));

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
            <strong>{posts.length}</strong>
            게시글
          </span>
          <span>
            <strong>{posts.reduce((sum, post) => sum + post.commentCount, 0)}</strong>
            댓글
          </span>
          <span>
            <strong>{posts.reduce((sum, post) => sum + post.likeCount, 0)}</strong>
            좋아요
          </span>
        </div>
      </section>
      <div className={styles.twoColumn}>
        <Card>
          <div className={styles.panelHeader}>
            <h2>전체 글</h2>
            <div className={styles.tabs}>
              <Chip>최신순</Chip>
              <Chip tone="slate">인기순</Chip>
            </div>
          </div>
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </Card>
        <div className={styles.sideStack}>
          <Card title="카테고리">
            <div className={styles.categoryList}>
              {categoryCounts.map((item) => (
                <span key={item.category}>
                  <strong>{item.category}</strong>
                  <small>{item.count}개 글</small>
                </span>
              ))}
            </div>
          </Card>
          <Card title="인기 해시태그">
            <div className={styles.tabs}>
              <Chip tone="slate">#한강러닝</Chip>
              <Chip tone="slate">#야간런</Chip>
              <Chip tone="slate">#코스공유</Chip>
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
  const post = getPost(postId);
  const run = post.attachedRunId ? getRunRecord(post.attachedRunId) : null;
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
            <strong>좋아요 {post.likeCount}</strong>
            <strong>댓글 {post.commentCount}</strong>
            <strong>공유 {post.shareCount}</strong>
          </p>
          <input aria-label="댓글 입력" placeholder="댓글을 입력하세요" />
          <div className={styles.commentList}>
            {post.comments.map((comment) => (
              <p key={comment}>{comment}</p>
            ))}
          </div>
        </Card>
        <Card title="같은 크루 글">
          {posts
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
  return (
    <WebShell
      title="크루 찾기"
      subtitle="지역, 페이스, 시간대로 크루를 탐색합니다."
      action={<SecondaryLink to="/crews/hangang-crew">크루 만들기</SecondaryLink>}
    >
      <Card>
        <div className={styles.tabs}>
          <Chip>서울</Chip>
          <Chip tone="slate">5'30~6'30</Chip>
          <Chip tone="slate">평일 저녁</Chip>
          <Chip tone="slate">초급</Chip>
        </div>
      </Card>
      <div className={styles.crewGrid}>
        {crews.map((crew) => {
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
    </WebShell>
  );
}

export function CrewDetailPage() {
  const { crewId } = useParams();
  const crew = getCrew(crewId);
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
          <div className={styles.tabs}>
            <Chip>모집글</Chip>
            <Chip tone="slate">멤버</Chip>
            <Chip tone="slate">소개</Chip>
          </div>
        </div>
      </Card>
      <div className={styles.twoColumn}>
        <Card title="모집글">
          {crew.recruits.map((recruit) => (
            <RecruitItem key={recruit.id} recruit={recruit} crewId={crew.id} />
          ))}
        </Card>
        <Card title="멤버">
          {crew.members.map((member) => (
            <p key={member}>{member}</p>
          ))}
        </Card>
      </div>
    </WebShell>
  );
}

export function RecruitComposePage() {
  const { crewId } = useParams();
  const crew = getCrew(crewId);
  return (
    <WebShell
      title="모집글 작성"
      subtitle="일정, 장소, 페이스, 인원, 모임 유형과 푸시 알림 여부를 설정합니다."
      action={<PrimaryLink to={`/crews/${crew.id}`}>게시하기</PrimaryLink>}
    >
      <Card title="모집 정보">
        <div className={styles.formGrid}>
          <label>
            제목
            <input defaultValue="내일 오후 7시 한강 정모" />
          </label>
          <label>
            일정
            <input defaultValue="2026.05.01 금 19:00" />
          </label>
          <label>
            장소
            <input defaultValue="여의도공원" />
          </label>
          <label>
            페이스
            <input defaultValue="6'00 페이스" />
          </label>
          <label>
            인원
            <input defaultValue="20명" />
          </label>
          <label>
            거리
            <input defaultValue="8km" />
          </label>
        </div>
        <textarea defaultValue="편하게 달릴 수 있는 분 환영해요. 집결 후 가벼운 스트레칭을 하고 함께 달립니다." />
        <small>62/300</small>
        <div className={styles.tabs}>
          <Chip>정기런</Chip>
          <Chip tone="slate">번개런</Chip>
          <Chip tone="slate">대회</Chip>
        </div>
        <label className={styles.toggle}>
          <input type="checkbox" defaultChecked /> 크루 멤버에게 푸시 알림 보내기
        </label>
      </Card>
    </WebShell>
  );
}

export function RecruitDetailPage() {
  const { crewId, recruitId } = useParams();
  const { crew, recruit } = getRecruit(crewId, recruitId);
  return (
    <WebShell
      title="모집글 상세"
      subtitle="모집글 정보와 참여 상태를 확인합니다."
      action={<PrimaryLink to={`/crews/${crew.id}`}>참여하기</PrimaryLink>}
    >
      <Card className={styles.detailHero}>
        <div>
          <Chip tone="green">{recruit.type}</Chip>
          <h2>{recruit.title}</h2>
          <p>{crew.name}</p>
          <div className={styles.tabs}>
            <Chip tone="slate">{recruit.schedule}</Chip>
            <Chip tone="slate">{recruit.place}</Chip>
            <Chip tone="slate">{recruit.distance}</Chip>
            <Chip tone="slate">{recruit.pace}</Chip>
            <Chip tone="slate">{recruit.participants}</Chip>
          </div>
        </div>
      </Card>
      <div className={styles.twoColumn}>
        <Card title="상세 설명">
          <p>{recruit.description}</p>
        </Card>
        <Card title="참여 러너">
          {crew.members.map((member) => (
            <p key={member}>{member}</p>
          ))}
        </Card>
      </div>
    </WebShell>
  );
}

export function ProfilePage() {
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
          <h2>{profile.nickname}</h2>
          <p>{profile.bio}</p>
          <Link to="/followers" className={styles.inlineLink}>
            팔로워 {profile.followerCount} · 팔로잉 {profile.followingCount}
          </Link>
          <div className={styles.profileHeroStats}>
            <span>
              <strong>{profile.totalDistance}</strong>
              누적 거리
            </span>
            <span>
              <strong>{profile.runCount}</strong>
              러닝
            </span>
            <span>
              <strong>{profile.averagePace}</strong>
              평균 페이스
            </span>
            <span>
              <strong>{profile.badgeCount}</strong>
              뱃지
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
            <span className={styles.privacyItem}>
              <strong>전체 공개</strong>
              모든 러너가 볼 수 있어요
            </span>
            <span className={styles.privacyItem}>
              <strong>팔로워만</strong>
              나를 팔로우한 사람만
            </span>
            <span className={styles.privacyItem}>
              <strong>비공개</strong>
              나만 볼 수 있어요
            </span>
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
    </WebShell>
  );
}

export function ProfileEditPage() {
  return (
    <WebShell
      title="프로필 편집"
      subtitle="닉네임, 이미지, 소개, 공개 범위를 수정합니다."
      action={<PrimaryLink to="/profile">저장하기</PrimaryLink>}
    >
      <div className={styles.twoColumn}>
        <Card title="프로필 정보">
          <div className={styles.formGrid}>
            <label>
              닉네임
              <input defaultValue={profile.nickname} />
            </label>
            <label>
              한 줄 소개
              <input defaultValue="매일 한강에서 달려요" />
            </label>
          </div>
          <div className={styles.tabs}>
            <Chip>전체 공개</Chip>
            <Chip tone="slate">팔로워만</Chip>
            <Chip tone="slate">비공개</Chip>
          </div>
        </Card>
        <Card title="프로필 미리보기">
          <h2>{profile.nickname}</h2>
          <p>{profile.bio}</p>
        </Card>
      </div>
    </WebShell>
  );
}

export function SettingsPage() {
  const settings = [
    { label: '전체 공개', description: '모든 러너가 내 프로필과 기록을 볼 수 있어요' },
    { label: '팔로워만', description: '나를 팔로우한 러너에게만 공개해요' },
    { label: '비공개', description: '내 기록과 활동을 나만 볼 수 있어요' },
    { label: '측정 단위', description: '거리와 페이스 단위를 km 기준으로 표시해요' },
    { label: '언어', description: '한국어와 영어 표시를 관리해요' },
    { label: '차단한 사용자', description: '차단 목록을 확인하고 해제할 수 있어요' },
    { label: '데이터 다운로드', description: '내 기록과 계정 데이터를 내려받아요' },
    { label: '버전/정보', description: '서비스 버전과 약관 정보를 확인해요' },
    { label: '로그아웃', description: '현재 브라우저에서 계정을 로그아웃해요' },
    { label: '회원탈퇴', description: '계정 삭제 전 보관 데이터를 확인해요' },
  ];
  return (
    <WebShell title="설정" subtitle="공개 범위, 알림, 단위, 언어, 데이터와 계정을 관리합니다.">
      <Card title="계정 설정">
        <div className={styles.settingsList}>
          {settings.map((item) => (
            <button key={item.label} type="button">
              {item.label}
              <span>{item.description}</span>
            </button>
          ))}
        </div>
      </Card>
    </WebShell>
  );
}

export function FollowersPage() {
  return (
    <WebShell
      title="팔로워와 팔로잉"
      subtitle="탭으로 팔로워와 팔로잉을 분리해 검색하고 관리합니다."
    >
      <div className={styles.twoColumn}>
        <Card title={`팔로워 ${profile.followerCount}명`}>
          {followers.map((name) => (
            <div key={name} className={styles.listItem}>
              <strong>{name}</strong>
              <small>팔로워 · 서울</small>
              <Chip>팔로우</Chip>
            </div>
          ))}
        </Card>
        <Card title={`팔로잉 ${profile.followingCount}명`}>
          {following.map((name) => (
            <div key={name} className={styles.listItem}>
              <strong>{name}</strong>
              <small>팔로잉 중 · 한강</small>
              <Chip tone="slate">팔로잉</Chip>
            </div>
          ))}
        </Card>
      </div>
    </WebShell>
  );
}

export function NotificationsPage() {
  return (
    <WebShell
      title="알림"
      subtitle="최근 알림 전체를 확인합니다. 카테고리별로 빠르게 좁혀볼 수 있습니다."
    >
      <div className={styles.tabs}>
        {['전체', '소셜', '크루', '뱃지', '팔로우'].map((label, index) => (
          <Chip key={label} tone={index === 0 ? 'blue' : 'slate'}>
            {label}
          </Chip>
        ))}
      </div>
      <Card>
        {notifications.map((item: NotificationItem) => (
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
            <small>{item.timeAgo}</small>
          </div>
        ))}
      </Card>
    </WebShell>
  );
}

export function HashtagPage() {
  const { tag } = useParams();
  const tagLabel = `#${tag ?? '한강러닝'}`;
  return (
    <WebShell title={tagLabel} subtitle="해시태그가 붙은 피드 게시물을 모아봅니다.">
      <Card>
        <div className={styles.tabs}>
          {['#한강러닝', '#야간런', '#5K', '#코스공유'].map((item) => (
            <Chip key={item} tone={item === tagLabel ? 'blue' : 'slate'}>
              {item}
            </Chip>
          ))}
        </div>
      </Card>
      <div className={styles.cardGrid}>
        {posts.map((post) => (
          <PostListItem key={post.id} post={post} />
        ))}
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
