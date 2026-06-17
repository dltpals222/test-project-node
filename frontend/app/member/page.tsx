import { ConsoleShell } from '@/components/console-shell';
import { LeadsPanel } from '@/components/leads-panel';

export default function MemberPage() {
  return (
    <ConsoleShell active="dashboard">
      <LeadsPanel title="협력 리드" subtitle="배정받은 리드를 확인하고 상태를 업데이트합니다." />
    </ConsoleShell>
  );
}
