#!/bin/sh
set -e

# postgres 는 compose 의 depends_on(service_healthy) 로 이미 준비된 상태로 가정.
echo "[entrypoint] 마이그레이션 실행..."
npx knex migrate:latest --env local

echo "[entrypoint] 시드 실행..."
npx knex seed:run --env local

echo "[entrypoint] 서버 기동..."
exec node dist/main.js
