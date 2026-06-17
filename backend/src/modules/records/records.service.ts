import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PartnersService } from '../partners/partners.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RecordRow } from './entities/record.entity';
import { RecordsRepository } from './records.repository';

/** 전체 데이터 접근 권한을 가진 역할 */
const FULL_ACCESS_ROLES = ['superadmin', 'admin'] as const;

@Injectable()
export class RecordsService {
  constructor(
    private readonly recordsRepository: RecordsRepository,
    private readonly partnersService: PartnersService,
  ) {}

  private hasFullAccess(actor: AuthUser): boolean {
    return (FULL_ACCESS_ROLES as readonly string[]).includes(actor.role);
  }

  /** manager/member 의 파트너 id 를 해석. 파트너 매핑이 없으면 접근 불가. */
  private async requirePartnerId(actor: AuthUser): Promise<number> {
    const partner = await this.partnersService.findByUserId(actor.id);
    if (!partner) {
      throw new ForbiddenException('연결된 파트너 정보가 없어 레코드에 접근할 수 없습니다');
    }
    return partner.id;
  }

  async findAll(actor: AuthUser): Promise<RecordRow[]> {
    if (this.hasFullAccess(actor)) {
      return this.recordsRepository.findAllActive();
    }
    const partnerId = await this.requirePartnerId(actor);
    return this.recordsRepository.findAssignedToPartner(partnerId);
  }

  /**
   * 단건 조회. 2차 RBAC: manager/member 는 자신에게 배정된 레코드만 볼 수 있다.
   * 접근 불가 시 존재 여부 노출을 막기 위해 NotFound 로 응답한다.
   */
  async findOne(actor: AuthUser, id: number): Promise<RecordRow> {
    const record = await this.recordsRepository.findActiveById(id);
    if (!record) {
      throw new NotFoundException(`레코드(${id})를 찾을 수 없습니다`);
    }

    if (!this.hasFullAccess(actor)) {
      const partnerId = await this.requirePartnerId(actor);
      const allowed = await this.recordsRepository.hasActiveAssignment(id, partnerId);
      if (!allowed) {
        throw new NotFoundException(`레코드(${id})를 찾을 수 없습니다`);
      }
    }

    return record;
  }

  create(dto: CreateRecordDto): Promise<RecordRow> {
    return this.recordsRepository.create(dto);
  }

  async updateStatus(
    actor: AuthUser,
    id: number,
    dto: UpdateStatusDto,
  ): Promise<RecordRow> {
    // findOne 이 2차 RBAC(배정 확인)까지 수행한다.
    const record = await this.findOne(actor, id);
    if (record.status === dto.status) {
      return record;
    }

    const updated = await this.recordsRepository.updateStatus(id, dto.status);
    await this.recordsRepository.insertStatusHistory(
      id,
      actor.id,
      record.status,
      dto.status,
    );
    return updated;
  }

  // --- soft delete / restore (full-access 역할 전용, 컨트롤러 @Roles 로 강제) ---

  async softDelete(actor: AuthUser, id: number): Promise<{ success: true }> {
    const record = await this.recordsRepository.findActiveById(id);
    if (!record) {
      throw new NotFoundException(`레코드(${id})를 찾을 수 없습니다`);
    }
    await this.recordsRepository.softDelete(id, actor.id);
    return { success: true };
  }

  async restore(actor: AuthUser, id: number): Promise<RecordRow> {
    const record = await this.recordsRepository.findById(id);
    if (!record) {
      throw new NotFoundException(`레코드(${id})를 찾을 수 없습니다`);
    }
    if (!record.deleted_at) {
      throw new ForbiddenException('삭제되지 않은 레코드는 복원할 수 없습니다');
    }
    return this.recordsRepository.restore(id, actor.id);
  }

  findArchived(): Promise<RecordRow[]> {
    return this.recordsRepository.findArchived();
  }
}
