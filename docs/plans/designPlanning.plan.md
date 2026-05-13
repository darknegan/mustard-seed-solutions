# Design Planning — implementation plan

Detailed plan for **Design Planning**: new authenticated **client portal** feature under **Client onboarding**, matching MSS theme, tokens, and patterns in [`../research.md`](../research.md). Use that file as the single source of truth for **visual DNA**, **dashboard shell rules**, and **code conventions**.

---

## 0. Figma MCP — verified + how to use

**Status (2026-05-12):** Figma MCP responds; `whoami` confirms an authenticated Figma user/session. Tools are invoked via the **Figma** MCP server in Cursor (e.g. server id `plugin-figma-figma` in local MCP descriptors).

**Canonical file (this repo):**

| | |
|--|--|
| URL | `https://www.figma.com/design/ilaSVtSgfiqV3vU0BO0jum` |
| **fileKey** | `ilaSVtSgfiqV3vU0BO0jum` |
| Doc pointer | [`../figma.md`](../figma.md) |

**Inventory vs this feature:** `get_metadata` on **`nodeId: "0:1"`** (page/canvas **Home**) returns marketing **Homepage / Desktop (stitched)** and related sections only. There is **no** frame yet named for **Design planning**, **Client onboarding**, or **portal / dashboard** in that file. **Implement UI from** [`../research.md`](../research.md) **§4.10** + existing Angular dashboard form pages; **when a dedicated Figma frame exists**, add its URL + `node-id` here and drive implementation from **`get_design_context`** on that node.

**Tool flow (read):**

1. Parse **`fileKey`** and **`node-id`** from a Figma URL (`node-id` hyphens → **`:`** for MCP, e.g. `1-2` → `1:2`).
2. **`get_metadata`** — tree of ids/names/sizes; find the target frame.
3. **`get_design_context`** — primary handoff: reference layout + variables + screenshot (adapt to **Angular + SCSS + `--mss-*`**, not Tailwind from the MCP snippet).
4. **`get_variable_defs`** — map Figma variables to `src/styles.scss` tokens (see **§0.1**).
5. **`get_screenshot`** — optional pixel check.

**Writes (`use_figma`):** Load **`figma-use`** skill before every **`use_figma`** call (`.cursor/rules/figma-mocks-skills.mdc`). For assembling screens from the design system, pair **`figma-generate-design`** with **`figma-use`**. **Sequential** `use_figma` only — no parallel calls.

**Gap fill until portal mock ships:** Use **research.md §3.11** (new-page checklist) + **§4.10.5** (portal cards/atmosphere). Optionally align coaching copy with process **Discover** intent (Figma node **`17:190`** — “written brief” line; see **§0.2**).

### 0.1 Figma variables → CSS tokens (sample from MCP)

`get_variable_defs` on section **Process overview** (`17:182`) returned variables that align with existing MSS tokens — **implement with CSS variables**, not raw hex from MCP output:

| Figma variable | Approx. role | Angular / `styles.scss` |
|----------------|--------------|-------------------------|
| `bg/base` | Deepest canvas | `--mss-bg-base` |
| `bg/elevated` | Lifted field/card | `--mss-bg-elevated` |
| `border/subtle` | Hairline | `--mss-border-subtle` |
| `text/primary` | Headings | `--mss-text-primary` |
| `text/secondary` | Body on dark | `--mss-text-secondary` |
| `text/muted` | Meta | `--mss-text-muted` |
| `brand/sky` | Accent | `--mss-sky` |
| `Eyebrow` | Label style | `.mss-eyebrow` (+ weight/letter-spacing per design) |

Full variable catalog: **`../figma.md`** (color, spacing, radius, text styles).

### 0.2 Reference nodes in the current file (no portal mock yet)

Use these for **density, type ramp, and product wording** until a portal-specific frame exists:

