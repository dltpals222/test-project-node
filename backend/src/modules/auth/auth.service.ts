import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { getJwtSecret, JWT_EXPIRES_IN } from '../../common/utils/jwt.config';
import { toSafeUser, User, UserWithoutSensitive } from '../users/entities/user.entity';
import { UsersRepository } from '../users/users.repository';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;
const BCRYPT_SALT_ROUNDS = 10;

export interface LoginResult {
  accessToken: string;
  user: UserWithoutSensitive;
  requiresPasswordChange: boolean;
}

@Injectable()
export class AuthService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.usersRepository.findByUsername(dto.username);

    // 사용자 미존재도 비밀번호 불일치와 동일 메시지로 응답(계정 열거 방지)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 1) 잠금 상태 확인
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new UnauthorizedException(
        '계정이 일시적으로 잠겼습니다. 잠시 후 다시 시도하세요',
      );
    }

    // 2) 계정 상태 확인
    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is suspended');
    }

    // 3) 비밀번호 검증
    const isValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isValid) {
      await this.registerFailedAttempt(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4) 성공 → 실패 카운트 리셋
    await this.usersRepository.resetFailedAttempts(user.id);

    // 5) 첫 로그인(임시 비번) 여부 → 강제 변경 플래그
    const requiresPasswordChange = !user.password_changed_at;
    if (!requiresPasswordChange) {
      await this.usersRepository.updateLastLogin(user.id);
    }

    return {
      accessToken: this.signToken(user),
      user: toSafeUser(user),
      requiresPasswordChange,
    };
  }

  async changePassword(actor: AuthUser, dto: ChangePasswordDto): Promise<{ success: true }> {
    const user = await this.usersRepository.findById(actor.id);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedException('현재 비밀번호가 일치하지 않습니다');
    }

    const isSame = await bcrypt.compare(dto.newPassword, user.password_hash);
    if (isSame) {
      throw new BadRequestException('새 비밀번호는 기존 비밀번호와 달라야 합니다');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_SALT_ROUNDS);
    await this.usersRepository.updatePassword(user.id, passwordHash);

    return { success: true };
  }

  private async registerFailedAttempt(user: User): Promise<void> {
    const attempts = user.failed_login_attempts + 1;
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
      await this.usersRepository.lockAccount(user.id, lockedUntil);
    } else {
      await this.usersRepository.incrementFailedAttempts(user.id);
    }
  }

  private signToken(user: User): string {
    const payload = { sub: user.id, username: user.username, role: user.role };
    return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
  }
}
