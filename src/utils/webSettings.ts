import { useEffect, useState } from 'react';

export const WEB_SETTINGS_STORAGE_KEY = 'dallyrun-web-settings';
const WEB_SETTINGS_EVENT = 'dallyrun-web-settings-change';
const KM_TO_MILE = 0.621371;

export type WebDistanceUnit = 'km' | 'mile';
export type WebLanguage = 'ko' | 'en';

export interface WebSettings {
  unit: WebDistanceUnit;
  language: WebLanguage;
  notificationSocial: boolean;
  notificationCrew: boolean;
  notificationBadge: boolean;
}

export const defaultWebSettings: WebSettings = {
  unit: 'km',
  language: 'ko',
  notificationSocial: true,
  notificationCrew: true,
  notificationBadge: true,
};

type StoredWebSettings = Partial<
  Omit<WebSettings, 'unit' | 'language'> & {
    unit: string;
    language: string;
  }
>;

function normalizeUnit(unit: unknown): WebDistanceUnit {
  return unit === 'mile' ? 'mile' : 'km';
}

function normalizeLanguage(language: unknown): WebLanguage {
  return language === 'en' || language === 'English' ? 'en' : 'ko';
}

export function normalizeWebSettings(value: unknown): WebSettings {
  const stored = value && typeof value === 'object' ? (value as StoredWebSettings) : {};

  return {
    ...defaultWebSettings,
    ...stored,
    unit: normalizeUnit(stored.unit),
    language: normalizeLanguage(stored.language),
  };
}

export function readWebSettings(): WebSettings {
  try {
    const raw = localStorage.getItem(WEB_SETTINGS_STORAGE_KEY);
    return normalizeWebSettings(raw ? JSON.parse(raw) : null);
  } catch {
    return defaultWebSettings;
  }
}

