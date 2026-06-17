import { ConsoleShell } from '@/components/console-shell';
import { UsersPanel } from '@/components/users-panel';

export default function TeamPage() {
  return (
    <ConsoleShell active="team">
      <UsersPanel />
    </ConsoleShell>
  );
}
