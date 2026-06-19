export interface Creator {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface AuthResponse {
  creator: Creator;
  token: string;
}

export interface Program {
  id: string;
  tenantId: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { sessions: number };
}

export interface Session {
  id: string;
  tenantId: string;
  programId: string;
  position: number;
  title: string;
  durationSeconds: number;
  instructorName: string;
  tags: string[];
  mediaUrl: string | null;
  clientRowId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ImportRowResult {
  rowNumber: number;
  clientRowId?: string;
  status: "success" | "error" | "skipped";
  errors?: string[];
  sessionId?: string;
}

export interface ImportResult {
  jobId: string;
  succeeded: number;
  failed: number;
  rows: ImportRowResult[];
}

export interface PresignResult {
  uploadUrl: string;
  mediaUrl: string;
  key: string;
  expiresAt: string;
}

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "REORDER"
  | "BULK_IMPORT";

export interface AuditLog {
  id: string;
  tenantId: string;
  actorId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