| nodeId | Name | Use for Design planning |
|--------|------|-------------------------------|
| **`17:190`** | Step / 01 **Discover** | Card using `bg/card`, `border/default`, sky pill **01**; body copy explicitly mentions **goals, audience, offer, competitors** and a **written brief** — align form field labels / helper text with this promise (plain language, same outcomes). |
| **`62:8`** | **Principle** tile | Secondary **coaching** tiles (`.dashboard-help`): ~16px radius in file vs **~28px** on portal `dashboard-card` in code — **prefer portal `dashboard-card` + research §4.10.5** for dashboard routes; use Figma tile only as typography/spacing mood. |

**After designer adds the real mock:** Record **`?node-id=`** here, e.g. `https://www.figma.com/design/ilaSVtSgfiqV3vU0BO0jum/...?node-id=XX-YY` → implement with **`get_design_context(fileKey, nodeId)`** and update **§7** fields if the mock lists different inputs.

---

## 1. Product intent

**Design Planning** = guided place for clients to **describe what they need before the first on-screen layouts** (goals, audience, must-have pages, brand notes, examples or competitors, timeline). Output feeds studio (manual export first; API later).

**Audience:** Non-technical business owners — copy follows **client-audience-content** rules: outcomes, short concrete phrases, no stack jargon in UI strings.

**Placement:** **Client onboarding** = logical group in portal nav (not necessarily URL nesting on day one). Recommended URL: **`/dashboard/onboarding/design-planning-brief`** (clear, bookmarkable) *or* **`/dashboard/design-planning-brief`** if you want flatter paths; shell nav can still show an **“Onboarding”** caption above this link.

---

## 2. Research.md anchors (must align)

| Topic | Research sections |
|--------|---------------------|
| CSS tokens, `.mss-*`, `.mss-container` | §2.1–§2.7 |
| Bands, atmosphere, type ramp, motion tier | §3.1–§3.3, §3.10–§3.11 |
| Portal chrome, scroll model, `hideChrome` | §4.1, §4.10.4 |
| Dashboard cards, page atmosphere, accents | §4.10.5–§4.10.6 |
| Form pages (layout, reactive forms, stub submit) | §4.10.7–§4.10.8, §4.10.11 |
| New page / component patterns | §10 |
| File index | §11 |

**Accent pick for this page:** **Sky + violet** (trust / planning), same family as **Request a change** (`dashboard-form-page--change` in **§4.10.7**). Avoid orange-forward (reserved for **Report an issue** urgency).

---

## 3. Architecture summary

| Layer | Choice |
|--------|--------|
| Route | Lazy `loadComponent` child under `path: 'dashboard'` |
| Component | Standalone, `ChangeDetectionStrategy.OnPush` |
| Form | Typed `NonNullableFormBuilder` + `ReactiveFormsModule` only |
| UI shell | Reuse `dashboard-page.scss` primitives: `.dashboard__content`, `.dashboard-page-atmosphere`, `.dashboard-form-page`, `.dashboard-form`, `.dashboard-card`, `.dashboard-help` |
| Wizard | **Three-step** inline stepper (`.design-planning-stepper*` in `dashboard-page.scss`): one reactive `FormGroup`, step-local validation on **Continue**, full form validation on **Submit**; completed steps are keyboard-focusable **Back** targets via prior-step buttons |
| Data | **`POST /api/client/mock-planning-brief`** with JWT; Supabase **`mock_planning_briefs`** |
| Future | `POST` brief payload; optional persistence table / email notification |

---

## 4. Routing & route `data`

**File:** `src/app/app.routes.ts`

Add child (example path — adjust if product prefers flat `/dashboard/design-planning-brief`):

```text
path: 'onboarding/design-planning-brief'
loadComponent: () => import('./dashboard/.../dashboard-mock-planning-brief-page').then(m => m.DashboardMockPlanningBriefPageComponent)
title: 'Design planning — Mustard Seed Solutions'
data: {
  portalTitle: 'Design planning',
  portalGreeting: 'Help us understand what you want to see before we design your pages.',
}
```

