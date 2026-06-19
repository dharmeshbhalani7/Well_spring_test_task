# Architecture Review

An honest assessment of the Wellspring take-home — what works, what was left out, and what I'd rethink under production pressure.

---

## 1. What I built and what I skipped — and why

**Built:** Full-stack admin for wellness creators — auth (signup, login, password reset), program/session CRUD, drag-and-drop reorder, presigned S3 upload, bulk CSV import with row-level feedback, and a filterable audit log. Backend: Express + Prisma + PostgreSQL. Frontend: Next.js with per-feature Redux modules. Integration tests cover tenant isolation, reorder, import idempotency, and upload authorization.

**Skipped (time-bounded):**

- **Email for password reset** — tokens log to the backend console; no SES/SendGrid wiring.
- **Background import jobs** — CSV processing runs synchronously in the HTTP request. Fine for hundreds of rows; wrong for 10k+.
- **Refresh tokens** — single JWT with configurable expiry. Simpler, but users must re-login.
- **Rate limiting, Helmet, strict CORS** — `cors()` is wide open.
- **Frontend tests** — UI is manually exercised only.
- **Consumer app** — admin-only; no public playback or end-user auth.
- **Import history UI** — `ImportJob` rows are persisted but not listed beyond the immediate result.

I prioritized tenant isolation, idempotent import, S3 scoping, and audit over operational polish.

---

## 2. Tenant isolation strategy

**Choice:** Shared schema, `tenant_id` on every owned row, enforced at two layers:

1. **Application** — JWT sets `req.tenantId`; controllers wrap work in `withTenantContext`, which sets `app.current_tenant_id` and passes `tenantId` to every query.
2. **Database** — RLS with `FORCE ROW LEVEL SECURITY` on `programs`, `sessions`, `audit_logs`, `import_jobs`, and `import_rows`.

A creator *is* the tenant (`tenantId === creatorId`). No separate `tenants` table — right for single-user accounts, not for multi-admin orgs.

**Why not schema-per-tenant?** Migration complexity and connection-pool pain without benefit at this scale. Column isolation + RLS is the standard early-stage B2B pattern and maps cleanly to Prisma.

**At ~100 creators:** Comfortable. Indexes on `tenant_id` keep queries fast; RLS overhead is negligible.

**At ~10,000 creators:** Still viable on one Postgres instance if queries stay tenant-scoped. Changes needed: partition or archive the append-only audit log; verify PgBouncer + transaction-local `set_config` interaction; add tests that query without `withTenantContext` to confirm RLS blocks leaks. Schema-per-tenant only if regulation forces it — not at this scale. Hot tenants with millions of sessions might get dedicated S3 buckets, not separate schemas.

Not built: superuser admin, team members per tenant, tenant suspension.

---

## 3. Bulk import design

**Two-tier idempotency:**

| Layer | Mechanism | Scope |
|-------|-----------|-------|
| Job | `Idempotency-Key` header → unique `(tenant_id, idempotency_key)` | Entire upload |
| Row | `client_row_id` → unique `(tenant_id, client_row_id)` on sessions | Individual row |

Completed jobs return cached `resultSummary` on replay. Existing `client_row_id` rows are `skipped`, not duplicated. `createSession` also short-circuits on duplicate `clientRowId`.

**Handled:** CSV parse errors (400, no writes); per-row Zod failures (`error` status, others continue); per-row DB errors (caught, recorded); mixed valid/invalid files (partial success).

**Not handled well:**

- **Crashed mid-import** — only `completed` jobs replay. A `processing` job leaves retries hitting a unique constraint.
- **Concurrent requests** with the same key — no advisory lock.
- **Long imports** — sequential row processing inside `withTenantContext` holds a transaction open.
- **Imported `media_url`** — validated as URL, not fetched or scanned.

Frontend stores the idempotency key in Redux and offers "retry with same key."

---

## 4. S3 upload flow

**Flow:** `POST /uploads/presign` → verify program ownership → presigned PUT URL → client uploads directly → `mediaUrl` saved on session.

**Security:**

- Keys scoped to `tenants/{tenantId}/programs/{programId}/{uuid}-{filename}`; foreign `programId` returns 404 (tested).
- Content-type restricted to `audio/*` or `video/*` in Zod — weak enforcement; client can send anything to the presigned URL. No post-upload `HeadObject` check.
- No file size cap on presign (CSV has 5 MB multer limit; media does not).
- Presign expiry: 15 min default. Supports AWS and local S3-compatible endpoints.

**For very large files:** multipart upload presigning; `media_uploads` table with `pending` → `confirmed` lifecycle; ClamAV Lambda on `ObjectCreated`; CloudFront with signed URLs and a private bucket. Today sessions store a direct S3 URL — fine for dev, not for production delivery.

---

## 5. Parts of my code I'm not fully confident in

- **Session reorder/delete** — two-phase position updates dodge a unique constraint but issue N sequential `UPDATE`s. Works in tests; unsure about concurrent reorders on the same program.
- **Import crash recovery** — the `processing` → retry path is broken. Needs claim semantics and a test.
- **Dead duplicate** — `backend/src/import/services/import.service.ts` mirrors the real file under `serviceLogic/import/`. Sloppy; should be deleted.
- **RLS + Prisma** — `update({ where: { id } })` without `tenantId` relies on RLS. Forgetting `withTenantContext` yields empty reads, not loud errors — subtle to debug.
- **JWT in localStorage** — XSS-exposed; no httpOnly cookie path.
- **Manual audit logging** — easy to miss on new endpoints.
- **No rate limiting on `/auth/*`** — brute-force login is unprotected.

---

## 6. What I would change with two more days

**Day 1 — harden:**

- Fix import in-flight idempotency (advisory lock or upsert + `failed` status on error).
- Delete duplicate import service; tighten CORS to `APP_URL`; rate-limit auth; add Helmet.
- Cap presign file size via S3 policy conditions; optional post-upload verification.
- Frontend pagination for programs; tests for import idempotency UX and `AuthGuard`.

**Day 2 — production trajectory:**

- Queue-based import (BullMQ) with progress polling.
- Refresh token rotation.
- CloudFront + private bucket; store object key, not public URL.
- Audit log actor enrichment and CSV export.
- Load test 1k-row import and concurrent reorder.

---

**Bottom line:** Shared-schema + `tenant_id` + RLS is the right call for an early admin product. Gaps are operational (crashed imports, upload verification, auth abuse, dead code), not fundamental design errors. I'd ship to a closed beta after Day 1 fixes; not to 10k creators without Day 2.
