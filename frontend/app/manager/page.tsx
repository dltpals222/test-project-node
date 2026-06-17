import { ConsoleShell } from '@/components/console-shell';
import { LeadsPanel } from '@/components/leads-panel';

export default function ManagerPage() {
  return (
    <ConsoleShell active="dashboard">
      <LeadsPanel title="담당 리드" subtitle="배정된 리드를 확인하고 진행 상태를 업데이트합니다." />
    </ConsoleShell>
  );
}
