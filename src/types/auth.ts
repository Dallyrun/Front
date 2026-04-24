export interface AuthToken {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  nickname: string;
  profileImageUrl?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type AgeGroup = 20 | 30 | 40 | 50 | 60;
export type Gender = 'MALE' | 'FEMALE';

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  ageGroup: AgeGroup;
  gender: Gender;
  /** 필수 — 반드시 파일 선택 후 제출해야 함. */
  profileImage: File;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}
