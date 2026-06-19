import { AuditLogViewer } from "./AuditLogViewer";

export function AuditLogPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
      <AuditLogViewer />
    </div>
  );
}
