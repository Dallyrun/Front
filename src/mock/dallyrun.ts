import type {
  Badge,
  Crew,
  EmptyStateKind,
  Goal,
  NotificationItem,
  Post,
  Profile,
  RunRecord,
} from '@/types/dallyrun';

export const profile: Profile = {
  nickname: '러너지민',
  bio: "매일 한강에서 달려요 · 페이스 5'30 · 한강 러닝크루",
  yearLabel: '4년차 러너',
  totalDistance: '247.8km',
  runCount: 42,
  averagePace: '5\'34"',
  badgeCount: 12,
  followerCount: 248,
  followingCount: 187,
  privacy: 'PUBLIC',
};

export const goal: Goal = {
  title: '5월 러닝 목표',
  period: '월간',
  targetKm: 80,
  currentKm: 57.6,
  startDate: '2026.05.01',
  endDate: '2026.05.31',
};

export const runRecords: RunRecord[] = [
  {
    id: 'hangang-night-8k',
    title: '한강 야간런',
    date: '2026.05.01',
    place: '여의도 한강공원',
    distance: '8.2 km',
    duration: '44:08',
    pace: '5\'23"',
    calories: '512 kcal',
    runType: '야간 러닝',
    prStatus: '10K PR',
    memo: '마지막 2km에서 페이스를 끌어올렸다. 다음에는 초반 오버페이스만 줄이면 더 안정적일 듯.',
    photos: ['여의도 한강공원', '야간 코스'],
    splits: [
      { km: 1, pace: '5\'38"', value: 68 },
      { km: 2, pace: '5\'31"', value: 76 },
      { km: 3, pace: '5\'22"', value: 86 },
      { km: 4, pace: '5\'45"', value: 61 },
      { km: 5, pace: '5\'29"', value: 72 },
      { km: 6, pace: '5\'19"', value: 81 },
      { km: 7, pace: '5\'25"', value: 78 },
      { km: 8, pace: '5\'12"', value: 100, isBest: true },
    ],
  },
  {
    id: 'morning-recovery',
    title: '아침 회복런',
    date: '2026.04.30',
    place: '반포천',
    distance: '4.1 km',
    duration: '24:43',
    pace: '6\'01"',
    calories: '244 kcal',
    runType: '회복 러닝',
    memo: '가볍게 몸만 풀었다.',
    photos: ['반포천'],
    splits: [
      { km: 1, pace: '6\'10"', value: 72 },
      { km: 2, pace: '6\'02"', value: 78 },
      { km: 3, pace: '5\'58"', value: 82, isBest: true },
      { km: 4, pace: '6\'03"', value: 76 },
    ],
  },
  {
    id: 'tempo-10k',
    title: '10K 템포런',
    date: '2026.04.28',
    place: '여의도 한강공원',
    distance: '10.2 km',
    duration: '51:20',
    pace: '5\'18"',
    calories: '630 kcal',
    runType: '템포런',
    prStatus: '10K PR',
    memo: '10K Club 뱃지를 획득한 기록.',
    photos: ['한강 10K'],
    splits: [
      { km: 1, pace: '5\'26"', value: 76 },
      { km: 2, pace: '5\'21"', value: 82 },
      { km: 3, pace: '5\'18"', value: 86 },
      { km: 4, pace: '5\'15"', value: 90 },
      { km: 5, pace: '5\'12"', value: 96, isBest: true },
    ],
  },
];

export const badges: Badge[] = [
  {
    id: '10k-club',
    title: '10K Club',
    description: '한 번의 러닝에서 10km 이상 완주하면 획득합니다.',
    category: '거리 마일스톤',
    status: '획득',
    earnedAt: '2026.04.28',
    progress: '10.2km / 10km',
  },
  {
    id: '50k-club',
    title: '50K Club',
    description: '누적 러닝 거리 50km를 달성하면 열립니다.',
    category: '거리 마일스톤',
    status: '미획득',
    progress: '42.6km / 50km',
  },
  {
    id: 'seven-days',
    title: '7일 연속',
    description: '7일 연속 러닝을 기록하면 획득합니다.',
    category: '연속 러닝',
    status: '획득',
    progress: '7일 / 7일',
  },
  {
    id: 'morning-runner',
    title: '새벽 러너',
    description: '오전 6시 이전 러닝을 완료하면 획득합니다.',
    category: '시간대 성취',
    status: '획득',
    progress: '3회',
  },
];

export const posts: Post[] = [
  {
    id: 'hangang-review',
    title: '한강 야간런 후기',
    author: profile.nickname,
    crew: '한강 러닝크루',
    timeAgo: '23분 전',
    category: '러닝 후기',
    body: '오늘 한강에서 8.2km 달렸어요. 마지막 구간까지 페이스가 안정적이라 기분 좋은 러닝이었습니다.',
    hashtags: ['#한강러닝', '#야간런'],
    attachedRunId: 'hangang-night-8k',
    likeCount: 24,
    commentCount: 5,
    shareCount: 2,
    comments: ['좋은 기록이에요!', '다음에 같이 달려요.'],
  },
  {
    id: 'course-share',
    title: '여의도 코스 공유',
    author: '달리는 수현',
    crew: '한강 러닝크루',
    timeAgo: '1시간 전',
    category: '코스 공유',
    body: '초보 러너도 편하게 달릴 수 있는 여의도 5K 코스를 정리했어요.',
    hashtags: ['#한강러닝', '#코스공유'],
    likeCount: 18,
    commentCount: 3,
    shareCount: 1,
    comments: ['저장해둘게요.'],
  },
];