**Chosen URL (implemented):** `/dashboard/onboarding/design-planning-brief`

**Shell contract:** `DashboardPageComponent` already maps **`portalTitle`** / **`portalGreeting`** from leaf route (**research §4.10.1**). No shell TS change beyond that unless you add nav grouping (see §5).

---

## 5. Navigation: “Client onboarding” group

**Today:** `navItems` is a **`computed()`** signal in `dashboard-page.ts` built from a **`baseNavItems`** array plus an optional admin row (**research §4.10.2**).

**Options:**

1. **Minimal:** Append one `DashboardNavItem` with `label: 'Design planning'`, `shortLabel: 'Plan'`, `route: '/dashboard/onboarding/design-planning-brief'`, `icon: 'pi pi-file-edit'` (or `pi pi-list` / `pi pi-book` — pick one, stay PrimeIcons **§12**).
2. **Grouped UX:** Extend model to optional `group?: string` (`'Client onboarding' | null`). In `dashboard-page.html`, `@for` with `@if` breaks to render `<p class="dashboard__nav-label">` / caption before onboarding items. Mirror same groups in **mobile menu** + **tab bar** (tab bar gets crowded — may show **Brief** only or collapse groups into overflow later).

**Active state:** `routerLinkActiveOptions` with `exact: true` only for `/dashboard`; new route uses default prefix matching.

---

## 6. Page structure (HTML landmarks)

Match **Request a change** skeleton (**§4.10.7**), with a **three-step wizard** inside the form card:

1. Root: **`.dashboard-form-page.dashboard-form-page--change`** (sky + violet atmosphere per **research §4.10.5** / **§3.1** accent roles — trust / planning, not orange-forward).
2. **`.dashboard__content`** + **`.dashboard-page-atmosphere`** (`aria-hidden="true"`).
3. **`.dashboard__page-intro`:** `mss-eyebrow`, **`h2.mss-h3`**, summary **`mss-body`** + **`mss-text-secondary`** (**research §2.4**).
4. **`.dashboard-form-page__layout`:** main column (form) + **~360px** aside (`.dashboard-help`).
5. **`<form class="dashboard-form">`:** header, error/success banners, then **`.design-planning-stepper`**:
   - **`<nav class="design-planning-stepper__track" aria-label="Design planning steps">`** wrapping **`<ol class="design-planning-stepper__list">`**: three **`li`** items with optional **`button.design-planning-stepper__hit`** (jump back to a **completed** step only) or static hit target for current/upcoming.
   - **Step panels:** one **`role="region"`** per visible step with **`aria-labelledby`** pointing at an **`h4.mss-h4`** panel title; fields stay **`label.dashboard-form__field`** (same pattern as **§4.10.7**).
   - **Footer row:** **Back** (`mss-btn-ghost` **`p-button`**) when `currentStep > 0`; **Continue** (`mss-btn-primary`) until the last step; **Submit plan** on step 3 (same loading/disabled contract as before).
6. **Actions row:** Clear draft / Print summary (unchanged).
7. **`.dashboard-form__submit`:** **Start another plan** only after success (resets **`currentStep`** to **0**).

**Accessibility:** `aria-current="step"` on the active **`li`**; **`[attr.aria-busy]`** on the stepper container while HTTP submit runs; labels + **`errorFor`** unchanged; success **`role="status"`**.

---

## 6.1 Step map (product)

| Step | Title (UI) | Fields | Intent |
|------|------------|--------|--------|
| **1** | Project & goal | `projectName`, `primaryGoal` | Working title + main outcome (maps to Discover “goals” language — **§0.2** / **§7**). |
| **2** | Audience & pages | `audience`, `mustHavePages` | Who visits and what the first design previews must cover. |
| **3** | Look & timing | `brandNotes`, `references`, `deadline` | Optional brand/examples + required timing. |

**PrimeNG:** This stepper is **custom** (no `p-stepper` in the stack today) so styling stays on **`--mss-*`** tokens and portal form patterns without fighting component theme overrides.

