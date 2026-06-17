import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../decorators/current-user.decorator';
import { getJwtSecret } from '../utils/jwt.config';

interface JwtPayload {
  sub: number;
  username: string;
  role: AuthUser['role'];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  // 반환값이 request.user 로 주입된다.
  validate(payload: JwtPayload): AuthUser {
    return { id: payload.sub, username: payload.username, role: payload.role };
  }
}
