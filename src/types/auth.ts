export interface AuthTokens {
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

export type AgeBracket = 20 | 30 | 40 | 50 | 60;
export type Gender = 'MALE' | 'FEMALE';

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
  ageBracket: AgeBracket;
  gender: Gender;
  profileImage: File;
}

/** 서버 공통 성공 응답 래퍼: `{ "data": T }` */
export interface ApiEnvelope<T> {
  data: T;
}

/** 서버 공통 에러 바디: `{ "message": "..." }` */
export interface ApiErrorBody {
  message?: string;
}
