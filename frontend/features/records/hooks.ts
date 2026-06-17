'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRecord, listRecords, updateRecordStatus } from './api';
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
    onSuccess: () => qc.invalidateQueries({ queryKey: RECORDS_KEY }),
  });
}
