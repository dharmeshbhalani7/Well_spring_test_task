# Wellspring

Multi-tenant content management platform for wellness creators (Breakthrough take-home assessment).

## Loom Walkthrough

_Add your Loom video URL here before submission._
video 1:- https://www.loom.com/share/25ec599c23914915a1b1bcdd1d8e9eba
video 2:- https://www.loom.com/share/4a57ed43ccd44150bfeac302a0445ab6

## Prerequisites

- Node.js 20+
- Docker & Docker Compose (for PostgreSQL)
- npm

## Quick Start

### 1. Start PostgreSQL

PostgreSQL runs on port **5434** (mapped from container) to avoid conflicts with local Postgres on 5432.

```bash
docker compose up -d
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env # check if exist skip this
npm install
npm run db:migrate:dev   # first time: creates DB schema
npm run db:seed # after runing this command inital data is added in DB // username:- creator1@demo.com, password:- password123
npm run dev
```

API runs at `http://localhost:3001`.

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env.local # check if exist skip this
npm install
npm run dev
```

Admin panel runs at `http://localhost:3000`.

### 4. Test Credentials (after seed)

| Email | Password |
|-------|----------|
| creator1@demo.com | password123 |
| creator2@demo.com | password123 |

## npm Scripts (backend)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API in watch mode |
| `npm run test` | Run integration tests |
| `npm run db:migrate` | Apply migrations (production) |
| `npm run db:migrate:dev` | Create/apply migrations (development) |
| `npm run db:seed` | Seed demo data |

## npm Scripts (frontend)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js admin panel (port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |

## Admin Panel Screens

| Route | Feature |
|-------|---------|
| `/login`, `/signup` | Creator authentication |
| `/reset-password` | Password reset (token from backend console in dev) |
| `/programs` | Program list, create, delete |
| `/programs/new` | Create program |
| `/programs/[id]` | Edit program, drag-reorder sessions |
| `/programs/[id]/sessions/new` | Create session with S3 media upload |
| `/programs/[id]/sessions/[sessionId]` | Edit session |
| `/programs/[id]/import` | Bulk CSV import with row-level feedback |
| `/audit-logs` | Audit log viewer with date/action filters |

## API Overview

Base URL: `http://localhost:3001/api/v1/admin`

### Auth

- `POST /auth/signup` — `{ email, password, displayName }`
- `POST /auth/login` — `{ email, password }`
- `POST /auth/password-reset/request` — `{ email }`
- `POST /auth/password-reset/confirm` — `{ token, newPassword }`

### Programs

- `GET /programs` — List programs
- `POST /programs` — Create program
- `GET /programs/:id` — Get program
- `PATCH /programs/:id` — Update program
- `DELETE /programs/:id` — Delete program

### Sessions

- `GET /programs/:programId/sessions` — List sessions (ordered)
- `POST /programs/:programId/sessions` — Create session
- `PUT /programs/:programId/sessions/reorder` — `{ sessionIds: [] }`
- `GET /programs/:programId/sessions/:sessionId` — Get session
- `PATCH /programs/:programId/sessions/:sessionId` — Update session
- `DELETE /programs/:programId/sessions/:sessionId` — Delete session

### Bulk CSV Import

- `POST /programs/:programId/sessions/import`
- Header: `Idempotency-Key: <unique-key>`
- Body: multipart form with `file` field (CSV)

**CSV columns:** `client_row_id, title, duration_seconds, instructor_name, tags, media_url`

- `tags` pipe-separated (e.g. `sleep|relaxation`)
- `media_url` optional but must be valid URL if provided

### Uploads

- `POST /uploads/presign` — `{ filename, contentType, programId }`
- Returns presigned S3 PUT URL scoped to tenant

### Audit Logs

- `GET /audit-logs?from=&to=&action=&page=&limit=`

## Environment Variables

See [`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example).

## Architecture Notes

- **Tenant isolation**: PostgreSQL Row-Level Security (RLS) + application-level `tenantId` filters
- **Idempotent imports**: `Idempotency-Key` header + per-row `client_row_id`
- **Structured logging**: JSON logs with `tenant_id` and `request_id` on every request

## Project Structure

```
backend/          Express + TypeScript + Prisma API
frontend/         Next.js admin panel (Tailwind)
docs/             Architecture docs (submission deliverables)
ai-history/       AI session exports (submission deliverable)
```
