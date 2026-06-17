'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMemo,
  createRecord,
  getHistory,
  getMemos,
  listRecords,
  updateRecordStatus,
} from './api';
import type { CreateRecordRequest, RecordStatus } from './types';

const RECORDS_KEY = ['records'];

export function useRecords() {
  return useQuery({ queryKey: RECORDS_KEY, queryFn: listRecords });
}

export function useCreateRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRecordRequest) => createRecord(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: RECORDS_KEY }),
  });
}

export function useUpdateRecordStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: RecordStatus }) =>
      updateRecordStatus(id, status),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: RECORDS_KEY });
      qc.invalidateQueries({ queryKey: ['history', vars.id] });
    },
  });
}

export function useHistory(id: number | null) {
  return useQuery({
    queryKey: ['history', id],
    queryFn: () => getHistory(id as number),
    enabled: id !== null,
  });
}

export function useMemos(id: number | null) {
  return useQuery({
    queryKey: ['memos', id],
    queryFn: () => getMemos(id as number),
    enabled: id !== null,
  });
}

export function useCreateMemo(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { content: string; is_important?: boolean }) => createMemo(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['memos', id] }),
  });
}
