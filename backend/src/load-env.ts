import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * 환경변수 로딩은 다른 어떤 모듈보다 먼저 실행되어야 한다.
 * (TypeScript→CommonJS 컴파일 시 import 문은 파일 최상단으로 끌어올려지므로,
 *  main.ts 에서 이 파일을 "가장 먼저" import 해 부수효과로 env 를 적재한다.)
 *
 * NODE_ENV 기반 파일 선택: local → .env.local, 그 외 → .env.{env}
 */
const env = process.env.NODE_ENV || 'local';
const envFile = env === 'local' ? '.env.local' : `.env.${env}`;
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
