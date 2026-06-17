import { Injectable } from '@nestjs/common';
import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';
import { Partner, PartnerType } from './entities/partner.entity';

export interface CreatePartnerRow {
  user_id: number;
  partner_type: PartnerType;
  name: string;
}

@Injectable()
export class PartnersRepository {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  private get table() {
    return this.knex<Partner>('partners');
  }

  findById(id: number): Promise<Partner | undefined> {
    return this.table.where({ id }).first();
  }

  findByUserId(userId: number): Promise<Partner | undefined> {
    return this.table.where({ user_id: userId }).first();
  }

  findAll(): Promise<Partner[]> {
    return this.table.orderBy('id', 'asc');
  }

  async create(row: CreatePartnerRow): Promise<Partner> {
    const [created] = await this.table.insert(row).returning('*');
    return created;
  }
}
