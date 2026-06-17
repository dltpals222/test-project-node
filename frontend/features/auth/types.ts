import type { Role } from '@/lib/auth';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SafeUser {
  id: number;
  username: string;
  role: Role;
  status: 'active' | 'suspended';
  suspended_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  accessToken: string;
  user: SafeUser;
  requiresPasswordChange: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
