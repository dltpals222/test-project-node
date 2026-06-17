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
