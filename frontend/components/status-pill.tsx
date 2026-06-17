import { STATUS_LABEL } from '@/lib/leads';
import type { RecordStatus } from '@/features/records/types';

export function StatusPill({ status }: { status: RecordStatus }) {
  return (
    <span className="pill" data-s={status}>
      <span className="dot" />
      {STATUS_LABEL[status]}
    </span>
  );
}
