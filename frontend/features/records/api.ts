import api from '@/lib/api';
import type {
  CreateRecordRequest,
  MemoItem,
  RecordItem,
  RecordStatus,
  StatusHistoryItem,
} from './types';

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

export async function getHistory(id: number): Promise<StatusHistoryItem[]> {
  const { data } = await api.get<StatusHistoryItem[]>(`/records/${id}/history`);
  return data;
}

export async function getMemos(id: number): Promise<MemoItem[]> {
  const { data } = await api.get<MemoItem[]>(`/records/${id}/memos`);
  return data;
}

export async function createMemo(
  id: number,
  body: { content: string; is_important?: boolean },
): Promise<MemoItem> {
  const { data } = await api.post<MemoItem>(`/records/${id}/memos`, body);
  return data;
}
