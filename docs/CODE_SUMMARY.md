# Code Summary

Welcome to **Wellspring** — a multi-tenant admin panel where wellness creators manage programs and sessions. This doc walks through each major module so you know where things live and how they fit together on day one.

The repo splits into `backend/` (Express + Prisma API) and `frontend/` (Next.js admin UI). Both sides mirror the same domain modules under `backend/src/serviceLogic/` and `frontend/src/modules/`.

---

## How the backend is organized

Every domain module follows the same shape:

```
serviceLogic/<module>/
  <module>.app.ts       # Express sub-router; mounts auth middleware where needed
  <module>.router.ts    # Route → controller wiring
  controllers/          # Parse request, call service inside withTenantContext
  services/             # Business logic (no HTTP knowledge)
  models/               # Zod schemas for request validation
```

Controllers always wrap database work in `withTenantContext(tenantId, …)` from `backend/src/db/client.ts`. Services receive a Prisma transaction client (`tx`) as their first argument so audit logging and related writes stay in the same transaction.

Shared plumbing lives in `backend/src/shared/` (errors, async handler, logger), `backend/src/middleware/` (auth, request ID, logging), and `backend/src/config/` (env + constants).

---

## Tenancy (cross-cutting)

There is no separate `tenants/` folder. A **creator is a tenant**: each `Creator` row owns programs, sessions, and audit logs via `tenantId`, and the JWT sets `req.tenantId = req.creatorId` in `authMiddleware`.

**Key design choice:** defense in depth — application code always filters by `tenantId`, and PostgreSQL Row-Level Security (RLS) enforces the same boundary at the database layer. `withTenantContext` sets `app.current_tenant_id` for the transaction; `withoutTenantContext` clears it for auth flows (signup/login) that must read the `creators` table without a tenant scope.

**Non-obvious:** any new tenant-scoped table needs both an explicit `tenantId` column in Prisma *and* an RLS policy in a migration (see `backend/prisma/migrations/20260617124000_enable_rls/`). If you query outside `withTenantContext`, RLS will return zero rows or block writes.

---

## `auth/`

Handles creator signup, login, and password reset. Public routes live under `/api/v1/admin/auth`; they do not use `authMiddleware`.

**Key design choice:** passwords are bcrypt-hashed; JWTs carry `sub` (creator ID) and `email`. Reset tokens are stored as SHA-256 hashes, never raw, and the request endpoint always returns the same message whether or not the email exists (no account enumeration).

**Non-obvious:** in development there is no email provider — `requestPasswordReset` logs the reset URL to the backend console. Look for `Password reset token generated` in server logs, then open `/reset-password?token=…` in the frontend. Auth DB access uses `withoutTenantContext` because `creators` is not RLS-protected.

**Frontend:** `frontend/src/modules/auth/` stores the JWT in `localStorage` (`lib/auth-storage.ts`). `AuthGuard` wraps dashboard routes; a 401 from any API call dispatches `SESSION_EXPIRED` and clears the token.

---

## `programs/`

CRUD for wellness programs (title, description). Programs belong to a tenant and cascade-delete their sessions.

**Key design choice:** every mutating operation calls `logAudit` in the same transaction, so program changes always leave an audit trail. List responses include `_count.sessions` for the admin UI.

**Non-obvious:** `getProgram` is the ownership gate — session and upload modules call it before doing work, so a valid session ID under another tenant's program still returns 404. To add a field, update the Prisma model, Zod schema in `models/program.schema.ts`, service, and the `Program` type in `frontend/src/lib/types.ts`.

**Frontend:** `frontend/src/modules/programs/` uses Redux thunks in `store/actions.ts` and pages under `app/(dashboard)/programs/`.

---

## `sessions/`

Ordered content items inside a program (title, duration, instructor, tags, optional `mediaUrl`). Position is a 1-based integer; the UI supports drag-and-drop reorder.

**Key design choice:** reordering and deletion use a two-phase position update (temporary negative positions, then final order) to avoid unique-constraint collisions on `(tenantId, programId, position)`. `clientRowId` is optional but powers idempotent creates — if a row with the same `clientRowId` already exists for the tenant, `createSession` returns the existing row instead of duplicating.

**Non-obvious:** `PUT /programs/:programId/sessions/reorder` requires the full list of session IDs for that program, not just the moved item. The frontend's `SortableSessionList` sends the complete reordered array. Tags are stored as a Postgres `text[]`; the UI accepts pipe-separated input (`sleep|relaxation`) via helpers in `frontend/src/lib/format.ts`.

**Frontend:** `SessionForm` handles create/edit. Media upload is a two-step presign-then-PUT flow (see `uploads/` below) before the session is saved with the resulting `mediaUrl`.

---

## `import/` (bulk CSV)