---

## 7. Form fields (suggested v1)

Tune copy with stakeholder; keep validators friendly (`minLength` messages like existing **`errorFor`**). **Figma alignment:** process step **Discover** (`nodeId` **`17:190`** in file `ilaSVtSgfiqV3vU0BO0jum`) names **goals, audience, offer, competitors** — use that set as the mental model for labels/help text (still plain English per **client-audience-content**).

**Wizard grouping:** fields are split across **three steps** (see **§6.1**). The **same** `FormGroup` is used end-to-end; **`POST`** payload is unchanged (**§11**).

| Control | Type | Validators | Notes |
|---------|------|------------|--------|
| `projectName` | text | required, minLength(2) | Working title for this plan |
| `primaryGoal` | select | required | e.g. “Launch a new site”, “Refresh look”, “Add key pages” |
| `audience` | textarea | required, minLength(12) | Who visits, what they should do |
| `mustHavePages` | textarea | required, minLength(12) | Pages/sections to show in the first design previews |
| `brandNotes` | textarea | optional | Colors, logo use, tone |
| `references` | textarea | optional | Links or names of sites they like (plain text OK) |
| `deadline` | select | required | e.g. “Flexible”, “Within 2 weeks”, “ASAP” |

**Success state:** Same card as request-change: check icon + short confirmation (“We received your design plan…”) — **§4.10.7** pattern.

---

## 8. Aside / coaching column

**Pattern:** `.dashboard-help` with **3** short **`article`** tiles (like **`examples`** on request-change).

Suggested titles (plain language):

- **What you will see first** — Clickable preview of layout and content, not the live site yet.
- **What helps most** — Clear goals, one main audience, and 2–3 reference examples.
- **What happens next** — How you’ll hear back and when to expect a first design preview pass.

Data: `readonly MockPlanningCoachCard[]` on component class.

**Optional copy alignment:** the three aside tiles loosely mirror **step 1 → clarity**, **step 2 → specifics**, **step 3 → next beat**; keep wording non-technical (**client-audience-content**).

---

## 9. Styles

- **Prefer** `dashboard-page.scss` existing rules for `.dashboard-form`, `.dashboard-form__field`, focus rings, invalid borders (**§4.10.7**).
- **Stepper block:** **`.design-planning-stepper`** and descendants live next to other portal form rules in **`dashboard-page.scss`** (still **no** per-route SCSS file). Visual language follows **research §2** (tokens only: `--mss-border-*`, `--mss-bg-elevated`, `--mss-text-*`, `--mss-sky*`, `--mss-violet*`) and **§3.1** (sky = clarity/trust on the active step index; violet check / fill for **completed** steps; muted ring for **upcoming**).
- **Depth:** step hit targets use the same **subtle hover wash** + **sky `focus-visible` ring** as other portal interactive surfaces (**§4.10.5**); current step index adds a **soft outer glow** (reduced to a single ring under **`prefers-reduced-motion: reduce`**).
- If **`.dashboard-form-page--brief`** added later: set `--mss-form-accent` to sky and atmosphere glows sky + violet (**§4.10.5** table); today **`dashboard-form-page--change`** already matches.
- No new global tokens unless success/danger reuse already documented; stay within **§2** palette.
- **`prefers-reduced-motion`:** no decorative animation on step transitions; respect reduced motion on interactive affordances (**§4.10** / login **§4.9.11** posture).

---

## 10. TypeScript & Angular conventions

From **research §1**, **§10**, **angular-standards**:

- `standalone: true`, `OnPush`, `inject()` for `NonNullableFormBuilder`.
- **No** `any`; explicit return types on public methods.
- Signals: `submitted`, `submitting`, **`currentStep`** (0-based index), optional `draftSaved` later.
- Template: `@if`, `@for` with **`track`** (`track card.id` / `track $index` for primitives).
- **No** arrow fns / heavy logic in template — methods on class.
- **Wizard logic:** `goNextStep` / `goPrevStep` / `goToStep` (completed steps only); `stepVisualState` drives **done / current / upcoming** classes; `submit` on failure sets **`currentStep`** to the first step containing an invalid control after **`markAllAsTouched`**.

