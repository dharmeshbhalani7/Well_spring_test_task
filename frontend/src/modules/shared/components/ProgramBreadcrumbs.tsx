import Link from "next/link";

export function ProgramBreadcrumbs({
  programId,
  currentLabel,
}: {
  programId: string;
  currentLabel: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <Link href="/programs" className="hover:text-teal-600">
        Programs
      </Link>
      <span>/</span>
      <Link href={`/programs/${programId}`} className="hover:text-teal-600">
        Program
      </Link>
      <span>/</span>
      <span className="text-gray-900">{currentLabel}</span>
    </div>
  );
}
