import { Injectable } from '@nestjs/common';
import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';
import { AssignmentRow } from './entities/assignment.entity';

@Injectable()
export class AssignmentsRepository {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  private get table() {
    return this.knex<AssignmentRow>('record_assignments');
  }

  /** (record_id, partner_id) 에 활성 배정이 존재하는지 — 배정 기반 RBAC 의 핵심 판정 */
  async existsActive(recordId: number, partnerId: number): Promise<boolean> {
    const row = await this.table
      .where({ record_id: recordId, partner_id: partnerId, status: 'assigned' })
      .whereNull('deleted_at')
      .first();
    return !!row;
  }

  findActiveByRecord(recordId: number): Promise<AssignmentRow[]> {
    return this.table
      .where({ record_id: recordId, status: 'assigned' })
      .whereNull('deleted_at')
      .orderBy('id', 'asc');
  }

  findExisting(recordId: number, partnerId: number): Promise<AssignmentRow | undefined> {
    return this.table.where({ record_id: recordId, partner_id: partnerId }).first();
  }

  async assign(
    recordId: number,
    partnerId: number,
    assignedBy: number,
  ): Promise<AssignmentRow> {
    // UNIQUE(record_id, partner_id) 때문에 기존 행이 있으면 재활성화(upsert)한다.
    const existing = await this.findExisting(recordId, partnerId);
    if (existing) {
      const [reactivated] = await this.table
        .where({ id: existing.id })
        .update({
          status: 'assigned',
          assigned_by: assignedBy,
          removed_at: null,
          deleted_at: null,
          deleted_by: null,
        })
        .returning('*');
      return reactivated;
    }

    const [created] = await this.table
      .insert({
        record_id: recordId,
        partner_id: partnerId,
        assigned_by: assignedBy,
        status: 'assigned',
      })
      .returning('*');
    return created;
  }

  async remove(recordId: number, partnerId: number, removedBy: number): Promise<void> {
    await this.table
      .where({ record_id: recordId, partner_id: partnerId })
      .whereNull('deleted_at')
      .update({
        status: 'removed',
        removed_at: this.knex.fn.now() as unknown as Date,
        deleted_at: this.knex.fn.now() as unknown as Date,
        deleted_by: removedBy,
      });
  }
}