export const crews: Crew[] = [
  {
    id: 'hangang-crew',
    name: '한강 러닝크루',
    area: '서울 · 여의도',
    description: '한강공원 일대에서 평일 저녁과 주말 오전에 함께 달리는 크루입니다.',
    memberCount: 124,
    averagePace: "5'30~6'30",
    activityTime: '평일 저녁',
    level: '초급',
    members: ['러너지민', '달리는 수현', '정원오빠', '연재'],
    recruits: [
      {
        id: 'friday-8k',
        type: '정기런',
        title: '금요일 한강 8km',
        schedule: '5/1 금 19:00',
        place: '여의도공원',
        distance: '8km',
        pace: "6'00 페이스",
        participants: '12 / 20명',
        description:
          '편하게 달릴 수 있는 분 환영해요. 집결 후 가벼운 스트레칭을 하고 한강 코스를 함께 달립니다.',
      },
      {
        id: 'weekend-jog',
        type: '번개런',
        title: '주말 오전 조깅',
        schedule: '5/4 일 08:00',
        place: '반포',
        distance: '6km',
        pace: '자유 페이스',
        participants: '8 / 15명',
        description: '주말 아침에 가볍게 조깅합니다.',
      },
      {
        id: 'race-prep',
        type: '대회',
        title: '봄 10K 준비런',
        schedule: '5/6 수 20:00',
        place: '뚝섬',
        distance: '5km',
        pace: "6'30 페이스",
        participants: '6 / 12명',
        description: '대회 전 몸을 맞추는 가벼운 준비런입니다.',
      },
    ],
  },
  {
    id: 'seongsu-morning',
    name: '성수 모닝런',
    area: '서울 · 성수',
    description: '출근 전 가볍게 달리는 모닝 러닝 크루입니다.',
    memberCount: 58,
    averagePace: "6'00",
    activityTime: '평일 저녁',
    level: '초급',
    members: ['민지러너', '성수 러너'],
    recruits: [],
  },
];

export const notifications: NotificationItem[] = [
  {
    id: 'comment',
    category: '소셜',
    title: '댓글이 달렸어요',
    body: '민지님이 한강 야간런 후기 글에 댓글을 남겼어요.',
    timeAgo: '방금',
  },
  {
    id: 'follow',
    category: '팔로우',
    title: '새 팔로워가 생겼어요',
    body: '달리는 수현님이 회원님을 팔로우합니다.',
    timeAgo: '15분 전',
  },
  {
    id: 'badge',
    category: '뱃지',
    title: '10K Club 뱃지를 획득했어요',
    body: '새 뱃지는 프로필과 뱃지 상세에서 확인할 수 있어요.',
    timeAgo: '1시간 전',
  },
  {
    id: 'crew',
    category: '크루',
    title: '크루 일정이 변경됐어요',
    body: '금요일 한강 8km 모임의 집결 장소가 업데이트됐습니다.',
    timeAgo: '2시간 전',
  },
];

export const followers = ['달리는 수현', '러너 민지', '한강 지훈', '성수 러너', '정원오빠'];

export const following = ['정원오빠', '연재', '민지러너', '강서 러너'];

export const emptyStates: Record<EmptyStateKind, string> = {
  running: '러닝 기록 0개',
  crew: '내 크루 0개',
  notification: '알림 0개',
  search: '검색 결과 0개',
  recruit: '모집글 0개',
  comment: '댓글 0개',
  follow: '팔로워/팔로잉 0명',
};

export function getRunRecord(id?: string): RunRecord {
  const fallback = runRecords[0];
  if (!fallback) throw new Error('Mock run records are empty');
  return runRecords.find((record) => record.id === id) ?? fallback;
}

export function getBadge(id?: string): Badge {
  const fallback = badges[0];
  if (!fallback) throw new Error('Mock badges are empty');
  return badges.find((badge) => badge.id === id) ?? fallback;
}

export function getPost(id?: string): Post {
  const fallback = posts[0];
  if (!fallback) throw new Error('Mock posts are empty');
  return posts.find((post) => post.id === id) ?? fallback;
}

export function getCrew(id?: string): Crew {
  const fallback = crews[0];
  if (!fallback) throw new Error('Mock crews are empty');
  return crews.find((crew) => crew.id === id) ?? fallback;
}

export function getRecruit(
  crewId?: string,
  recruitId?: string,
): { crew: Crew; recruit: Crew['recruits'][number] } {
  const crew = getCrew(crewId);
  const fallback = crew.recruits[0];
  if (!fallback) throw new Error(`Mock recruits are empty for crew ${crew.id}`);
  return {
    crew,
    recruit: crew.recruits.find((recruit) => recruit.id === recruitId) ?? fallback,
  };
}
