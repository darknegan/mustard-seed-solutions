# Todos feature — implementation plan

Plan for a **client-facing Todos** area in the dashboard: one place that lists **what the client still needs to do** for their project, combining **curated action items** (team-created) with **system defaults** (especially **Design planning**) and other derived hints from data the portal already has.

**Navigation change:** the **Todos** entry **replaces** the current **Design planning** item in the dashboard **sidebar, mobile menu, and bottom tabbar** (`DashboardPageComponent` nav). Design planning **stays a route** (`/dashboard/onboarding/design-planning-brief`); clients reach it via the **default Design planning todo** (CTA link) and any other in-page links you keep (e.g. Overview copy), not as its own top-level taskbar label.

**Taskbar badge:** the Todos nav item shows a **notification bubble** with the count of **open** (incomplete) todos for that client so the count is visible on every dashboard screen.

**Original plan note:** polish-only tweaks may still land outside this doc. Implementation is **shipped** — see **Implementation status** above.

## Implementation status (shipped in repo)

- [x] **§12.1 DB** — `client_todos` in `server/src/db/schema.sql` + `server/src/db/migrate.ts`
- [x] **§12.2 Server** — `server/src/routes/todos.ts`, wired in `server/src/index.ts` (`GET/POST/PATCH` client + admin; `DELETE` admin soft-cancel)
- [x] **§12.3 Angular shell** — `TodosService`, `dashboard-page` nav swap + badge + `NavigationEnd` summary refresh
- [x] **§12.4 Todos page** — `src/app/dashboard/todos/*`, route `dashboard/todos`, virtual Design planning row from API
- [x] **§12.5 Admin UI** — `src/app/dashboard/admin-client-todos/*`, route `dashboard/admin/client-todos`, admin nav item
- [x] **§12.6 Overview** — quick action points to `/dashboard/todos`; mock brief submit calls `todos.fetchSummary()`
- [x] **Worker** — `worker/todos.ts` + `worker/index.ts` routing for same todo API paths in production

---

## 1. Goals and success criteria

### 1.1 Product goals

- Clients see a **single Todos page** under `/dashboard/...` with a **clear, scannable list** of outstanding work.
- Items read in **plain language** (non-technical audience); avoid internal jargon in titles and descriptions (see workspace `client-audience-content` guidance).
- List reflects **truth**: the Todos page shows **both active and completed** items in distinct sections; open count drives the **taskbar badge**; stale items do not silently linger without team visibility.

### 1.2 Engineering goals

- **Tenant isolation:** a client only sees todos for **their user/account** (today `users.id` is the natural key; there is no separate `projects` table in `schema.sql` yet—plan assumes **per-user** scope unless you introduce projects later).
- **Consistent auth:** reuse `authenticate` middleware and the same JSON error shapes as other `/api/client` routes.
- **Angular standards:** standalone `DashboardTodosPageComponent`, OnPush, signals for state, modern `@if` / `@for` with `track`, no template logic beyond simple bindings.

### 1.3 Success checks (manual)

- Logged-in client hits Todos → sees **open and completed** sections; marking complete updates UI and **lowers the nav badge** after refresh (or optimistically, if implemented).
- Sidebar / tabbar / mobile menu: **no “Design planning” top-level item**; **Todos** shows **badge = open todo count**.
- Non-owner cannot read or mutate another user’s todos (verify with a second test account or direct API calls with swapped IDs).
- Admin (if you add admin authoring) can create/edit items for a chosen client without exposing other clients’ rows.

---

## 2. Non-goals (initial release)

- Full **task manager** (subtasks, comments, attachments, @mentions, drag reorder across projects).
- **Calendar sync** or reminders (email/push) unless you explicitly add a notifications phase later.
- **Client-created todos** (clients proposing their own backlog items)—optional future; v1 focuses on **what we need from them** and **what the system knows is incomplete**.

---

## 3. Definitions: what is a “Todo” here?

