import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 도커 런타임 최소 이미지를 위한 standalone 출력
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
