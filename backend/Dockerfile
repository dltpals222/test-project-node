# ---- builder: 의존성 설치 + TS 빌드 ----
FROM node:22-slim AS builder
WORKDIR /app

# bcrypt 네이티브 빌드용 도구 (musl 아닌 glibc 이미지라 prebuild 가능성 높지만 안전하게 포함)
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY tsconfig.json nest-cli.json knexfile.js ./
COPY src ./src
COPY migrations ./migrations
COPY seeds ./seeds

RUN npm run build
# devDependencies 제거(컴파일된 bcrypt 등 runtime 의존성은 유지)
RUN npm prune --omit=dev

# ---- runtime ----
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=local

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/knexfile.js ./knexfile.js
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/seeds ./seeds
COPY package*.json ./
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["./docker-entrypoint.sh"]