Use a narrow domain model so the page stays trustworthy:

| Category | Source | Example |
|----------|--------|---------|
| **Curated** | Staff inserts/updates rows in DB | “Send logo files (PNG + SVG)” |
| **Derived** | Server computes from existing tables/state | e.g. hide Design planning todo when a `mock_planning_briefs` row exists for `user_id` |
| **Default (Design planning)** | Every client must have this as an **active** todo until resolved | See §4.5 and §5.2 |

**Recommendation:** ship **default Design planning todo + badge + nav swap** together with **curated** staff todos. Add other **derived** hints as needed; dedupe by `source_key` (§5.2).

---

## 4. UX specification

### 4.1 Information architecture

- **Route:** e.g. `/dashboard/todos` (short, memorable; parallel to `/dashboard/documents`).
- **Nav (replaces Design planning):** In `dashboard-page.ts` **`baseNavItems`**, **remove** the entry whose `route` is `/dashboard/onboarding/design-planning-brief` (label “Design planning”). **Insert** a **Todos** item in that **same ordinal position** in the list (between “My Documents” and “Request a Change” as today) so muscle memory stays similar: PrimeIcons e.g. `pi pi-check-square`, `route: '/dashboard/todos'`, `shortLabel` e.g. `Todos`.
- **Mirror in templates:** `dashboard-page.html` — sidebar links, mobile drawer, and **bottom tabbar** must all render the **badge** for Todos only (see §4.6). Keep `routerLinkActive` / exact options consistent with other items.
- **Route data:** `portalTitle`, `portalGreeting` for `/dashboard/todos` (see `app.routes.ts` patterns). **Do not remove** the `design-planning-brief` child route from `app.routes.ts`—only remove it from **chrome nav**.

### 4.2 Page layout (client)

Sections (top to bottom) — **both active and completed always have a home on this page**:

1. **Page intro** — one sentence: these are actions **from our team**, **defaults** (like Design planning), and other checklist items tied to your account.
2. **Active todos** — primary list (`status === 'open'`): title, short description (optional), due date (optional), category badge; **primary action** where relevant (e.g. “Open Design planning” → `/dashboard/onboarding/design-planning-brief`).
3. **Completed todos** — second section **below** active (not only behind a toggle): show **completed** rows (`status === 'done'`) with completed date; optional “Show more” if list grows large (e.g. >20).
4. **Empty states** — **No open items:** reassuring “caught up” copy; **completed section** can still show history. **Brand-new account with only defaults:** Design planning default should keep active section non-empty until resolved.

### 4.3 Interactions (client)

**Minimum viable:**

- View list (GET) returning **both** `open` and `done` items (see §6.1) so the page can render **active** and **completed** sections without a second request (unless you split later for pagination).
- Mark item **complete** (PATCH) — optional note not required for v1.

**Nice-to-have (phase 2):**

- Mark **incomplete** again (undo) — useful if client taps by mistake; gate with confirm if you fear noise.

**Explicitly not required for v1:**

- Inline editing of curated text by client.

### 4.4 Admin UX (optional but likely needed)

If only engineers can write SQL, the feature will not scale. Plan for **one** of:

- **A.** Small **admin dashboard page** (pattern exists: `admin/design-planning-briefs`) to create/edit/delete todos for a user (search by email or pick from recent signups).
- **B.** **Supabase dashboard / SQL** for internal team only (fastest to ship; worst UX).

Recommendation: **A** mirrors your existing admin route + `requireAdminGuard` pattern.

### 4.5 Default Design planning todo (required)