export function writeWebSettings(nextSettings: WebSettings) {
  try {
    localStorage.setItem(WEB_SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
    window.dispatchEvent(new Event(WEB_SETTINGS_EVENT));
  } catch {
    // Display preferences are best-effort; the UI can still keep the in-memory value.
  }
}

export function useWebSettings(): [WebSettings, (nextSettings: WebSettings) => void] {
  const [settings, setSettings] = useState<WebSettings>(() => readWebSettings());

  useEffect(() => {
    const syncSettings = () => setSettings(readWebSettings());

    window.addEventListener(WEB_SETTINGS_EVENT, syncSettings);
    window.addEventListener('storage', syncSettings);

    return () => {
      window.removeEventListener(WEB_SETTINGS_EVENT, syncSettings);
      window.removeEventListener('storage', syncSettings);
    };
  }, []);

  const updateSettings = (nextSettings: WebSettings) => {
    const normalized = normalizeWebSettings(nextSettings);
    setSettings(normalized);
    writeWebSettings(normalized);
  };

  return [settings, updateSettings];
}

function formatNumber(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatDistanceKm(valueKm: number, unit: WebDistanceUnit) {
  if (unit === 'km') return `${formatNumber(valueKm)}km`;
  return `${formatNumber(valueKm * KM_TO_MILE)} mile`;
}

export function formatDistanceText(text: string, unit: WebDistanceUnit) {
  if (unit === 'km') return text;

  return text.replace(/(\d+(?:\.\d+)?)\s?km\b/gi, (_match, value: string) =>
    formatDistanceKm(Number(value), unit),
  );
}

export function formatSplitDistance(valueKm: number, unit: WebDistanceUnit) {
  return formatDistanceKm(valueKm, unit);
}

const translations: Record<string, string> = {
  홈: 'Home',
  기록: 'Records',
  목표: 'Goals',
  커뮤니티: 'Community',
  크루: 'Crews',
  프로필: 'Profile',
  설정: 'Settings',
  '주요 메뉴': 'Primary menu',
  '기록·크루 검색': 'Search records and crews',
  '크루 이름이나 지역으로 검색': 'Search by crew name or area',
  알림: 'Notifications',
  '최근 알림': 'Recent notifications',
  '전체 알림 보기': 'View all notifications',
  '검색 결과가 없어요. Enter로 태그 검색': 'No results. Press Enter to search tags',
  '러닝 인사이트 홈': 'Running Insight Home',
  '오늘의 기록, 목표, 커뮤니티 소식을 한 화면에서 확인합니다.':
    "See today's records, goals, and community updates in one place.",
  '기록 보기': 'View records',
  '피드 글쓰기': 'Write post',
  '오늘 러닝 상태': "Today's running status",
  '어제 10K 완주 기록이 반영됐어요': 'Your 10K finish from yesterday is reflected',
  '최근 기록 보기': 'View latest record',
  '최근 러닝 요약': 'Latest run summary',
  '월간 목표': 'Monthly goal',
  '주간 목표': 'Weekly goal',
  '목표 수정': 'Edit goal',
  '이번 주 거리': 'This week distance',
  '평균 페이스': 'Average pace',
  '연속 러닝': 'Run streak',
  '신규 PR': 'New PR',
  '지난주보다 +12%': '+12% from last week',
  '최근 5회 평균': 'Last 5 average',
  '이번 주 3회 기록': '3 runs this week',
  '04.28 달성': 'Reached on 04.28',
  '이번 주 크루 일정': "This week's crew schedule",
  '크루 찾기': 'Find crews',
  주간: 'Weekly',
  월간: 'Monthly',
  연간: 'Yearly',
  '기록 분석': 'Record Analytics',
  '히스토리, 1km 스플릿, 누적 통계와 PR을 쉽게 돌아볼 수 있습니다.':
    'Review history, splits, cumulative stats, and PRs.',
  '기록 분석 기간': 'Record analytics period',
  '총 누적 거리': 'Total distance',
  '총 러닝': 'Total runs',
  '총 시간': 'Total time',
  '이번 주 1km 스플릿': 'This week 1km splits',
  '이번 달 1km 스플릿': 'This month 1km splits',
  '올해 대표 1km 스플릿': 'This year representative 1km splits',
  '이번 주 러닝 세션': 'This week running sessions',
  '이번 달 러닝 세션': 'This month running sessions',
  '올해 주요 러닝 세션': 'This year key running sessions',
  '러닝 기록 상세': 'Run Detail',
  '거리, 시간, 페이스, 칼로리와 모든 구간 기록을 확인합니다.':
    'Review distance, time, pace, calories, and every split.',
  거리: 'Distance',
  시간: 'Time',
  칼로리: 'Calories',
  '구간별 페이스': 'Split pace',
  '스플릿 보기 방식': 'Split view mode',
  전체: 'All',
  '메모와 사진': 'Memo and photos',
  '선택한 사진': 'Selected photo',
  '사진 없음': 'No photo',
  '러닝 메모': 'Run memo',
  되돌리기: 'Reset',
  '메모 저장': 'Save memo',
  '메모가 mock 데이터에 저장됐어요.': 'Memo was saved to mock data.',
  '기본 메모로 되돌렸어요.': 'Restored the default memo.',
  '현재 설정한 거리 목표와 달성 흐름을 먼저 확인합니다.':
    'Review your distance goal and progress first.',
  '목표 보기': 'View goal',
  '목표 설정': 'Goal Settings',
  '주간·월간 거리 목표를 직접 입력하고 수정합니다.':
    'Enter and edit weekly or monthly distance goals.',
  저장하기: 'Save',
  '거리 목표': 'Distance goal',
  '목표 이름': 'Goal name',
  기간: 'Period',
  '목표 기간': 'Goal period',
  '목표 거리': 'Target distance',
  '현재 거리': 'Current distance',
  시작일: 'Start date',
  종료일: 'End date',
  '거리 프리셋': 'Distance presets',
  '목표 미리보기': 'Goal preview',
  '저장 후 보기': 'Save and view',
  '목표가 mock 데이터에 저장됐어요.': 'Goal was saved to mock data.',
  '목표 이름과 목표 거리를 확인해주세요.': 'Check the goal name and target distance.',
  '뱃지 전체': 'All Badges',
  '획득한 뱃지와 아직 남은 조건을 한눈에 봅니다.':
    'View earned badges and remaining conditions at a glance.',
  '뱃지 상태 필터': 'Badge status filter',
  획득: 'Earned',
  미획득: 'Locked',
  '뱃지 상세': 'Badge Detail',
  '뱃지 조건과 달성 상태, 관련 기록을 확인합니다.':
    'Review badge conditions, progress, and related records.',
  '뱃지 목록': 'Badge list',
  '조건 달성': 'Condition progress',
  조건: 'Conditions',
  '관련 기록': 'Related records',
  '뱃지 상세 탭': 'Badge detail tabs',
  '획득 조건': 'Earn conditions',
  '게시글 작성으로 이동': 'Go write a post',
  '뱃지 첨부하기': 'Attach badge',
  '뱃지를 게시글 첨부 mock 상태로 준비했어요.': 'Badge is ready as a mock post attachment.',
  '게시글 작성': 'Write Post',
  '러닝 기록, 사진, 해시태그를 넣어 게시글을 작성합니다.':
    'Write a post with run records, photos, and hashtags.',
  게시하기: 'Publish',
  '새 게시글': 'New post',
  제목: 'Title',
  내용: 'Content',
  해시태그: 'Hashtags',
  '첨부 기록': 'Attached record',
  '게시글 카테고리': 'Post category',
  미리보기: 'Preview',
  '전체 피드': 'All feed',
  '오늘 올라온 러닝 이야기': "Today's running stories",
  게시글: 'Posts',
  댓글: 'Comments',
  좋아요: 'Likes',
  '전체 글': 'All posts',
  '게시글 정렬': 'Post sort',
  최신순: 'Latest',
  인기순: 'Popular',
  카테고리: 'Categories',
  '인기 해시태그': 'Popular hashtags',
  '활발한 크루': 'Active crews',
  '게시글 상세': 'Post Detail',
  '게시글 내용, 좋아요, 댓글, 공유를 확인합니다.':
    'Review post content, likes, comments, and shares.',
  공유: 'Share',
  등록: 'Submit',
  '댓글 입력': 'Comment input',
  '댓글을 입력하세요': 'Write a comment',
  '같은 크루 글': 'Same crew posts',
  '크루 만들기': 'Create crew',
  '지역, 페이스, 시간대로 크루를 탐색합니다.': 'Explore crews by area, pace, and time.',
  '크루 검색': 'Crew search',
  지역: 'Area',
  페이스: 'Pace',
  시간대: 'Time',
  레벨: 'Level',
  서울: 'Seoul',
  여의도: 'Yeouido',
  성수: 'Seongsu',
  '평일 저녁': 'Weekday evening',
  '평일 오전': 'Weekday morning',
  '주말 오전': 'Weekend morning',
  초급: 'Beginner',
  중급: 'Intermediate',
  멤버: 'Members',
  '크루 상세': 'Crew Detail',
  '크루 소개, 멤버, 모집글을 확인합니다.': 'Review crew intro, members, and recruit posts.',
  '모집글 만들기': 'Create recruit',
  모집글: 'Recruits',
  소개: 'Intro',
  '크루 상세 탭': 'Crew detail tabs',
  '모집글 작성': 'Create Recruit',
  '일정, 장소, 페이스, 인원, 모임 유형과 푸시 알림 여부를 설정합니다.':
    'Set schedule, place, pace, capacity, type, and push notifications.',
  '모집 정보': 'Recruit info',
  일정: 'Schedule',
  장소: 'Place',
  인원: 'Capacity',
  '모집 유형': 'Recruit type',
  '모집글 미리보기': 'Recruit preview',
  '모집글 상세': 'Recruit Detail',
  '모집글 정보와 참여 상태를 확인합니다.': 'Review recruit information and participation status.',
  참여하기: 'Join',
  '참여 취소': 'Cancel join',
  '상세 설명': 'Details',
  '참여 러너': 'Joined runners',
  '프로필 · 계정': 'Profile · Account',
  '공개 프로필, 크루, 뱃지와 공개 범위를 한 화면에서 정리합니다.':
    'Manage public profile, crews, badges, and privacy in one place.',
  팔로워: 'Followers',
  팔로잉: 'Following',
  '누적 거리': 'Total distance',
  러닝: 'Runs',
  뱃지: 'Badges',
  '프로필 편집': 'Edit profile',
  '공개 범위': 'Privacy',
  '내 크루': 'My crews',
  '계정 설정': 'Account settings',
  '설정 열기': 'Open settings',
  '닉네임, 이미지, 소개, 공개 범위를 수정합니다.': 'Edit nickname, image, bio, and privacy.',
  '프로필 보기': 'View profile',
  '프로필 정보': 'Profile info',
  닉네임: 'Nickname',
  '한 줄 소개': 'Bio',
  '프로필 공개 범위': 'Profile privacy',
  '프로필 미리보기': 'Profile preview',
  '한 줄 소개를 입력하세요.': 'Enter a short bio.',
  '공개 범위, 알림, 단위, 언어, 데이터와 계정을 관리합니다.':
    'Manage privacy, notifications, units, language, data, and account.',
  '설정 메뉴': 'Settings menu',
  '상세 설정': 'Details',
  '공개 범위 설정': 'Privacy settings',
  '알림 설정': 'Notification settings',
  '표시 설정': 'Display settings',
  '측정 단위': 'Measurement unit',
  언어: 'Language',
  한국어: 'Korean',
  '데이터 다운로드': 'Data download',
  '데이터 다운로드 옵션': 'Data download options',
  '차단한 사용자': 'Blocked users',
  '차단한 사용자 관리': 'Blocked user management',
  '버전/정보': 'Version/info',
  로그아웃: 'Logout',
  회원탈퇴: 'Delete account',
  '평균 페이스 5\'23"': 'average pace 5\'23"',
};

export function translate(value: string, language: WebLanguage) {
  return language === 'en' ? (translations[value] ?? value) : value;
}
