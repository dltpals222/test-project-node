export type RecordStatus = 'new' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export const RECORD_STATUSES: RecordStatus[] = [
  'new',
  'assigned',
  'in_progress',
  'completed',
  'cancelled',
];

export interface RecordRow {
  id: number;
  name: string;
  phone: string;
  status: RecordStatus;
  identity_verification_id: number | null;
  assigned_at: Date | null;
  completed_at: Date | null;
  deleted_at: Date | null;
  deleted_by: number | null;
  restored_at: Date | null;
  restored_by: number | null;
  created_at: Date;
  updated_at: Date;
}
