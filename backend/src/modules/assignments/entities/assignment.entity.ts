export type AssignmentStatus = 'assigned' | 'removed';

export interface AssignmentRow {
  id: number;
  record_id: number;
  partner_id: number;
  assigned_by: number | null;
  status: AssignmentStatus;
  created_at: Date;
  removed_at: Date | null;
  deleted_at: Date | null;
  deleted_by: number | null;
}
