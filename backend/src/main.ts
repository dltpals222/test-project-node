// ⚠️ env 적재는 반드시 최상단(다른 import 보다 먼저)에서 부수효과로 수행한다.
import './load-env';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { getJwtSecret } from './common/utils/jwt.config';

function corsOrigins(): (string | RegExp)[] {
  const fromEnv = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const defaults = ['http://localhost:3000', 'http://localhost:3001'];
  const list = fromEnv.length > 0 ? fromEnv : defaults;

  // 정규식 와일드카드 허용 예시(서브도메인 프리뷰 등)
  return [...list, /https:\/\/.*\.example\.pages\.dev$/];
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // 부팅 단계에서 JWT_SECRET 미정의면 즉시 실패 (원본 약점 개선)
  getJwtSecret();

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: corsOrigins(),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  // Swagger — 프로덕션 제외
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Dummy API')
      .setDescription('더미 프로젝트 API (핸드오프 명세 기반)')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(`서버 기동: http://localhost:${port}/api (DB: ${process.env.DB_NAME})`);
}

void bootstrap();
