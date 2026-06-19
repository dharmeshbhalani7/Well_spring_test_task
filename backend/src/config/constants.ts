export const AUDIT_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "REORDER",
  "BULK_IMPORT",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const ENTITY_TYPES = ["program", "session", "import_job"] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export const IMPORT_ROW_STATUS = ["success", "error", "skipped"] as const;

export type ImportRowStatus = (typeof IMPORT_ROW_STATUS)[number];

export const IMPORT_JOB_STATUS = ["completed", "failed"] as const;

export type ImportJobStatus = (typeof IMPORT_JOB_STATUS)[number];
