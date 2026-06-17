import { Injectable } from '@nestjs/common';
import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';
import { AccountStatus, User, UserRole } from './entities/user.entity';

export interface CreateUserRow {
  username: string;
  password_hash: string;
  role: UserRole;
}

@Injectable()
export class UsersRepository {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  private get table() {
    return this.knex<User>('users');
  }

  findById(id: number): Promise<User | undefined> {
    return this.table.where({ id }).first();
  }

  findByUsername(username: string): Promise<User | undefined> {
    return this.table.where({ username }).first();
  }

  findAll(): Promise<User[]> {
    return this.table.orderBy('id', 'asc');
  }

  async create(row: CreateUserRow): Promise<User> {
    // 신규 계정은 임시 비번 상태(password_changed_at = NULL)로 생성 → 첫 로그인 강제 변경
    const [created] = await this.table
      .insert({
        username: row.username,
        password_hash: row.password_hash,
        role: row.role,
        status: 'active',
        password_changed_at: null,
      })
      .returning('*');
    return created;
  }

  // --- 로그인 보안 ---

  async incrementFailedAttempts(id: number): Promise<void> {
    await this.table.where({ id }).increment('failed_login_attempts', 1);
  }

  async lockAccount(id: number, lockedUntil: Date): Promise<void> {
    await this.table.where({ id }).update({
      failed_login_attempts: this.knex.raw('failed_login_attempts + 1'),
      locked_until: lockedUntil,
    });
  }

  async resetFailedAttempts(id: number): Promise<void> {
    await this.table.where({ id }).update({
      failed_login_attempts: 0,
      locked_until: null,
    });
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.table.where({ id }).update({ last_login_at: this.knex.fn.now() });
  }

  // --- 비밀번호 ---

  /** 비밀번호 변경: 해시 갱신 + password_changed_at 기록(임시 비번 상태 해제) */
  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await this.table.where({ id }).update({
      password_hash: passwordHash,
      password_changed_at: this.knex.fn.now(),
      updated_at: this.knex.fn.now(),
    });
  }

  /** 비밀번호 초기화: 임시 비번 해시 저장 + password_changed_at = NULL(다시 강제 변경) */
  async resetPassword(id: number, passwordHash: string): Promise<void> {
    await this.table.where({ id }).update({
      password_hash: passwordHash,
      password_changed_at: null,
      failed_login_attempts: 0,
      locked_until: null,
      updated_at: this.knex.fn.now(),
    });
  }

  // --- 계정 상태 ---

  async setStatus(id: number, status: AccountStatus): Promise<void> {
    await this.table.where({ id }).update({
      status,
      suspended_at: status === 'suspended' ? this.knex.fn.now() : null,
      updated_at: this.knex.fn.now(),
    });
  }
}
