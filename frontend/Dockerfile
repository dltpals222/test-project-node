# ---- builder: 의존성 설치 + Next 빌드(standalone) ----
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# rewrites() 의 API_URL 은 빌드 시점에 manifest 로 박히므로 빌드 인자로 주입한다.
ARG API_URL=http://backend:3001
ENV API_URL=$API_URL
RUN npm run build

# ---- runtime: standalone 서버만 복사한 경량 이미지 ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# standalone 산출물(server.js + 최소 node_modules) 과 정적 자산
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
