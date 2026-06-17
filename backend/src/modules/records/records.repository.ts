import { Injectable } from '@nestjs/common';
import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';
import { RecordRow, RecordStatus } from './entities/record.entity';

export interface CreateRecordRow {
  name: string;
  phone: string;
}

@Injectable()
export class RecordsRepository {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  private get table() {
    return this.knex<RecordRow>('records');
  }

  /** 활성(soft delete 되지 않은) 레코드 전체 */
  findAllActive(): Promise<RecordRow[]> {
    return this.table.whereNull('deleted_at').orderBy('id', 'desc');
  }

  /** 특정 파트너에게 배정된 활성 레코드만 (배정 기반 RBAC) */
  findAssignedToPartner(partnerId: number): Promise<RecordRow[]> {
    return this.table
      .whereNull('records.deleted_at')
      .whereIn('records.id', (qb) => {
        qb.select('record_id')
          .from('record_assignments')
          .where('partner_id', partnerId)
          .andWhere('status', 'assigned')
          .whereNull('deleted_at');
      })
      .orderBy('records.id', 'desc');
  }

  findActiveById(id: number): Promise<RecordRow | undefined> {
    return this.table.where({ id }).whereNull('deleted_at').first();
  }

  /** (record_id, partner_id) 에 활성 배정이 존재하는지 — 배정 기반 RBAC 의 핵심 판정 */
  async hasActiveAssignment(recordId: number, partnerId: number): Promise<boolean> {
    const row = await this.knex('record_assignments')
      .where({ record_id: recordId, partner_id: partnerId, status: 'assigned' })
      .whereNull('deleted_at')
      .first();
    return !!row;
  }

  findById(id: number): Promise<RecordRow | undefined> {
    return this.table.where({ id }).first();
  }

  /** 보관함: soft delete 된 레코드 */
  findArchived(): Promise<RecordRow[]> {
    return this.table.whereNotNull('deleted_at').orderBy('deleted_at', 'desc');
  }

  async create(row: CreateRecordRow): Promise<RecordRow> {
    const [created] = await this.table.insert(row).returning('*');
    return created;
  }

  async updateStatus(id: number, status: RecordStatus): Promise<RecordRow> {
    const patch: Partial<RecordRow> = {
      status,
      updated_at: this.knex.fn.now() as unknown as Date,
    };
    if (status === 'completed') {
      patch.completed_at = this.knex.fn.now() as unknown as Date;
    }
    const [updated] = await this.table.where({ id }).update(patch).returning('*');
    return updated;
  }

  /** 첫 배정 시 assigned_at 을 채우고, 상태가 'new' 이면 'assigned' 로 올린다. */
  async markAssigned(id: number): Promise<void> {
    const record = await this.findActiveById(id);
    if (!record) return;
    const patch: Partial<RecordRow> = { updated_at: this.knex.fn.now() as unknown as Date };
    if (!record.assigned_at) {
      patch.assigned_at = this.knex.fn.now() as unknown as Date;
    }
    if (record.status === 'new') {
      patch.status = 'assigned';
    }
    await this.table.where({ id }).update(patch);
  }

  async softDelete(id: number, userId: number): Promise<void> {
    await this.table.where({ id }).whereNull('deleted_at').update({
      deleted_at: this.knex.fn.now() as unknown as Date,
      deleted_by: userId,
    });
  }

  async restore(id: number, userId: number): Promise<RecordRow> {
    const [restored] = await this.table
      .where({ id })
      .whereNotNull('deleted_at')
      .update({
        deleted_at: null,
        deleted_by: null,
        restored_at: this.knex.fn.now() as unknown as Date,
        restored_by: userId,
      })
      .returning('*');
    return restored;
  }

  /** 상태 변경 이력 기록 (감사) */
  async insertStatusHistory(
    recordId: number,
    userId: number,
    fromStatus: RecordStatus | null,
    toStatus: RecordStatus,
  ): Promise<void> {
    await this.knex('record_status_history').insert({
      record_id: recordId,
      user_id: userId,
      from_status: fromStatus,
      to_status: toStatus,
    });
  }

  /** 상태 변경 이력 (감사) — 변경 주체 username 조인 */
  getStatusHistory(recordId: number) {
    return this.knex('record_status_history as h')
      .leftJoin('users as u', 'u.id', 'h.user_id')
      .where('h.record_id', recordId)
      .orderBy('h.id', 'desc')
      .select(
        'h.id',
        'h.from_status',
        'h.to_status',
        'h.created_at',
        'u.username as actor',
      );
  }

  /** 메모 목록 — 작성자 username 조인 */
  listMemos(recordId: number) {
    return this.knex('record_memos as m')
      .leftJoin('users as u', 'u.id', 'm.user_id')
      .where('m.record_id', recordId)
      .orderBy('m.id', 'desc')
      .select(
        'm.id',
        'm.content',
        'm.is_important',
        'm.created_at',
        'u.username as author',
      );
  }

  async createMemo(
    recordId: number,
    userId: number,
    content: string,
    isImportant: boolean,
  ) {
    const [created] = await this.knex('record_memos')
      .insert({
        record_id: recordId,
        user_id: userId,
        content,
        is_important: isImportant,
      })
      .returning('*');
    return created;
  }
}
