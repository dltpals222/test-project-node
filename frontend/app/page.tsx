'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from '@/features/auth/hooks';
import { roleHome } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  const { user } = useSession();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('dummy_access_token') : null;
    if (!token) router.replace('/login');
    else if (user) router.replace(roleHome(user.role));
  }, [router, user]);

  return (
    <div className="grid-texture" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div className="brand-mark" style={{ width: 40, height: 40, fontSize: 21 }}>R</div>
        <span className="spinner" />
        <span className="eyebrow">CONNECTING TO RELAY</span>
      </div>
    </div>
  );
}
