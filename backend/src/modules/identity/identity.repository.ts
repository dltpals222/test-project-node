import { Injectable } from '@nestjs/common';
import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';
import {
  IdentityStatus,
  IdentityVerification,
} from './entities/identity-verification.entity';

export interface CreateIdentityRow {
  external_verification_id: string;
  phone: string;
  name: string | null;
  status: IdentityStatus;
  raw_response: unknown;
  verified_at: Date | null;
}

@Injectable()
export class IdentityRepository {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  private get table() {
    return this.knex<IdentityVerification>('identity_verifications');
  }

  findById(id: number): Promise<IdentityVerification | undefined> {
    return this.table.where({ id }).first();
  }

  async create(row: CreateIdentityRow): Promise<IdentityVerification> {
    const [created] = await this.table
      .insert({
        external_verification_id: row.external_verification_id,
        phone: row.phone,
        name: row.name,
        status: row.status,
        raw_response: row.raw_response
          ? this.knex.raw('?::jsonb', [JSON.stringify(row.raw_response)])
          : null,
        verified_at: row.verified_at,
      })
      .returning('*');
    return created;
  }
}
