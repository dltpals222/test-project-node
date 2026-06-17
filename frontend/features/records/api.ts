import api from '@/lib/api';
import type { CreateRecordRequest, RecordItem, RecordStatus } from './types';

export async function listRecords(): Promise<RecordItem[]> {
  const { data } = await api.get<RecordItem[]>('/records');
  return data;
}

export async function createRecord(body: CreateRecordRequest): Promise<RecordItem> {
  const { data } = await api.post<RecordItem>('/records', body);
  return data;
}

export async function updateRecordStatus(
  id: number,
  status: RecordStatus,
): Promise<RecordItem> {
  const { data } = await api.patch<RecordItem>(`/records/${id}/status`, { status });
  return data;
}