- **Every client** should see an **active** todo for Design planning **by default** (until the product considers that step satisfied).
- **Suggested implementation (pick one, document in PR):**
  - **A — Virtual row (preferred for sync):** On `GET /api/client/todos`, always merge a **system** row with `source_key` e.g. `design_planning` when `mock_planning_briefs` has **no** row for `user_id`. Row includes **title/description in plain language** and **`actionRoute`** or equivalent in JSON so the Angular page can link to `/dashboard/onboarding/design-planning-brief`. When a brief exists, **omit** that virtual row (or treat as satisfied — see §5.2). **PATCH complete** on a virtual row may need **materializing** a row first, or **disallowed** for this key (only satisfied by submission)—**product choice:** simplest is **auto-complete when brief submitted** (no manual check for this item).
  - **B — Materialized on signup / backfill:** Insert one `client_todos` row per user with `source_key = 'design_planning'`; server or trigger removes or marks done when brief inserted. Requires **migration** for existing users.
- **Copy:** client-facing wording per `client-audience-content` (outcome-focused, not “mock planning brief” jargon in the title).
- **Completion rule:** recommend **automatic completion** when at least one `mock_planning_briefs` row exists for the user; optional manual complete remains a product question for edge cases (started elsewhere).

### 4.6 Taskbar notification bubble

- **Where:** on the **Todos** nav link in **sidebar**, **mobile menu**, and **bottom tabbar** (`dashboard-page.html` + styles in `dashboard-page.scss`).
- **Value:** **count of open todos** (same definition as §4.2 active list: `status === 'open'` after merge of staff + system defaults).
- **Data loading:** `DashboardPageComponent` needs `openTodoCount` (signal). Options: (1) **`GET /api/client/todos`** and count `open` on client — simple but heavier; (2) **`GET /api/client/todos/summary`** returning `{ openCount: number }` — lighter for every navigation; (3) **extend** main todos response used by Todos page and **cache** in a small `TodosService` singleton so shell and page share one fetch. Prefer **(2) or (3)** to avoid double-fetch and keep tabbar snappy.
- **Refresh:** after completing a todo on the Todos page (or after returning from Design planning if brief submission affects virtual rows), **invalidate** summary + list so the badge updates (router event, service signal, or explicit refresh on `NavigationEnd`).
- **UX:** show badge only when `openCount > 0`; cap display **“9+”** if you want a cap; **aria-label** on the link e.g. `Todos, 3 open tasks`.
- **Accessibility:** badge must not rely on color alone; small pill with numeric text is fine.

---

## 5. Data model

### 5.1 Table: `client_todos` (proposed name)

Add to `server/src/db/schema.sql` (and migration strategy you use in `migrate.ts`):

