export type PrivacyScope = 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';

export type PostCategory = '러닝 후기' | '코스 공유' | '초보 Q&A' | '장비';

export type RecruitType = '정기런' | '번개런' | '대회';

export type NotificationCategory = '전체' | '소셜' | '크루' | '뱃지' | '팔로우';

export type EmptyStateKind =
  | 'running'
  | 'crew'
  | 'notification'
  | 'search'
  | 'recruit'
  | 'comment'
  | 'follow';

export interface RunSplit {
  km: number;
  pace: string;
  value: number;
  isBest?: boolean;
}

export interface RunRecord {
  id: string;
  title: string;
  date: string;
  place: string;
  distance: string;
  duration: string;
  pace: string;
  calories: string;
  runType: string;
  prStatus?: string;
  memo: string;
  photos: string[];
  splits: RunSplit[];
}

export interface Goal {
  title: string;
  period: '주간' | '월간';
  targetKm: number;
  currentKm: number;
  startDate: string;
  endDate: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  category: string;
  status: '획득' | '미획득';
  earnedAt?: string;
  progress: string;
}

export interface Post {
  id: string;
  title: string;
  author: string;
  crew: string;
  timeAgo: string;
  category: PostCategory;
  body: string;
  hashtags: string[];
  attachedRunId?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  comments: string[];
}

export interface Recruit {
  id: string;
  type: RecruitType;
  title: string;
  schedule: string;
  place: string;
  distance: string;
  pace: string;
  participants: string;
  description: string;
}

export interface Crew {
  id: string;
  name: string;
  area: string;
  description: string;
  memberCount: number;
  averagePace: string;
  activityTime: string;
  level: string;
  recruits: Recruit[];
  members: string[];
}

export interface Profile {
  nickname: string;
  bio: string;
  yearLabel: string;
  totalDistance: string;
  runCount: number;
  averagePace: string;
  badgeCount: number;
  followerCount: number;
  followingCount: number;
  privacy: PrivacyScope;
}

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  timeAgo: string;
}
