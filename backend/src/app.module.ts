import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { KnexModule } from 'nest-knexjs';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PartnersModule } from './modules/partners/partners.module';
import { RecordsModule } from './modules/records/records.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { IdentityModule } from './modules/identity/identity.module';

@Module({
  imports: [
    // env 는 instantiation 시점에 읽도록 forRootAsync 사용 (load-env 가 먼저 적재)
    KnexModule.forRootAsync({
      useFactory: () => ({
        config: {
          client: 'pg',
          connection: {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 5432,
            user: process.env.DB_USER || 'dummy',
            password: process.env.DB_PASSWORD || 'dev_password_123',
            database: process.env.DB_NAME || 'dummy_dev',
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
          },
          // 타임존 고정(원본 패턴)
          pool: {
            afterCreate: (
              conn: { query: (sql: string, cb: (err: Error | null) => void) => void },
              done: (err: Error | null, conn: unknown) => void,
            ) => {
              conn.query("SET TIME ZONE '+09:00'", (err) => done(err, conn));
            },
          },
        },
      }),
    }),
    AuthModule,
    UsersModule,
    PartnersModule,
    RecordsModule,
    AssignmentsModule,
    IdentityModule,
  ],
  providers: [
    {
      // 전역 요청 검증 (핸드오프 02 문서 §5)
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // DTO 미정의 필드 자동 제거
        forbidNonWhitelisted: true, // 원본 대비 한 단계 강화: 미정의 필드 포함 시 거부
        transform: true, // 타입 자동 변환
      }),
    },
  ],
})
export class AppModule {}
