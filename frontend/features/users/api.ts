import api from '@/lib/api';
import type { TeamUser } from './types';

export async function listUsers(): Promise<TeamUser[]> {
  const { data } = await api.get<TeamUser[]>('/users');
  return data;
}
