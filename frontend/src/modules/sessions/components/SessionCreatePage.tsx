import { ProgramBreadcrumbs } from "@/modules/shared/components/ProgramBreadcrumbs";
import { SessionForm } from "./SessionForm";

export function SessionCreatePage({ programId }: { programId: string }) {
  return (
    <div className="space-y-4">
      <ProgramBreadcrumbs programId={programId} currentLabel="New session" />
      <SessionForm programId={programId} />
    </div>
  );
}
