export type UserRole = 'Admin' | 'Customer';
export type AuthScope = 'admin' | 'customer';

export interface AuthUser {
  id: number;
  name?: string;
  email: string;
  role: UserRole;
  country?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  country: string;
}

export interface RawAuthUser {
  id: number | string;
  name?: string | null;
  email: string;
  role?: string | null;
  country?: string | null;
}

export interface LoginResponse {
  token: string;
  user?: RawAuthUser;
  message?: string;
}

export interface LoginResult {
  scope: AuthScope;
  token: string;
  user: RawAuthUser | null;
}

