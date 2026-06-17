'use client';

import { useMemo, useState } from 'react';
import { useSession } from '@/features/auth/hooks';
import {
  useCreateRecord,
  useRecords,
  useUpdateRecordStatus,
} from '@/features/records/hooks';
import { RECORD_STATUSES, type RecordItem, type RecordStatus } from '@/features/records/types';
import { STATUS_LABEL } from '@/lib/leads';
import { StatusPill } from './status-pill';

const CAN_CREATE = ['superadmin', 'admin'];

function fmtDate(iso: string): string {
  // ISO 문자열을 결정적으로 포맷 (hydration 안전)
  return iso.slice(0, 10).replace(/-/g, '.');
}

export function LeadsPanel({ title, subtitle }: { title: string; subtitle: string }) {
  const { user } = useSession();
  const records = useRecords();
  const createRecord = useCreateRecord();
  const updateStatus = useUpdateRecordStatus();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [formErr, setFormErr] = useState<string | null>(null);

  const canCreate = user ? CAN_CREATE.includes(user.role) : false;
  const rows: RecordItem[] = records.data ?? [];

  const stats = useMemo(() => {
    const by = (s: RecordStatus) => rows.filter((r) => r.status === s).length;
    const done = by('completed');
    const rate = rows.length ? Math.round((done / rows.length) * 100) : 0;
    return [
      { label: '전체 리드', value: rows.length, accent: true },
      { label: '신규', value: by('new') },
      { label: '진행중', value: by('in_progress') },
      { label: '완료율', value: `${rate}%`, sub: `${done}건 완료` },
    ];
  }, [rows]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr(null);
    if (!name.trim() || !phone.trim()) {
      setFormErr('이름과 연락처를 입력하세요.');
      return;
    }
    createRecord.mutate(
      { name: name.trim(), phone: phone.trim() },
      {
        onSuccess: () => {
          setName('');
          setPhone('');
          setOpen(false);
        },
        onError: () => setFormErr('등록에 실패했습니다. 연락처 형식을 확인하세요.'),
      },
    );
  };

  return (
    <div className="rise">
      {/* page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>RELAY / LEADS</div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>{title}</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--text-dim)', fontSize: 14 }}>{subtitle}</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setOpen((v) => !v)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            새 리드
          </button>
        )}
      </div>

      {/* stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 14 }}>
        {stats.map((s, i) => (
          <div className="stat rise" key={s.label} style={{ animationDelay: `${i * 60}ms` }}>
            <div className="stat-value" style={{ color: s.accent ? 'var(--accent)' : 'var(--text)' }}>
              {records.isLoading ? '—' : s.value}
            </div>
            <div className="stat-label">{s.label}{s.sub ? ` · ${s.sub}` : ''}</div>
          </div>
        ))}
      </div>

      {/* create form */}
      {canCreate && open && (
        <form onSubmit={submit} className="panel rise" style={{ padding: 18, marginBottom: 14, display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="field-label">이름</label>
            <input className="input" style={{ marginTop: 6 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label className="field-label">연락처</label>
            <input className="input" style={{ marginTop: 6 }} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={createRecord.isPending}>
            {createRecord.isPending ? '등록 중…' : '리드 등록'}
          </button>
          {formErr && <div style={{ flexBasis: '100%', color: 'var(--danger)', fontSize: 13 }}>{formErr}</div>}
        </form>
      )}

      {/* table panel */}
      <div className="panel" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <span className="live-dot" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>리드 목록</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
            {records.isLoading ? 'loading' : `${rows.length} records`}
          </span>
        </div>

        {records.isLoading ? (
          <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
            <span className="spinner" />
          </div>
        ) : records.isError ? (
          <div style={{ padding: 36, textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
            목록을 불러오지 못했습니다. 로그인 상태를 확인하세요.
          </div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>표시할 리드가 없습니다</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13.5 }}>
              {canCreate ? '“새 리드”로 첫 리드를 등록해 보세요.' : '아직 배정된 리드가 없습니다.'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dtable">
              <thead>
                <tr>
                  <th style={{ width: 64 }}>ID</th>
                  <th>이름</th>
                  <th>연락처</th>
                  <th>등록일</th>
                  <th>상태</th>
                  <th style={{ width: 150 }}>상태 변경</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="cell-id">#{String(r.id).padStart(3, '0')}</td>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td className="cell-phone">{r.phone}</td>
                    <td className="cell-id">{fmtDate(r.created_at)}</td>
                    <td><StatusPill status={r.status} /></td>
                    <td>
                      <select
                        className="input"
                        style={{ padding: '6px 10px', fontSize: 12.5 }}
                        value={r.status}
                        disabled={updateStatus.isPending}
                        onChange={(e) => updateStatus.mutate({ id: r.id, status: e.target.value as RecordStatus })}
                      >
                        {RECORD_STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                        ))}
                      </select>
                    </td>
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
