import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../modules/users/entities/user.entity';

/** JwtStrategy.validate() 가 주입한 request.user 의 형태 */
export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
}

/**
 * 컨트롤러 핸들러에서 인증된 사용자를 꺼낸다.
 * JwtAuthGuard 가 선행되어야 request.user 가 존재한다.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
