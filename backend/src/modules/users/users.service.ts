import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { generateTempPassword } from '../../common/utils/password.utils';
import { CreateUserDto } from './dto/create-user.dto';
import { toSafeUser, User, UserWithoutSensitive } from './entities/user.entity';
import { UsersRepository } from './users.repository';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(): Promise<UserWithoutSensitive[]> {
    const users = await this.usersRepository.findAll();
    return users.map(toSafeUser);
  }

  async findOne(id: number): Promise<UserWithoutSensitive> {
    const user = await this.requireUser(id);
    return toSafeUser(user);
  }

  /**
   * 관리자가 신규 계정을 생성한다.
   * 임시 비밀번호를 생성·해싱해 저장하고, 평문 임시 비번을 1회 반환한다.
   * (password_changed_at = NULL 이므로 첫 로그인 시 강제 변경)
   */
  async create(
    dto: CreateUserDto,
  ): Promise<{ user: UserWithoutSensitive; tempPassword: string }> {
    const existing = await this.usersRepository.findByUsername(dto.username);
    if (existing) {
      throw new ConflictException('이미 사용 중인 아이디입니다');
    }

    const tempPassword = generateTempPassword(12);
    const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_SALT_ROUNDS);

    const created = await this.usersRepository.create({
      username: dto.username,
      password_hash: passwordHash,
      role: dto.role,
    });

    return { user: toSafeUser(created), tempPassword };
  }

  /**
   * 비밀번호 초기화.
   * 비즈니스 규칙: admin 은 다른 admin 의 비밀번호를 초기화할 수 없다(superadmin 만 가능).
   * 임시 비번을 생성·저장하고 평문을 1회 반환한다.
   */
  async resetPassword(actor: AuthUser, targetId: number): Promise<{ tempPassword: string }> {
    const target = await this.requireUser(targetId);

    if (actor.role === 'admin' && target.role === 'admin' && actor.id !== target.id) {
      throw new ForbiddenException(
        '관리자는 다른 관리자 계정의 비밀번호를 초기화할 수 없습니다',
      );
    }
    if (actor.role !== 'superadmin' && target.role === 'superadmin') {
      throw new ForbiddenException('superadmin 계정의 비밀번호는 초기화할 수 없습니다');
    }

    const tempPassword = generateTempPassword(12);
    const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_SALT_ROUNDS);
    await this.usersRepository.resetPassword(target.id, passwordHash);

    return { tempPassword };
  }

  async suspend(actor: AuthUser, targetId: number): Promise<UserWithoutSensitive> {
    const target = await this.requireUser(targetId);
    if (target.role === 'superadmin') {
      throw new ForbiddenException('superadmin 계정은 정지할 수 없습니다');
    }
    if (actor.id === target.id) {
      throw new ForbiddenException('본인 계정은 정지할 수 없습니다');
    }
    await this.usersRepository.setStatus(target.id, 'suspended');
    return this.findOne(target.id);
  }

  async activate(targetId: number): Promise<UserWithoutSensitive> {
    await this.requireUser(targetId);
    await this.usersRepository.setStatus(targetId, 'active');
    return this.findOne(targetId);
  }

  private async requireUser(id: number): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`사용자(${id})를 찾을 수 없습니다`);
    }
    return user;
  }
}