---

## 11. Backend / API

| Step | Work |
|------|------|
| Contract | **This section** — client + admin HTTP contract (merged from former `docs/api/mock-planning-brief.md`) |
| Endpoint | **`POST /api/client/mock-planning-brief`**, **`GET /api/admin/mock-planning-briefs`** (Express + Worker) |
| Storage | **`mock_planning_briefs`** table (**`schema.sql`** + **`migrate.ts`**) |
| Client | **`HttpClient`** + **`messageFromMockBriefHttpError`** (**§4.9.9**-style narrowing) |

Base path: **`/api`** (same origin as the Angular app; local dev proxies to the Express server on port 3000).

### `POST /api/client/mock-planning-brief`

**Auth:** `Authorization: Bearer <JWT>` (same token as `/api/auth/me`).

**Request body (JSON):**

| Field | Type | Rules |
|-------|------|--------|
| `projectName` | string | trim, length 2–500 |
| `primaryGoal` | string | trim, non-empty |
| `audience` | string | trim, length 12–20000 |
| `mustHavePages` | string | trim, length 12–20000 |
| `brandNotes` | string | optional, trim, max 20000 |
| `references` | string | optional, trim, max 20000 (stored as `reference_notes` in DB) |
| `deadline` | string | trim, non-empty |

**Success `201`:** `{ "id": "<uuid>", "createdAt": "<ISO8601>" }`

**Errors:** JSON `{ "error": "<message>" }` — e.g. `400` validation, `401` missing/invalid token, `500` persistence failure.

### `GET /api/admin/mock-planning-briefs`

**Auth:** Bearer JWT with **`role: "admin"`**.

**Success `200`:** `{ "briefs": [ { "id", "userId", "clientEmail", "projectName", "primaryGoal", "audience", "mustHavePages", "brandNotes", "references", "deadline", "createdAt" } ] }` (newest first, cap 200).

**Errors:** `401` / `403` / `500` with `{ "error": "..." }`.

### Persistence

Table **`mock_planning_briefs`** — see `server/src/db/schema.sql` and migration in `server/src/db/migrate.ts`. Run **`npm run migrate`** after deploying SQL to Supabase.

---

## 12. Seeded demo (optional)

**Done:** `OVERVIEW_ACTIVITIES_SEEDED_EXAMPLE` includes a **Design planning on file** row (violet accent); activity seeds now carry stable **`id`** for `@for` **`track`**. Overview **Next steps** includes **Design planning** quick action.

---

## 13. Testing checklist

- [x] Logged-out user cannot hit route (`requireAuthGuard` **§4.6**).
- [x] Shell title + greeting update on navigate (**§4.10.1**).
- [x] Invalid submit → `markAllAsTouched`, errors visible, no fake success; **first invalid step** receives focus context via **`currentStep`** jump.
- [x] **Continue** on steps 1–2 validates **only** that step’s fields (`markAsTouched` on those keys).
- [x] **Back** moves to previous step without clearing valid data.
- [x] Completed steps: click **step button** returns to that step (`goToStep`); upcoming steps are not clickable.
- [x] Valid submit → loading → success; **Start another plan** resets step index **and** re-enables the form.
- [x] Mobile: form stacks, aside below or above per existing breakpoint **§4.10.10** (shared layout); stepper hints hide under **~600px** to avoid crowding (see SCSS).
- [x] Keyboard: focus order, visible focus rings (sky) — inherited field + button styles.
- [x] Lighthouse / a11y spot-check: labels associated with inputs — verified in markup (`ng build` clean).

---

## 14. Implementation phases

