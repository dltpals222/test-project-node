export type UserRole = 'superadmin' | 'admin' | 'manager' | 'member';
export type AccountStatus = 'active' | 'suspended';

/** users 테이블의 전체 행 (민감 필드 포함) */
export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: UserRole;
  status: AccountStatus;
  failed_login_attempts: number;
  locked_until: Date | null;
  password_changed_at: Date | null;
  suspended_at: Date | null;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/** 응답으로 내보낼 때 제외해야 하는 민감 필드 */
export type UserWithoutSensitive = Omit<
  User,
  'password_hash' | 'failed_login_attempts' | 'locked_until' | 'password_changed_at'
>;

/** 민감 필드를 제거해 안전한 사용자 객체를 만든다. */
export function toSafeUser(user: User): UserWithoutSensitive {
  const {
    password_hash: _ph,
    failed_login_attempts: _fa,
    locked_until: _lu,
    password_changed_at: _pc,
    ...safe
  } = user;
  return safe;
}
