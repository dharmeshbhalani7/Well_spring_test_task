# Backend implementation plan for test task
_Exported on 18/06/2026 at 16:58:14 GMT+5:30 from Cursor (3.7.42)_

---

**User**

 Now I want to start working on the backend. Please review the provided flowchart and create a clear implementation plan covering the database structure, API endpoints, module-wise architecture, data flow, and overall backend design.
 Also include recommendations for authentication, validations, error handling, migrations, and project structure. Break everything down into development phases with priorities so we can build it step by step

---

**Cursor**

I'll scan the flowchart and scan the repo so the backend and database plan matches the actual requirements and what's already there.


The workspace is empty, so I'm drafting a greenfield backend plan from the assessment flowchart, migrations, and API structure included.


**Backend implementation preferences**

> **Which database/migration approach do you prefer for PostgreSQL?**
> - Drizzle ORM + drizzle-kit SQL migrations (Recommended — strong TypeScript, explicit migration files)
> - Knex.js migrations + raw SQL queries
> - Prisma ORM + Prisma Migrate ✔

> **How should the repo be organized?**
> - Monorepo: backend/ + frontend/ at repo root (Recommended — matches take-home deliverables) ✔
> - Backend-only folder for now; add frontend later

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

Implementing the Wellspring backend per the plan. Starting with project scaffolding and working through each todo.


---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

Implementing the Wellspring backend per the plan. Starting with project scaffolding.


Port 5432 is in use — checking what's running and adjusting the database setup.


Switching to `bcryptjs` to avoid native build issues.


All tests passed. Verifying the build and updating todos.


The Wellspring backend is implemented per the plan. Here is what was built:

## What was delivered

**Monorepo structure**
- [`backend/`](backend/) — Express + TypeScript + Prisma API
- [`frontend/`](frontend/) — placeholder for the Next.js admin panel
- [`docker-compose.yml`](docker-compose.yml) — PostgreSQL on port **5434**
- [`README.md`](README.md) — setup, API docs, seed credentials

**Database (Prisma + migrations)**
- Schema: `Creator`, `Program`, `Session`, `ImportJob`, `ImportRow`, `AuditLog`, `PasswordResetToken`
- Migrations: initial schema + RLS policies on tenant-scoped tables
- Seed: 2 creators × 3 programs × 10 sessions

**API** (`/api/v1/admin`)
- Auth: signup, login, password reset (token logged to console in dev)
- Programs & sessions: full CRUD, drag-reorder
- Bulk CSV import with `Idempotency-Key` + per-row validation
- S3 presigned upload URLs (tenant-scoped keys)
- Audit log with date/action filters

**Quality bars**
- Tenant isolation: PostgreSQL RLS + `withTenantContext()` + service-layer `tenantId` filters
- Structured JSON logging with `tenant_id` and `request_id`
- 8 integration tests passing, including the 3 required isolation tests

## Quick start

```bash
docker compose up -d
cd backend
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

**Seed logins:** `creator1@demo.com` / `creator2@demo.com` — password `password123`

**Verify:** `npm test` (8/8 passing), `npm run build` (clean)

Note: PostgreSQL uses port **5434** because 5432/5433 were already in use on your machine. Update `DATABASE_URL` in `.env` if you change the port.

---

**User**

now we need to proceed with the frontend part so create a frontend plan for same as we have already backend part done 

---

**Cursor**

Reviewing the flowchart for frontend requirements and the existing backend API so the frontend plan aligns with what's already built.


Checking a few backend integration details to ensure the frontend plan is accurate.


---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

Implementing the Wellspring frontend per the plan. Starting with Next.js scaffolding.


Creating the core library files, UI components, and app structure.


The Wellspring frontend is implemented per the plan. Summary:

## What was built

**Scaffold** — Next.js 16 App Router + TypeScript + Tailwind in [`frontend/`](frontend/)

**API layer** — [`frontend/src/lib/api.ts`](frontend/src/lib/api.ts) with typed modules for auth, programs, sessions, CSV import, S3 presign, and audit logs

**Auth** — Login, signup, password reset (`/reset-password?token=`), JWT in localStorage, `AuthGuard` on dashboard routes

**Required screens**
| Route | Feature |
|-------|---------|
| `/programs` | List, create, delete programs |
| `/programs/[id]` | Edit program + drag-reorder sessions (`@dnd-kit`) |
| `/programs/[id]/sessions/new` | Create session with S3 presigned upload |
| `/programs/[id]/sessions/[sessionId]` | Edit session |
| `/programs/[id]/import` | CSV bulk import with row-level errors + idempotency retry |
| `/audit-logs` | Filters (date range, action) + pagination |

## Run it

```bash
# Terminal 1 — backend (if not already running)
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