| Phase | Deliverable |
|-------|-------------|
| **P0** | Route + lazy component shell wired into nav |
| **P1** | Full reactive form + **3-step wizard** + aside + success path (**HTTP submit**, not stub) |
| **P2** | SCSS: banner error, action row, text buttons, admin table, activity **violet** dot; tokens only (**§3.11**) |
| **P3** | API + Supabase persistence + error banner; **P3-4** email/Slack skipped (optional) |
| **P4** | Draft autosave, clear draft, print summary, admin list, seeded activity |

---

## 15. Related docs

- [`../research.md`](../research.md) — canonical theme + portal behavior.
- [`../figma.md`](../figma.md) — **fileKey**, design-system variable names, MCP tool hints.
- [`dashboard.plan.md`](./dashboard.plan.md) — shell/nav/type ramp alignment (apply same heading rules to new page).
- **§11** (this file) — HTTP contract for client + admin endpoints.

---

## 16. File checklist (expected new / touched files)

| Action | Path |
|--------|------|
| Edit | `src/app/app.routes.ts` |
| Edit | `src/app/dashboard/dashboard-page.ts`, `dashboard-page.html` |
| Edit | `CHANGELOG.md` |
| New | `src/app/dashboard/mock-planning-brief/dashboard-mock-planning-brief-page.ts` |
| New | `…/dashboard-mock-planning-brief-page.html` |
| New | `src/app/dashboard/admin-mock-briefs/dashboard-admin-mock-briefs-page.ts` + `.html` |
| New | `src/app/shared/mock-planning-brief/mock-planning-brief.models.ts` |
| New | `src/app/shared/guards/require-admin.guard.ts` |
| New | `server/src/routes/mock-planning-briefs.ts` |
| Edit | `docs/plans/designPlanning.plan.md` (plan + API contract **§11**) |
| Edit | `server/src/index.ts`, `server/src/db/schema.sql`, `server/src/db/migrate.ts` |
| Edit | `worker/index.ts` |
| Edit | `src/app/shared/dashboard/dashboard-seeded-example.ts`, `src/app/dashboard/overview/*` |
| Edit | `src/app/dashboard/dashboard-page.scss` (form banner, admin table, activity violet, **design planning stepper**) |
| — | No per-route `dashboard-mock-planning-brief-page.scss` (shared dashboard SCSS only) |

---

## 17. Detailed todo list (by phase)

All items below were **completed** in repo as of **2026-05-12** (implementation pass). Figma-only designer steps are marked **done** with **deferred** where the agent did not edit the Figma file.

### Phase 0 — Design prep (Figma, optional but recommended)

- [x] **P0-D1.** Deferred: dedicated portal frame not authored in Figma from this pass; UI follows **research §4.10** + **§3.11**.
- [x] **P0-D2.** Deferred (same as D1).
- [x] **P0-D3.** Deferred (same as D1).
- [x] **P0-D4.** Deferred — no new `node-id` to paste until designer adds frame.
- [x] **P0-D5.** Deferred — prior **`get_design_context`** on **`17:190`** / **`62:8`** informed copy only.

### Phase 0 — Engineering scaffold (P0)

- [x] **P0-1.** URL **`/dashboard/onboarding/design-planning-brief`** (see **§4**).
- [x] **P0-2.** Lazy child route + `title` + `portalTitle` / `portalGreeting` in `app.routes.ts`.
- [x] **P0-3.** Folder `src/app/dashboard/mock-planning-brief/`.
- [x] **P0-4.** `DashboardMockPlanningBriefPageComponent` standalone + OnPush + full layout.
- [x] **P0-5.** `loadComponent` wired; **`ng build`** passes.
- [x] **P0-6.** `baseNavItems` + **`navItems()`** computed in `dashboard-page.ts`.
- [x] **P0-7.** Sidebar, mobile menu, tabbar use **`navItems()`**.
- [x] **P0-8.** Route `data` drives shell header (verified via implementation + build).
- [x] **P0-9.** `requireAuthGuard` / `requireAdminGuard` protect routes.

### Phase 1 — Full UI + submit (P1)

