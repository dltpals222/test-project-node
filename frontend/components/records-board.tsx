'use client';

import { useState } from 'react';
import { useSession } from '@/features/auth/hooks';
import {
  useCreateRecord,
  useRecords,
  useUpdateRecordStatus,
} from '@/features/records/hooks';
import { RECORD_STATUSES, type RecordStatus } from '@/features/records/types';

const CAN_CREATE: ReadonlyArray<string> = ['superadmin', 'admin'];

export function RecordsBoard({ title }: { title: string }) {
  const { user, logout } = useSession();
  const records = useRecords();
  const createRecord = useCreateRecord();
  const updateStatus = useUpdateRecordStatus();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const canCreate = user ? CAN_CREATE.includes(user.role) : false;

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    createRecord.mutate(
      { name, phone },
      {
        onSuccess: () => {
          setName('');
          setPhone('');
        },
      },
    );
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {user && (
            <p className="text-sm text-gray-500">
              {user.username} ({user.role})
            </p>
          )}
        </div>
        <button onClick={logout} className="rounded border px-3 py-1 text-sm">
          로그아웃
        </button>
      </header>

      {canCreate && (
        <form onSubmit={submitCreate} className="flex flex-wrap items-end gap-2 rounded border p-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">이름</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded border px-2 py-1"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">전화번호</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded border px-2 py-1"
              placeholder="010-1234-5678"
            />
          </div>
          <button
            type="submit"
            disabled={createRecord.isPending}
            className="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            레코드 추가
          </button>
        </form>
      )}

      {records.isLoading && <p>불러오는 중…</p>}
      {records.isError && (
        <p className="text-red-600">목록을 불러오지 못했습니다. 로그인 상태를 확인하세요.</p>
      )}

      {records.data && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="p-2">ID</th>
              <th className="p-2">이름</th>
              <th className="p-2">전화</th>
              <th className="p-2">상태</th>
            </tr>
          </thead>
          <tbody>
            {records.data.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-2">{r.id}</td>
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.phone}</td>
                <td className="p-2">
                  <select
                    value={r.status}
                    onChange={(e) =>
                      updateStatus.mutate({ id: r.id, status: e.target.value as RecordStatus })
                    }
                    className="rounded border px-2 py-1"
                  >
                    {RECORD_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {records.data.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-400">
                  표시할 레코드가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </main>
  );
}
