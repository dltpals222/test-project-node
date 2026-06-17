'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from '@/features/auth/hooks';
import { roleHome } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  const { user } = useSession();

  useEffect(() => {
    // 토큰이 있으면 역할 홈으로, 없으면 로그인으로
    const token = typeof window !== 'undefined' ? localStorage.getItem('dummy_access_token') : null;
    if (!token) {
      router.replace('/login');
    } else if (user) {
      router.replace(roleHome(user.role));
    }
  }, [router, user]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">이동 중…</p>
    </main>
  );
}