| Column | Type | Notes |
|--------|------|--------|
| `id` | `UUID` PK | `gen_random_uuid()` |
| `user_id` | `UUID` FK → `users(id)` ON DELETE CASCADE | Owner |
| `title` | `TEXT` NOT NULL | Short, client-facing |
| `description` | `TEXT` NOT NULL DEFAULT '' | Optional longer guidance |
| `category` | `TEXT` NOT NULL DEFAULT 'general'` | Enum in app layer or CHECK constraint |
| `status` | `TEXT` NOT NULL DEFAULT 'open'` | `'open' \| 'done'` (or `'cancelled'` later) |
| `due_at` | `TIMESTAMPTZ` NULL | Optional |
| `sort_order` | `INT` NOT NULL DEFAULT 0 | Manual ordering for curated list |
| `source` | `TEXT` NOT NULL DEFAULT 'staff'` | `'staff' \| 'system'` |
| `source_key` | `TEXT` NULL | Unique per user for dedupe; default Design planning uses e.g. `design_planning` |
| `action_route` | `TEXT` NULL | Optional in-app path for CTA (e.g. `/dashboard/onboarding/design-planning-brief`); virtual system rows can return this without DB column if you build links only in API mapper |
| `completed_at` | `TIMESTAMPTZ` NULL | Set when status → done |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | Use existing `update_updated_at` trigger pattern |

**Indexes:**

- `(user_id, status, sort_order)`
- Partial unique index on `(user_id, source_key)` **where `source_key IS NOT NULL`** for deduped system rows.

**RLS:** If you keep RLS enabled on new tables (recommended), add policies consistent with how `users` / other tables are accessed—today much access may be **via service role in Node**; verify whether Supabase client in server bypasses RLS. Align with existing `mock_planning_briefs` approach.

### 5.2 Derived todos contract

**Required default:** the **Design planning** todo (`source_key`: `design_planning`, `source`: `system`) is **not optional** for product intent—see §4.5. Treat it as the first derived rule you implement.

For each derived rule, define:

- **`source` = `system`**
- **`source_key`** stable string
- **Predicate** (server-side) when the virtual todo should appear
- **Resolution rule:** auto-hide when predicate false **without** requiring staff to delete (either omit from GET merge, or run a periodic reconcile job—omitting at read-time is simpler)

**Design planning rule (canonical):**

- `source_key`: `design_planning`
- Show if: `user_id` has **zero** rows in `mock_planning_briefs` (or none in last N days—product decision).
- Hide if: at least one brief exists (and optionally surface a **completed** history row if you materialize completions—otherwise completed section only reflects DB-backed `done` staff todos).

**Merge algorithm (GET /api/client/todos):**

1. Load curated rows: `source = 'staff'` (and optionally `system` rows already materialized—see below).
2. Compute derived candidates.
3. Drop derived candidate if a curated row exists with same `source_key` OR same semantic fingerprint (if you skip `source_key` on older rows, accept occasional duplication—avoid if possible).
4. Sort: `sort_order` asc, then `due_at` asc nulls last, then `created_at` desc.

**Materialized vs virtual system rows:**

- **Virtual (read-time only):** no DB write for system hints; simplest, always fresh.
- **Materialized:** insert/update `client_todos` when events happen; fewer joins on read but needs write paths—**not** recommended for v1 unless you need auditing of system-generated tasks.

---

## 6. API design

### 6.1 Client routes (`/api/client`)

Mount a new router in `server/src/index.ts`, e.g. `app.use('/api/client', clientTodosRouter);`

| Method | Path | Auth | Behavior |
|--------|------|------|----------|
| `GET` | `/todos` | `authenticate` | Returns **both** open and completed merged todos in **one** payload (see JSON below)—no `includeDone` flag required for the default Todos page UX |
| `GET` | `/todos/summary` | `authenticate` | Returns `{ openCount: number }` (or `{ openCount, totalOpenIds }`) for **taskbar badge** without shipping full lists on every shell load |
| `PATCH` | `/todos/:id` | `authenticate` | Body: `{ status: 'done' \| 'open' }` (strict); verify `user_id` on row matches `req.user.userId` |

**Validation:** express-validator like `mock-planning-briefs.ts`; never trust client-sent `user_id`.

**Response shape (example):** single array with mixed `status`, **or** split arrays—either is fine if documented; Angular Todos page maps to **Active** / **Completed** sections.

```json
{
  "open": [
    {
      "id": "uuid-or-stable-client-id-for-virtual",
      "title": "…",
      "description": "…",
      "category": "planning",
      "status": "open",
      "dueAt": null,
      "source": "system",
      "sourceKey": "design_planning",
      "actionRoute": "/dashboard/onboarding/design-planning-brief",
      "sortOrder": 0,
      "createdAt": "…",
      "updatedAt": "…",
      "completedAt": null
    }
  ],
  "completed": [
    {
      "id": "uuid",
      "title": "…",
      "status": "done",
      "completedAt": "2026-05-01T12:00:00.000Z"
    }
  ]
}
```

Virtual rows need a **stable `id`** strategy for PATCH (if allowed) or **document** that system keys are not PATCHable and only disappear when predicates clear.

Use **camelCase** in JSON to match existing client payloads unless you standardize on snake_case—**match whatever the Angular code already expects** for other endpoints.

### 6.2 Admin routes (`/api/admin`)

| Method | Path | Auth | Behavior |
|--------|------|------|----------|
| `GET` | `/todos?userId=` or `?email=` | admin role | List todos for a user (staff tooling) |
| `POST` | `/todos` | admin | Create todo for `userId` in body |
| `PATCH` | `/todos/:id` | admin | Update fields (title, description, due, sort, status) |
| `DELETE` | `/todos/:id` | admin | Hard delete or soft-delete (`status = cancelled`)—prefer **soft delete** if you want auditability |

**Authorization:** mirror `adminMockPlanningBriefRouter` (`req.user?.role !== 'admin'` → 403).

---

## 7. Angular client implementation

### 7.1 Routing

In `src/app/app.routes.ts` under `dashboard` children, add:

- `path: 'todos'`
- `loadComponent: () => import('./dashboard/todos/dashboard-todos-page').then(m => m.DashboardTodosPageComponent)`
- `title` + `data.portalTitle` / `portalGreeting` for header integration.

Keep **`onboarding/design-planning-brief`** route as-is; remove only from **nav** (§4.1). If `dashboard-overview-page` (or other pages) still link to Design planning, **keep** those links or point them at `/dashboard/todos` with anchor “next step”—product choice.

### 7.2 Dashboard shell: nav swap + badge

- **`dashboard-page.ts`:** replace Design planning `baseNavItems` entry with Todos; inject **`TodosService`** (or `HttpClient`) and load **`/api/client/todos/summary`** on init + on `NavigationEnd` (or subscribe to service `openCount`) so badge stays fresh after Todos / Design planning flows.
- **`dashboard-page.html`:** for the **Todos** `@for` item only, add a child span (e.g. `.dashboard__nav-badge`) when `openTodoCount() > 0`; duplicate for mobile menu + tabbar.
- **`dashboard-page.scss`:** pill styles (size, min-width, font) so **9+** does not clip; position badge top-end of icon stack per breakpoint.

### 7.3 Todos page components (new)

Suggested folder: `src/app/dashboard/todos/`

- `dashboard-todos-page.ts` — OnPush, signals: `openTodos`, `completedTodos` (or single `todos` + `computed` slices), `loadState` (`idle`/`loading`/`error`).
- `dashboard-todos-page.html` — two `<section>`s (or `<section>` + headings): **Active**, **Completed**; semantic lists with `aria-labelledby`.
- Optional `dashboard-todos-page.scss` — reuse dashboard card/tokens from existing pages; avoid one-off hex unless necessary.

### 7.4 HTTP layer

- **`TodosService`** (recommended): centralize `GET /todos`, `GET /todos/summary`, `PATCH /todos/:id`, and a **`refresh()`** / `openCount` signal so **`DashboardPageComponent`** and **`DashboardTodosPageComponent`** share counts without duplicate logic.

Include:

- `Authorization: Bearer <token>` — confirm how other authenticated dashboard calls attach the token (if `AuthInterceptor` exists, use it; otherwise match existing mock-brief client code).

### 7.5 Types

Add `src/app/shared/todos/todos.models.ts` (or colocate under `dashboard/todos/`) with `readonly` fields and string union types for `status`, `category`, `source`; include optional `actionRoute` for CTAs.

### 7.6 Accessibility

- Checkboxes / buttons need **`aria-pressed`** or native `<input type="checkbox">` with explicit labels tied to titles.
- Loading: `aria-busy` on list container; errors: `role="alert"`.

---

## 8. Admin UI (if included)

Mirror `dashboard-admin-mock-briefs-page`:

- Route: `/dashboard/admin/client-todos` (example) with `canActivate: [requireAdminGuard]`.
- Minimal table + create/edit dialog or routed subview.
- Use **typed reactive forms** per Angular standards for create/edit.

Keep copy operational (“Assign to client”, “Due date”)—staff-facing can be slightly more technical than client-facing, but still avoid dumping internal ticket IDs unless labeled clearly.

---

## 9. Security checklist

- **IDOR:** `PATCH /api/client/todos/:id` must load row by `id` **and** `user_id = req.user.userId` before update.
- **Admin:** verify role on every admin route; do not expose list-all without pagination/filter.
- **Rate limiting:** optional; low priority unless public abuse surface appears.
- **XSS:** todos contain user-provided text—**escape by default** in Angular templates; do not bind `innerHTML` unless sanitized pipeline exists.

---

## 10. Observability and operations

- Log structured errors on Supabase failures (already pattern: `console.error` + 500 JSON).
- Consider adding a **`source_key`** index usage note in runbook for ops.

---

## 11. Testing plan

### 11.1 API (automated if you have tests; else manual script)

- Client GET returns merged list for seeded user.
- Client cannot mutate another user’s todo (expect 404 or 403—pick consistent semantics; **404** often safer to avoid existence leak).
- Admin CRUD smoke path.

### 11.2 Angular

- Todos page: active + completed sections; Design planning default appears when no brief.
- Shell: badge hidden at 0 open; increments with seeded open todos; clears after complete + refresh path.
- Optional e2e: login → Todos shows default → submit brief (or mock) → default disappears → badge updates.

---

## 12. Rollout sequence (recommended)

1. ~~**DB:**~~ **Done** — `client_todos` + indexes + triggers in `schema.sql`; `migrate.ts` runs `CREATE_CLIENT_TODOS`.
2. ~~**Server:**~~ **Done** — `GET /todos`, `GET /todos/summary`, `PATCH /todos/:id`, admin CRUD; routers in `index.ts`.
3. ~~**Angular:**~~ **Done** — `TodosService` + `/dashboard/todos` route + nav swap + badge in `dashboard-page.*`.
4. ~~**Todos page:**~~ **Done** — active + completed sections; virtual Design planning + `actionRoute`.
5. ~~**Admin UI:**~~ **Done** — `/dashboard/admin/client-todos`.
6. ~~**Overview:**~~ **Done** — quick action → `/dashboard/todos`; mock brief submit refreshes summary.

---

## 13. Future extensions (document only)

- **Projects table** — move `user_id` to `project_id` when multi-site per org exists.
- **Files requested** workflow — auto-todo when staff uploads a checklist template.
- **Comments / proof loops** — thread per todo.
- **Email digest** — open todos weekly (worker/cron—`worker/index.ts` exists in repo; evaluate fit).

---

## 14. Open decisions (resolve before coding)

1. **Per-user vs per-project** scope for todos.
2. ~~**Done items:**~~ **Decided:** Todos page shows **active + completed**; API returns both (§6.1).
3. **Admin tooling:** in-app vs SQL-only for v1.
4. **Derived rules:** which incomplete states matter day one **after** Design planning default?
5. **Cancellation:** do staff “delete” or mark `cancelled` so clients do not think they still owe work?
6. **Virtual Design planning row:** PATCH allowed or submission-only completion (§4.5)?

---

## 15. File touch list (expected)

| Area | Files (representative) |
|------|-------------------------|
| DB | `server/src/db/schema.sql`, `server/src/db/migrate.ts` (if applicable) |
| Server | `server/src/index.ts`, new `server/src/routes/todos.ts` (name flexible), possibly `server/src/types` |
| Angular routes | `src/app/app.routes.ts` |
| Dashboard chrome | `src/app/dashboard/dashboard-page.ts`, `dashboard-page.html`, `dashboard-page.scss` (nav swap + badge) |
| Shared service | `src/app/shared/services/todos.service.ts` (recommended for count + list + invalidation) |
| Feature | `src/app/dashboard/todos/*`, shared `todos.models.ts`, optional `todos.service.ts` |
| Admin | `src/app/dashboard/admin-client-todos/*` (optional), admin routes in `app.routes.ts` |
| Docs / changelog | Update `CHANGELOG.md` when feature ships (not part of this plan’s execution) |

---

_End of plan._