Bulk-creates sessions from a CSV file at `POST /programs/:programId/sessions/import`.

**Key design choice:** two layers of idempotency — the `Idempotency-Key` header deduplicates entire import jobs per tenant (replaying a completed job returns the cached `resultSummary`), and per-row `client_row_id` values skip rows that already created a session. Row-level validation failures do not abort the whole file; each row gets `success`, `error`, or `skipped` status.

**Non-obvious:** CSV parsing and validation live in `import/lib/csv.ts` (Zod per row). Required columns: `client_row_id`, `title`, `duration_seconds`, `instructor_name`; `tags` (pipe-separated) and `media_url` are optional. The frontend generates a UUID idempotency key on first upload and stores it in Redux so you can click "Retry with same key" to safely replay a failed import.

---

## `uploads/`

Generates presigned S3 PUT URLs for session media. The API never receives file bytes — the browser uploads directly to S3.

**Key design choice:** object keys are tenant-scoped (`tenants/{tenantId}/programs/{programId}/{uuid}-{filename}`) and the presign endpoint verifies program ownership before signing. `buildMediaUrl` supports both real AWS and local S3-compatible endpoints (e.g. LocalStack) via `AWS_ENDPOINT_URL`.

**Non-obvious:** configure `AWS_REGION`, `S3_BUCKET`, and optionally `AWS_ENDPOINT_URL` in `backend/.env`. Without credentials, LocalStack-style defaults (`test`/`test`) are used when an endpoint URL is set. The presign response includes `mediaUrl` — that is what you persist on the session record after the client PUT succeeds.

**Frontend:** `uploadsApi.presign` then `uploadsApi.uploadToS3` in `SessionForm`; only the final `mediaUrl` is sent to the sessions API.

---

## `audit/`

Append-only log of creator actions (CREATE, UPDATE, DELETE, REORDER, BULK_IMPORT) with `entityType`, `entityId`, and JSON `metadata`.

**Key design choice:** auditing is write-only from domain services via `logAudit(tx, …)` — there is no middleware magic. This keeps audit rows in the same transaction as the change they describe. Reads are paginated and filterable by date range and action.

**Non-obvious:** audit logging is not automatic for new endpoints; you must call `logAudit` explicitly when adding mutations. Action and entity-type enums are centralized in `backend/src/config/constants.ts` — add new values there first. The viewer is at `/audit-logs` in the frontend (`frontend/src/modules/audit/`).

---

## Frontend architecture

The admin panel is Next.js App Router with a thin routing layer in `frontend/src/app/` and feature code in `frontend/src/modules/<domain>/`.

**Key design choice:** Redux Toolkit-style manual reducers (not RTK slices) — each module has `store/actions.ts`, `reducer.ts`, and `types.ts`, combined in `store/rootReducer.ts`. API calls go through `frontend/src/lib/api.ts`, which attaches the Bearer token and normalizes errors.

**Non-obvious:** dashboard routes sit under `app/(dashboard)/` and are wrapped by `AuthGuard` in the layout. Pages are mostly one-line re-exports of module components (e.g. `ProgramsListPage`). Shared UI primitives live in `frontend/src/components/ui/`; cross-module helpers like breadcrumbs are in `frontend/src/modules/shared/`.

When adding a new feature end-to-end: backend module under `serviceLogic/`, register it in `routes/index.ts`, add API methods to `lib/api.ts`, create a frontend module with Redux store slice, and add an App Router page.

---

## Database & seeding

Schema is in `backend/prisma/schema.prisma`. Run `npm run db:migrate:dev` after model changes and `npm run db:seed` for demo creators (`creator1@demo.com` / `password123`).

**Key design choice:** Prisma for migrations and queries; RLS policies are raw SQL migrations alongside Prisma migrations.

**Non-obvious:** `ImportJob` / `ImportRow` tables exist for import observability but are not surfaced in the UI beyond the import result payload. `PasswordResetToken` rows are single-use and expire after one hour.

---

## Quick reference

| Module   | Backend entry                         | Frontend entry                          |
|----------|---------------------------------------|-----------------------------------------|
| Auth     | `serviceLogic/auth/`                  | `modules/auth/`                         |
| Programs | `serviceLogic/program/`               | `modules/programs/`                     |
| Sessions | `serviceLogic/session/`               | `modules/sessions/`                     |
| Import   | `serviceLogic/import/`                | `modules/import/`                       |
| Uploads  | `serviceLogic/upload/`                | used from `SessionForm`                 |
| Audit    | `serviceLogic/audit/`                 | `modules/audit/`                        |
| Tenancy  | `db/client.ts`, `middleware/auth.ts`  | token in `lib/auth-storage.ts`          |

For API route details and environment setup, see the root [README.md](../README.md).
