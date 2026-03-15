import type { ObjectionHandlingEntry } from '@/lib/schemas';
import { Dashboard, DashboardCell } from '@/components/ui/dashboard';
import { DashboardCellTitle } from '@/components/ui/dashboard';

interface ObjectionDetailProps {
  entry: ObjectionHandlingEntry;
}

/** Single dashboard cell showing an objection as the title and its response as the body. */
export function ObjectionDetail({ entry }: ObjectionDetailProps) {
  return (
    <Dashboard>
      <DashboardCell size="full" height="auto">
        <DashboardCellTitle>{entry.objection}</DashboardCellTitle>
        <p className="mt-4 text-sm leading-relaxed">
          {entry.response}
        </p>
      </DashboardCell>
    </Dashboard>
  );
}