- **Frontend:** http://localhost:3000  
- **Backend:** http://localhost:3001  
- **Login:** `creator1@demo.com` / `password123`

`npm run build` completes successfully. Root [`README.md`](README.md) includes frontend setup and screen documentation.

---

**User**

The backend codebase requires several structural changes and refactoring to improve maintainability, scalability, and consistency.

Currently, routes are being registered directly in "backend/src/app.ts"  and some module-specific routes are handled in files such as `src/modules/auth/auth.routes.ts`. While this approach works, it is not the architecture I want to follow for this project.

I would like the project to be restructured using a modular, feature-based architecture that is commonly used in microservices and large-scale backend applications.

### Requirements

1. `src/app.ts` should only be responsible for:

   * Creating the Express application.
   * Registering the central router.
   * Loading global middleware and configurations.

2. Create a centralized routing layer using `Router()`.

3. Each feature/module should have its own folder containing all functionality related to that domain.

4. Every module should expose its own router, which will then be registered in the central router.

5. Route definitions should be separated from business logic. For example:

```ts
router.post("/signup", signUpRouter);
router.post("/login", loginRouter);
```

The actual implementation logic should reside in dedicated controller/service/router handler files.

6. Create helper/utility files whenever logic is reused across multiple files.

7. Models should be organized within their respective feature folders rather than being placed globally.

### Feature-Based Organization

Authentication and authorization-related endpoints, models, services, helpers, and logic should reside inside the `auth` module.

Program-related endpoints, models, services, helpers, and logic should reside inside the `program` module.

Each module should contain a route file that exposes all routes for that feature. These feature routes should then be combined and registered in the central routing file.

### Expected Structure

```text
src/
│
├── app.ts
│
├── routes/
│   └── index.ts
│
├── auth/
│   ├── authApp.ts
│   ├── authRouter.ts
│   ├── authHelper.ts
│   ├── controllers/
│   ├── services/
│   └── models/
│       └── auth.model.ts
│
├── program/
│   ├── programApp.ts
│   ├── programRouter.ts
│   ├── programHelper.ts
│   ├── controllers/
│   ├── services/
│   └── models/
│       └── program.model.ts
```

### Routing Example

Central Router:

```ts
router.use("/auth", authApp);
router.use("/program", programApp);
```

Auth Module Router:

```ts
router.post("/signup", signUpHandler);
router.post("/login", loginHandler);
router.post("/forgot-password", forgotPasswordHandler);
```

### Goal

Refactor the existing backend to follow this modular structure while preserving all current functionality. The objective is to improve code organization, separation of concerns, reusability, and long-term maintainability. This architecture aligns with patterns commonly used in modern microservice and enterprise backend applications.
 @backend/src/app.ts 

---

**Cursor**

Reviewing the backend structure to draft a refactor plan that matches your modular architecture requirements.


Checking one more coupling point before finalizing the plan.


**API path compatibility**

> **Your routing example uses `/program` (singular), but the live API and frontend use `/programs`. Which mount paths should the refactored central router use?**
> - Preserve existing API paths (/programs, /audit-logs, etc.) — recommended for frontend compatibility ✔
> - Rename to singular paths (/program, /session) per your routing example — requires frontend updates

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

Implementing the backend modular refactor per the plan. Reading the current codebase and scaffolding the new structure.


Creating shared infrastructure and all feature modules in batches.


The backend modular refactor is complete. Here is what changed:

## Architecture

**[`app.ts`](backend/src/app.ts)** — Express bootstrap only: global middleware, health check, mounts `apiRouter`, error handler.

**[`routes/index.ts`](backend/src/routes/index.ts)** — Central router registering all feature apps:

