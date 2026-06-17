import { Injectable, NotFoundException } from '@nestjs/common';
import { IdentityRepository } from './identity.repository';
import {
  IdentityVerification,
} from './entities/identity-verification.entity';
import { VerifyIdentityDto } from './dto/verify-identity.dto';

/**
 * 본인인증 더미 서비스.
 *
 * ⚠️ 비범위: 실제 외부 PG(PortOne 등) 호출은 하지 않는다(핸드오프 README 비범위).
 * 외부 연동 "인터페이스"만 흉내내어, 더미 external_verification_id 를 발급하고
 * 항상 VERIFIED 로 기록한다. 실제 연동 시 이 메서드 내부만 교체하면 된다.
 */
@Injectable()
export class IdentityService {
  constructor(private readonly identityRepository: IdentityRepository) {}

  async verify(dto: VerifyIdentityDto): Promise<IdentityVerification> {
    const externalId = this.generateDummyExternalId();
    return this.identityRepository.create({
      external_verification_id: externalId,
      phone: dto.phone,
      name: dto.name ?? null,
      status: 'VERIFIED',
      raw_response: { provider: 'dummy', verified: true, requestedName: dto.name ?? null },
      verified_at: new Date(),
    });
  }

  async findOne(id: number): Promise<IdentityVerification> {
    const found = await this.identityRepository.findById(id);
    if (!found) {
      throw new NotFoundException(`본인인증 기록(${id})을 찾을 수 없습니다`);
    }
    return found;
  }

  private generateDummyExternalId(): string {
    const rand = Math.random().toString(36).slice(2, 12);
    return `dummy_${rand}`;
  }
}
