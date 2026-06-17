'use client';

import type { ReactNode } from 'react';
import { useSession } from '@/features/auth/hooks';
import { ROLE_LABEL } from '@/lib/leads';
import { roleHome } from '@/lib/auth';

function Icon({ path }: { path: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  flow: 'M4 6h10M4 6a2 2 0 1 0 0-.01M14 6a2 2 0 1 0 4 0 2 2 0 0 0-4 0M10 18h10M6 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0M20 18a2 2 0 1 0-.01 0',
  shield: 'M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z',
  chart: 'M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-3',
  gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L16 2H8l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 3 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1c.6.5 1.3.9 2 1.2L8 22h8l.5-2.6c.7-.3 1.4-.7 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2',
  power: 'M12 4v8M7 7a7 7 0 1 0 10 0',
};

export function ConsoleShell({
  children,
  active = 'dashboard',
}: {
  children: ReactNode;
  active?: string;
}) {
  const { user, logout } = useSession();
  const home = user ? roleHome(user.role) : '/login';
  const isAdmin = user?.role === 'superadmin' || user?.role === 'admin';

  const nav = [
    { key: 'dashboard', label: '대시보드', icon: ICONS.grid, href: home, enabled: true },
    { key: 'assign', label: '배정 현황', icon: ICONS.flow, href: '#', enabled: false },
    { key: 'identity', label: '본인인증', icon: ICONS.shield, href: '#', enabled: false },
    { key: 'reports', label: '리포트', icon: ICONS.chart, href: '#', enabled: false },
    ...(isAdmin ? [{ key: 'settings', label: '설정', icon: ICONS.gear, href: '#', enabled: false }] : []),
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* sidebar */}
      <aside
        style={{
          width: 244,
          flexShrink: 0,
          borderRight: '1px solid var(--border)',
          background: 'var(--surface-1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '20px 20px 22px' }}>
          <div className="brand-mark">R</div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>Relay</div>
            <div className="eyebrow" style={{ marginTop: 3 }}>OPS CONSOLE</div>
          </div>
        </div>

        <nav style={{ padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.map((item) => {
            const isActive = item.enabled && item.key === active;
            return (
              <a
                key={item.key}
                href={item.enabled ? item.href : undefined}
                aria-disabled={!item.enabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '9px 12px',
                  borderRadius: 9,
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: isActive ? 'var(--text)' : item.enabled ? 'var(--text-dim)' : 'var(--text-faint)',
                  background: isActive ? 'var(--surface-3)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--border-strong)' : 'transparent'}`,
                  cursor: item.enabled ? 'pointer' : 'default',
                  textDecoration: 'none',
                  transition: 'background 0.12s ease, color 0.12s ease',
                }}
              >
                <span style={{ color: isActive ? 'var(--accent)' : 'inherit', display: 'flex' }}>
                  <Icon path={item.icon} />
                </span>
                {item.label}
                {!item.enabled && (
                  <span className="mono" style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--text-faint)', letterSpacing: '0.08em' }}>
                    SOON
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        <div style={{ marginTop: 'auto', padding: 16 }}>
          <div
            className="panel"
            style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 9, background: 'var(--surface-2)' }}
          >
            <span className="live-dot" />
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>시스템 정상</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>api · db · queue</div>
            </div>
          </div>
        </div>
      </aside>

      {/* main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '0 28px',
            height: 64,
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            background: 'color-mix(in srgb, var(--bg) 82%, transparent)',
            backdropFilter: 'blur(12px)',
            zIndex: 10,
          }}
        >
          <div
            className="input"
            style={{
              maxWidth: 320,
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '8px 12px',
              color: 'var(--text-faint)',
              cursor: 'text',
            }}
          >
            <Icon path="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3" />
            <span style={{ fontSize: 13 }}>리드·담당자 검색</span>
            <span className="mono" style={{ marginLeft: 'auto', fontSize: 10, padding: '1px 6px', border: '1px solid var(--border)', borderRadius: 5 }}>⌘K</span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
            {user && <span className="role-badge">{ROLE_LABEL[user.role]}</span>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div
                style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: 'var(--surface-3)', border: '1px solid var(--border-strong)',
                  display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, color: 'var(--accent)',
                }}
              >
                {(user?.username ?? '·').slice(0, 1).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{user?.username ?? '게스트'}</span>
            </div>
            <button onClick={logout} className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 12.5 }}>
              <Icon path={ICONS.power} />
              로그아웃
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: '28px', maxWidth: 1180, width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