```ts
apiRouter.use("/auth", authApp);
apiRouter.use("/programs", programApp);
apiRouter.use("/programs/:programId/sessions", sessionApp);
apiRouter.use("/programs/:programId/sessions/import", importApp);
apiRouter.use("/uploads", uploadApp);
apiRouter.use("/audit-logs", auditApp);
```

## Feature modules

Each module follows: `*.app.ts` → `*.router.ts` → `controllers/` → `services/` → `models/`

| Module | Path | Controllers |
|--------|------|-------------|
| `auth/` | `/auth` | signup, login, password reset |
| `program/` | `/programs` | list, get, create, update, delete |
| `session/` | `/programs/:id/sessions` | list, get, create, update, delete, reorder |
| `import/` | `/programs/:id/sessions/import` | bulk CSV import (promoted to central router) |
| `upload/` | `/uploads` | S3 presign |
| `audit/` | `/audit-logs` | list with filters |

## Shared infrastructure

- **`shared/`** — `asyncHandler`, `errors`, `logger`, `params`, `health.controller`
- **`JwtPayload`** moved to `auth/models/auth.types.ts` (middleware imports types, not vice versa)
- Old `src/modules/` and `src/lib/` removed

## Verification

- `npm run build` — passes
- `npm test` — 8/8 passing (including all 3 tenant isolation tests)
- All API paths unchanged — frontend requires no updates

---

**User**

This prompt is just for your information. As per my instructions, you made the changes, and I have also updated the backend according to my own approach. I’m sharing this prompt only to keep you informed so the context is not lost,
You dont need to return any output in this prompt

---

**Cursor**

Understood — I’ll treat the backend as updated on your side and keep that context for later work.

# Frontend code structure and state management
_Exported on 18/06/2026 at 16:59:01 GMT+5:30 from Cursor (3.7.42)_

---

**User**

I have reviewed the frontend code and identified 3 major changes that are needed for better structure and scalability:

Improve Next.js app routing structure (src/app)
You are already using slug-based routing, which is good and modern. However, we need to improve the src/app structure.
Each page.tsx file (for example, in the sessions module) should be kept very minimal. It should only import and render components.
All core UI logic, business logic into dedicated components inside the module.
So the page.tsx file should only act as a wrapper that imports a component and returns it.
Standardize routing approach
Replace all href-based navigation usage with Next.js built-in routing methods such as next/link and useRouter.
This will ensure consistent navigation behavior and better alignment with Next.js best practices.
State management refactor (Context → Redux architecture)
Replace Context API with Redux for better scalability in a large-scale application.
Create separate actions and reducers files for each module.
For example, create a program folder with its own store, actions, and reducers handling all program-related state and logic.
Follow the same structure for all other modules.
Additionally, create a root store that combines all module reducers into a single centralized store.
This should follow a scalable architecture similar to enterprise-level applications, where there is a central store and module-wise state slices are combined into it.
@frontend 

---

**Cursor**

Exploring the frontend structure to map routing, navigation patterns, and current state management before drafting a refactor plan.


Reading key files to refine the refactor plan with concrete module boundaries and file structure.


Checking the tsconfig path alias and a thin page example for consistency.


I have a clear picture of the codebase. Navigation is already largely on `next/link`; the main work is thin route wrappers, module extraction, and migrating from Context to Redux.


**Redux implementation preference**

> **For the Redux architecture, which approach do you prefer? (Both support separate actions/reducer files per module as you requested.)**
> - Redux Toolkit (recommended) — configureStore, createAsyncThunk in actions.ts, reducer in reducer.ts
> - Classic Redux — manual action types, switch reducers, no Toolkit helpers ✔

Planning around classic Redux with separate actions and reducers per module.


---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

Implementing the frontend architecture refactor per the plan. Starting with Redux store foundation.


Creating the store foundation and all module files.


Fixing auth thunks to handle errors, then updating all route files.


Fixing a circular dependency between `api.ts` and auth actions.


Updating reducers to accept `AnyAction` for `combineReducers` compatibility.


The frontend architecture refactor is complete and `npm run build` passes. Summary:

## 1. Thin route wrappers (`src/app`)

All `page.tsx` files are now thin shells that import and render module components (1–10 lines each). Examples:

