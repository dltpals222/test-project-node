import type { Role } from '@/lib/auth';

export interface TeamUser {
  id: number;
  username: string;
  role: Role;
  status: 'active' | 'suspended';
  last_login_at: string | null;
  created_at: string;
}
