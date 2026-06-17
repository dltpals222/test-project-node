import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { Partner } from './entities/partner.entity';
import { PartnersRepository } from './partners.repository';

@Injectable()
export class PartnersService {
  constructor(private readonly partnersRepository: PartnersRepository) {}

  findAll(): Promise<Partner[]> {
    return this.partnersRepository.findAll();
  }

  async findOne(id: number): Promise<Partner> {
    const partner = await this.partnersRepository.findById(id);
    if (!partner) {
      throw new NotFoundException(`파트너(${id})를 찾을 수 없습니다`);
    }
    return partner;
  }

  async create(dto: CreatePartnerDto): Promise<Partner> {
    const existing = await this.partnersRepository.findByUserId(dto.user_id);
    if (existing) {
      throw new ConflictException('이미 파트너로 등록된 사용자입니다');
    }
    return this.partnersRepository.create(dto);
  }

  /** 사용자의 파트너 레코드를 반환(없으면 null). 배정 기반 RBAC 에서 사용. */
  findByUserId(userId: number): Promise<Partner | undefined> {
    return this.partnersRepository.findByUserId(userId);
  }
}
