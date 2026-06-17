'use client';

import { useState } from 'react';
import { useHistory, useMemos, useCreateMemo } from '@/features/records/hooks';
import type { RecordItem } from '@/features/records/types';
import { STATUS_LABEL } from '@/lib/leads';
import { StatusPill } from './status-pill';

function fmtDateTime(iso: string): string {
  return `${iso.slice(0, 10).replace(/-/g, '.')} ${iso.slice(11, 16)}`;
}

export function LeadDrawer({ record, onClose }: { record: RecordItem | null; onClose: () => void }) {
  const id = record?.id ?? null;
  const history = useHistory(id);
  const memos = useMemos(id);
  const createMemo = useCreateMemo(id ?? 0);
  const [memo, setMemo] = useState('');

  if (!record) return null;

  const addMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memo.trim()) return;
    createMemo.mutate({ content: memo.trim() }, { onSuccess: () => setMemo('') });
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="drawer">
        {/* header */}
        <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <div className="cell-id" style={{ marginBottom: 6 }}>#{String(record.id).padStart(3, '0')}</div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{record.name}</h2>
            </div>
            <button onClick={onClose} className="btn btn-ghost" style={{ padding: '6px 10px' }} aria-label="닫기">✕</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <StatusPill status={record.status} />
            <span className="cell-phone">{record.phone}</span>
          </div>
        </div>

        {/* scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 26 }}>
          {/* meta */}
          <section>
            <div className="eyebrow" style={{ marginBottom: 12 }}>정보</div>
            <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 9, columnGap: 16, fontSize: 13.5 }}>
              <dt style={{ color: 'var(--text-faint)' }}>등록일</dt>
              <dd className="mono" style={{ margin: 0, color: 'var(--text-dim)' }}>{fmtDateTime(record.created_at)}</dd>
              <dt style={{ color: 'var(--text-faint)' }}>배정일</dt>
              <dd className="mono" style={{ margin: 0, color: 'var(--text-dim)' }}>{record.assigned_at ? fmtDateTime(record.assigned_at) : '—'}</dd>
              <dt style={{ color: 'var(--text-faint)' }}>완료일</dt>
              <dd className="mono" style={{ margin: 0, color: 'var(--text-dim)' }}>{record.completed_at ? fmtDateTime(record.completed_at) : '—'}</dd>
            </dl>
          </section>

          {/* status history */}
          <section>
            <div className="eyebrow" style={{ marginBottom: 14 }}>상태 이력 · record_status_history</div>
            {history.isLoading ? (
              <span className="spinner" />
            ) : (history.data?.length ?? 0) === 0 ? (
              <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>아직 상태 변경 이력이 없습니다.</p>
            ) : (
              <div className="timeline">
                {history.data!.map((h) => (
                  <div className="tl-item" key={h.id}>
                    <div style={{ fontSize: 13.5 }}>
                      {h.from_status ? (
                        <>
                          <span style={{ color: 'var(--text-faint)' }}>{STATUS_LABEL[h.from_status]}</span>
                          <span style={{ color: 'var(--text-faint)', margin: '0 6px' }}>→</span>
                        </>
                      ) : null}
                      <span style={{ fontWeight: 600 }}>{STATUS_LABEL[h.to_status]}</span>
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 3 }}>
                      {fmtDateTime(h.created_at)} · {h.actor ?? '시스템'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* memos */}
          <section>
            <div className="eyebrow" style={{ marginBottom: 14 }}>메모 · record_memos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {memos.isLoading ? (
                <span className="spinner" />
              ) : (memos.data?.length ?? 0) === 0 ? (
                <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>등록된 메모가 없습니다.</p>
              ) : (
                memos.data!.map((m) => (
                  <div className="memo" key={m.id}>
                    <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{m.content}</div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 7 }}>
                      {m.author ?? '—'} · {fmtDateTime(m.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* memo composer */}
        <form onSubmit={addMemo} style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 9 }}>
          <input
            className="input"
            placeholder="메모 추가…"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={createMemo.isPending || !memo.trim()}>
            등록
          </button>
        </form>
      </aside>
    </>
  );
}
