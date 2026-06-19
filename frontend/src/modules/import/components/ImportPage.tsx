import { ProgramBreadcrumbs } from "@/modules/shared/components/ProgramBreadcrumbs";
import { CsvUpload } from "./CsvUpload";

export function ImportPage({ programId }: { programId: string }) {
  return (
    <div className="space-y-4">
      <ProgramBreadcrumbs programId={programId} currentLabel="Import CSV" />
      <CsvUpload programId={programId} />
    </div>
  );
}
