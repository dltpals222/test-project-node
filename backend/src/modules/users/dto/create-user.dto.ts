import { IsEnum, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

const USER_ROLES: UserRole[] = ['superadmin', 'admin', 'manager', 'member'];

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: '아이디는 영문, 숫자, _ . - 만 사용할 수 있습니다',
  })
  username: string;

  @IsEnum(USER_ROLES, { message: 'role 은 superadmin, admin, manager, member 중 하나여야 합니다' })
  role: UserRole;
}
