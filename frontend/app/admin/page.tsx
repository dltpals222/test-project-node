import { ConsoleShell } from '@/components/console-shell';
import { LeadsPanel } from '@/components/leads-panel';

export default function AdminPage() {
  return (
    <ConsoleShell active="dashboard">
      <LeadsPanel title="리드 대시보드" subtitle="전체 리드 현황과 배정 상태를 한눈에 관리합니다." />
    </ConsoleShell>
  );
}
