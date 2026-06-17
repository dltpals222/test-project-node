'use client';

import { useUsers } from '@/features/users/hooks';
import { ROLE_LABEL } from '@/lib/leads';

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return iso.slice(0, 10).replace(/-/g, '.');
}

export function UsersPanel() {
  const users = useUsers();
  const rows = users.data ?? [];

  return (
    <div className="rise">
      <div style={{ marginBottom: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>RELAY / TEAM</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>팀 관리</h1>
        <p style={{ margin: '6px 0 0', color: 'var(--text-dim)', fontSize: 14 }}>
          콘솔 계정과 역할(RBAC)을 확인합니다. 관리자 전용 화면입니다.
        </p>
      </div>

      <div className="panel" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <span className="live-dot" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>계정 목록</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
            {users.isLoading ? 'loading' : `${rows.length} users`}
          </span>
        </div>

        {users.isLoading ? (
          <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><span className="spinner" /></div>
        ) : users.isError ? (
          <div style={{ padding: 36, textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
            목록을 불러오지 못했습니다. (관리자 권한 필요)
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dtable">
              <thead>
                <tr>
                  <th style={{ width: 64 }}>ID</th>
                  <th>아이디</th>
                  <th>역할</th>
                  <th>상태</th>
                  <th>마지막 로그인</th>
                  <th>가입일</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td className="cell-id">#{String(u.id).padStart(3, '0')}</td>
                    <td style={{ fontWeight: 600 }}>{u.username}</td>
                    <td><span className="role-badge">{ROLE_LABEL[u.role]}</span></td>
                    <td>
                      <span className="pill" data-s={u.status === 'active' ? 'completed' : 'cancelled'}>
                        <span className="dot" />
                        {u.status === 'active' ? '활성' : '정지'}
                      </span>
                    </td>
                    <td className="cell-id">{fmtDate(u.last_login_at)}</td>
                    <td className="cell-id">{fmtDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
