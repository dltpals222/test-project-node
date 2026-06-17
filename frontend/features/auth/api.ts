import api from '@/lib/api';
import type { ChangePasswordRequest, LoginRequest, LoginResponse } from './types';

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', body);
  return data;
}

export async function changePassword(body: ChangePasswordRequest): Promise<{ success: true }> {
  const { data } = await api.post<{ success: true }>('/auth/change-password', body);
  return data;
}