- [`programs/page.tsx`](frontend/src/app/(dashboard)/programs/page.tsx) → `ProgramsListPage`
- [`programs/[programId]/page.tsx`](frontend/src/app/(dashboard)/programs/[programId]/page.tsx) → `ProgramDetailPage`
- Server routes unwrap `params` and pass props (import, new session)

## 2. Feature modules (`src/modules`)

| Module | Contents |
|--------|----------|
| `auth/` | `actions.ts`, `reducer.ts`, `types.ts`, `hooks.ts`, components (Login, Signup, AuthGuard, HomeRedirect, SessionExpiredListener) |
| `programs/` | List, create, detail pages + Redux slice |
| `sessions/` | SessionForm, SortableSessionList, create/edit pages + Redux slice |
| `audit/` | AuditLogPage, AuditLogViewer + Redux slice |
| `import/` | ImportPage, CsvUpload + Redux slice |
| `dashboard/` | `DashboardShell` (extracted from layout) |
| `shared/` | `ProgramBreadcrumbs` (deduplicated nav) |

## 3. Classic Redux store (`src/store`)

- Root store: `createStore` + `redux-thunk` middleware
- [`rootReducer.ts`](frontend/src/store/rootReducer.ts) combines all module reducers
- [`StoreProvider`](frontend/src/store/provider.tsx) replaces `AuthProvider` in root layout
- Typed `useAppDispatch` / `useAppSelector` in [`store/hooks.ts`](frontend/src/store/hooks.ts)

## 4. Navigation standardization

- In-app links use `next/link` throughout
- Cancel buttons use `<Link>` (program create, session form)
- Logout uses `router.replace("/login")`
- 401 handling dispatches `SESSION_EXPIRED` to Redux; `SessionExpiredListener` redirects via `router.replace` (no `window.location`)

## 5. Removed

- [`src/context/AuthContext.tsx`](frontend/src/context/AuthContext.tsx)
- Old [`src/components/{auth,sessions,import,audit}`](frontend/src/components) feature components (UI primitives in `components/ui/` unchanged)

**Dependencies added:** `redux`, `react-redux`, `redux-thunk`

---

**User**

@frontend/src/modules/auth/store I have already implemented the store structure for the audit and auth modules. Please follow the same pattern for the import, program, and sessions modules.

For each module, create a store folder containing separate actions, reducers, and types files. The structure should be consistent with the existing implementation in the audit and auth modules. Ensure that all module-specific state management logic is organized within their respective store

---

**Cursor**

Reviewing the auth and audit `store` layout, then aligning import, programs, and sessions to match.


Moving programs, sessions, and import store files into `store/` folders and updating imports.


Reorganized **programs**, **sessions**, and **import** to match the **auth** and **audit** `store/` pattern. All five modules now use the same layout:

```
modules/<module>/
  store/
    actions.ts
    reducer.ts
    types.ts
  components/
  hooks.ts          # auth only
```

### Changes made

**New `store/` folders:**
- [`modules/programs/store/`](frontend/src/modules/programs/store/) — `actions.ts`, `reducer.ts`, `types.ts`
- [`modules/sessions/store/`](frontend/src/modules/sessions/store/) — `actions.ts`, `reducer.ts`, `types.ts`
- [`modules/import/store/`](frontend/src/modules/import/store/) — `actions.ts`, `reducer.ts`, `types.ts`

**Updated imports in:**
- [`store/rootReducer.ts`](frontend/src/store/rootReducer.ts)
- Program components (`ProgramsListPage`, `ProgramCreatePage`, `ProgramDetailPage`)
- Session components (`SessionForm`, `SessionEditPage`)
- [`CsvUpload.tsx`](frontend/src/modules/import/components/CsvUpload.tsx)

**Removed** the old root-level `actions.ts`, `reducer.ts`, and `types.ts` from programs, sessions, and import.

`npm run build` completes successfully with the new structure.

---

**User**

@AuditLogViewer.tsx (51-93) with this filter option give one option for reset filter 

---

**Cursor**

Adding a Reset filters button that clears all filter fields via the existing `setAuditFilters` action (which also resets page to 1).


Added a **Reset filters** button next to Refresh. It dispatches `setAuditFilters({ from: "", to: "", action: "" })`, which clears all filter fields and resets the page to 1 (handled by the audit reducer). The existing `useEffect` then refetches the unfiltered log list automatically.



