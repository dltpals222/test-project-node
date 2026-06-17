export type RecordStatus = 'new' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export const RECORD_STATUSES: RecordStatus[] = [
  'new',
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
];

export interface RecordItem {
  id: number;
  name: string;
  phone: string;
  status: RecordStatus;
  assigned_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRecordRequest {
  name: string;
  phone: string;
}

export interface StatusHistoryItem {
  id: number;
  from_status: RecordStatus | null;
  to_status: RecordStatus;
  created_at: string;
  actor: string | null;
}

export interface MemoItem {
  id: number;
  content: string;
  is_important: boolean;
  created_at: string;
  author: string | null;
}