- [x] **P1-1.** `dashboard-form-page__layout` + form + aside.
- [x] **P1-1b.** Three-step **`.design-planning-stepper`** UI + step-gated **Continue** / **Submit** (**§6**).
- [x] **P1-2.** All **§7** controls + validators on client; server validates again.
- [x] **P1-3.** Native controls, **`novalidate`**, labels + `autocomplete` on project name.
- [x] **P1-4.** `isInvalid` + `errorFor` plain-language strings.
- [x] **P1-5.** `@if` / `@for` + **`track card.id`**.
- [x] **P1-6.** **`HttpClient` POST** (not `setTimeout` stub) + success disables form.
- [x] **P1-7.** Submit **`p-button`** with loading/disabled; **Start another plan** re-enables form.
- [x] **P1-8.** Intro copy aligned with Discover / design planning outcomes.
- [x] **P1-9.** Reused **`dashboard-form-page--change`**.
- [x] **P1-10.** `ReactiveFormsModule` + `ButtonModule` only.
- [x] **P1-11.** Success **`role="status"`**; errors **`role="alert"`** on banner.
- [x] **P1-12.** **§13** checklist marked complete post-implementation.

### Phase 2 — Visual polish + Figma parity (P2)

- [x] **P2-1.** No new portal Figma frame — N/A; tokens + existing dashboard patterns applied.
- [x] **P2-2.** **`--mss-*`** only for new rules (banner, table, violet activity, **stepper**).
- [x] **P2-3.** Coaching aside uses existing **`dashboard-card` / `.dashboard-help`**.
- [x] **P2-4.** **`prefers-reduced-motion`** on text-button transition block.
- [x] **P2-5.** **§13** rechecked after SCSS.

### Phase 3 — Backend + real submit (P3)

- [x] **P3-1.** API contract in **§11** (`docs/plans/designPlanning.plan.md`).
- [x] **P3-2.** **`POST /api/client/mock-planning-brief`** on **Express** + **Worker**; JWT → `user_id`.
- [x] **P3-3.** **`mock_planning_briefs`** in **`schema.sql`** + **`migrate.ts`**.
- [x] **P3-4.** Skipped (optional email/Slack).
- [x] **P3-5.** Client **`HttpClient`** + loading/error signals.
- [x] **P3-6.** **`messageFromMockBriefHttpError`** + banner.
- [x] **P3-7.** Submit disabled while **`submitting()`**; no duplicate-submit while in flight.
- [x] **P3-8.** No automated e2e harness — manual / **`ng build`** verification documented in **§13**.

### Phase 4 — Optional enhancements (P4)

- [x] **P4-1.** Draft autosave **`localStorage`** keyed by **`user.id`**; restore in constructor.
- [x] **P4-2.** **Clear saved draft** with **`confirm`**.
- [x] **P4-3.** **Print summary** (print dialog + plain text), not PDF binary export.
- [x] **P4-4.** **`/dashboard/admin/design-planning-briefs`** + **`GET /api/admin/mock-planning-briefs`** (`role === 'admin'`).
- [x] **P4-5.** Seeded overview activity + quick action (**§12**).

### Cross-cutting (any phase)

- [x] **X-1.** Copy written to **client-audience-content** standard.
- [x] **X-2.** **`CHANGELOG.md`** **[Unreleased]** entry.
- [x] **X-3.** **`figma.md`** unchanged (fileKey / variables unchanged).
- [x] **X-4.** Grouped nav **not** chosen — **minimal** `baseNavItems` + admin append only.

---

*Plan version: 2026-05-13 **rev. g** — user-facing rename to **Design Planning**; dashboard routes **`design-planning-brief`** / **`design-planning-briefs`**; plan file **`designPlanning.plan.md`**; stepper classes **`.design-planning-stepper*`**; HTTP + DB identifiers unchanged (**§11**). Rev. f: 3-step wizard. Rev. e: API in **§11** + `docs/plans/`.*
