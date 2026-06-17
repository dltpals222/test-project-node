import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/users/entities/user.entity';

export const ROLES_KEY = 'roles';

/**
 * 엔드포인트에 허용 역할을 부착한다. RolesGuard 와 함께 사용.
 * 예: @Roles('superadmin', 'admin')
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
