import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PartnersService } from '../partners/partners.service';
import { RecordsRepository } from '../records/records.repository';
import { AssignmentsRepository } from './assignments.repository';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { AssignmentRow } from './entities/assignment.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly assignmentsRepository: AssignmentsRepository,
    private readonly recordsRepository: RecordsRepository,
    private readonly partnersService: PartnersService,
  ) {}

  async listByRecord(recordId: number): Promise<AssignmentRow[]> {
    await this.requireActiveRecord(recordId);
    return this.assignmentsRepository.findActiveByRecord(recordId);
  }

  async assign(actor: AuthUser, dto: CreateAssignmentDto): Promise<AssignmentRow> {
    await this.requireActiveRecord(dto.record_id);
    await this.partnersService.findOne(dto.partner_id); // 존재 검증(없으면 404)

    const assignment = await this.assignmentsRepository.assign(
      dto.record_id,
      dto.partner_id,
      actor.id,
    );
    await this.recordsRepository.markAssigned(dto.record_id);
    return assignment;
  }

  async remove(
    actor: AuthUser,
    recordId: number,
    partnerId: number,
  ): Promise<{ success: true }> {
    await this.requireActiveRecord(recordId);
    await this.assignmentsRepository.remove(recordId, partnerId, actor.id);
    return { success: true };
  }

  private async requireActiveRecord(recordId: number): Promise<void> {
    const record = await this.recordsRepository.findActiveById(recordId);
    if (!record) {
      throw new NotFoundException(`레코드(${recordId})를 찾을 수 없습니다`);
    }
  }
}
