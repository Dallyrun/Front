import type { ReactNode } from 'react';
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
  tone?: 'blue' | 'green' | 'amber' | 'slate' | 'red';
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

function StatCard({ label, value, caption }: { label: string; value: string; caption?: string }) {
  return (
    <div className={styles.statCard}>
      <strong>{value}</strong>
      <span>{label}</span>
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
    <Link to={`/community/${post.id}`} className={styles.listItem}>
      <span>
        <strong>{post.title}</strong>
        <small>
          {post.author} · {post.category}
        </small>
      </span>
      <small>
        좋아요 {post.likeCount} · 댓글 {post.commentCount}
      </small>
    </Link>
  );
}

function RecruitItem({ recruit, crewId }: { recruit: Recruit; crewId: string }) {
  return (
    <Link to={`/crews/${crewId}/recruits/${recruit.id}`} className={styles.listItem}>
      <span>
        <Chip
          tone={recruit.type === '정기런' ? 'green' : recruit.type === '번개런' ? 'amber' : 'blue'}
        >
          {recruit.type}
        </Chip>
        <strong>{recruit.title}</strong>
        <small>
          {recruit.schedule} · {recruit.place}
        </small>
      </span>
      <small>{recruit.participants}</small>
    </Link>
  );
}

export function DashboardHomePage() {
  const progress = Math.round((goal.currentKm / goal.targetKm) * 100);
  const latestRun = getRunRecord('hangang-night-8k');
  const primaryCrew = getCrew('hangang-crew');
  return (
    <WebShell
      title="러닝 인사이트 홈"
      subtitle="오늘의 기록, 목표, 커뮤니티 소식을 한 화면에서 확인합니다."
      action={<PrimaryLink to="/community/new">피드 글쓰기</PrimaryLink>}
    >
      <div className={styles.heroGrid}>
        <Card className={styles.heroCard}>
          <Chip>{latestRun.runType}</Chip>
          <h2>오늘 러닝 상태</h2>
          <p>
            어제 10K 완주 기록이 반영됐어요. 기록 상세에서 구간별 페이스와 메모를 확인하고,
            커뮤니티에 러닝 후기를 남길 수 있습니다.
          </p>
          <div className={styles.actions}>
            <PrimaryLink to={`/records/${latestRun.id}`}>최근 기록 보기</PrimaryLink>
            <SecondaryLink to="/community/new">피드 글쓰기</SecondaryLink>
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
      <div className={styles.statGrid}>
        <StatCard label="이번 주 거리" value="18.4 km" caption="지난주보다 +12%" />
        <StatCard label="평균 페이스" value="5'42&quot;" caption="최근 5회 평균" />
        <StatCard label="연속 러닝" value="7일" caption="이번 주 3회 기록" />
        <StatCard label="신규 PR" value="10K" caption="04.28 달성" />
      </div>
      <div className={styles.twoColumn}>
        <Card title="커뮤니티">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </Card>
        <Card title="크루 일정">
          {primaryCrew.recruits.slice(0, 2).map((recruit) => (
            <RecruitItem key={recruit.id} recruit={recruit} crewId={primaryCrew.id} />
          ))}
        </Card>
      </div>
    </WebShell>
  );
}

export function RecordsPage() {
  const latestRun = getRunRecord('hangang-night-8k');
  return (
    <WebShell
      title="기록 분석"
      subtitle="히스토리, 1km 스플릿, 누적 통계와 PR을 쉽게 돌아볼 수 있습니다."
    >
      <div className={styles.tabs}>
        <Chip>주간</Chip>
        <Chip tone="slate">월간</Chip>
        <Chip tone="slate">연간</Chip>
      </div>
      <div className={styles.statGrid}>
        <StatCard label="총 누적 거리" value={profile.totalDistance} />
        <StatCard label="총 러닝" value={`${profile.runCount} runs`} />
        <StatCard label="총 시간" value="23h 12m" />
        <StatCard label="평균 페이스" value={profile.averagePace} />
      </div>
      <div className={styles.twoColumn}>
        <Card title="최근 러닝 1km 스플릿">
          {latestRun.splits.slice(0, 5).map((split) => (
            <div key={split.km} className={styles.splitRow}>
              <span>{split.km}km</span>
              <ProgressBar value={split.value} />
              <strong>{split.pace}</strong>
            </div>
          ))}
        </Card>
        <Card title="러닝 세션">
          {runRecords.map((record) => (
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

export function GoalEditPage() {
  return (
    <WebShell
      title="목표 설정"
      subtitle="주간·월간 거리 목표를 직접 입력하고 수정합니다."
      action={<PrimaryLink to="/home">저장하기</PrimaryLink>}
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
        <Card>
          <p className={styles.meta}>
            {post.author} · {post.crew} · {post.timeAgo}
          </p>
          <h2>{post.title}</h2>
          <div className={styles.tabs}>
            <Chip>{post.category}</Chip>
            {post.hashtags.map((tag) => (
              <Chip key={tag} tone="slate">
                {tag}
              </Chip>
            ))}
          </div>
          <p>{post.body}</p>
          {run && <RunListItem record={run} />}
          <p>
            좋아요 {post.likeCount} · 댓글 {post.commentCount} · 공유 {post.shareCount}
          </p>
          <input aria-label="댓글 입력" placeholder="댓글을 입력하세요" />
          {post.comments.map((comment) => (
            <p key={comment}>{comment}</p>
          ))}
        </Card>
        <Card title="같은 크루 글">
          {posts.map((item) => (
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
      <div className={styles.cardGrid}>
        {crews.map((crew) => (
          <Link key={crew.id} to={`/crews/${crew.id}`} className={styles.crewCard}>
            <strong>{crew.name}</strong>
            <span>{crew.area}</span>
            <small>
              {crew.memberCount}명 · {crew.averagePace} · {crew.activityTime}
            </small>
          </Link>
        ))}
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
      action={<PrimaryLink to="/profile/edit">프로필 편집</PrimaryLink>}
    >
      <Card className={styles.detailHero}>
        <div>
          <h2>{profile.nickname}</h2>
          <p>{profile.bio}</p>
          <Link to="/followers" className={styles.inlineLink}>
            팔로워 {profile.followerCount} · 팔로잉 {profile.followingCount}
          </Link>
        </div>
        <div className={styles.statGrid}>
          <StatCard label="누적 거리" value={profile.totalDistance} />
          <StatCard label="러닝" value={String(profile.runCount)} />
          <StatCard label="평균 페이스" value={profile.averagePace} />
          <StatCard label="뱃지" value={String(profile.badgeCount)} />
        </div>
      </Card>
      <div className={styles.twoColumn}>
        <Card title="공개 범위">
          <p>전체 공개 · 모든 러너가 볼 수 있어요</p>
          <p>팔로워만 · 나를 팔로우한 사람만</p>
          <p>비공개 · 나만 볼 수 있어요</p>
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
    '전체 공개',
    '팔로워만',
    '비공개',
    '측정 단위',
    '언어',
    '차단한 사용자',
    '데이터 다운로드',
    '버전/정보',
    '로그아웃',
    '회원탈퇴',
  ];
  return (
    <WebShell title="설정" subtitle="공개 범위, 알림, 단위, 언어, 데이터와 계정을 관리합니다.">
      <Card title="계정 설정">
        <div className={styles.settingsList}>
          {settings.map((item) => (
            <button key={item} type="button">
              {item}
              <span>{item === '데이터 다운로드' ? '내 기록 내려받기' : '설정 항목'}</span>
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
