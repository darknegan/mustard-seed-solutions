# Dashboard — theme alignment plan (MSS client portal)

Plan to bring the **client dashboard** (`/dashboard` shell + child pages **Overview**, **My Documents**, **Request a Change**, **Report an Issue**) closer to the marketing visual system documented in [`../research.md`](../research.md): tokens, atmosphere, typography rhythm, card depth, frosted chrome, and form / button parity. The dashboard should still feel **task-focused** (no hero-grade animation), but its bands, surfaces, eyebrows, stats, cards, and form controls should read as the **same product family** as `/`, `/about`, `/process`, `/solutions`, and `/login`.

**Scope:**

- `src/app/dashboard/dashboard-page.{ts,html,scss}` — portal shell (sidebar, mobile top bar, header, scroll pane, mobile tabbar).
- `src/app/dashboard/overview/dashboard-overview-page.{ts,html}` — stats trio, recent activity timeline, next steps quick actions.
- `src/app/dashboard/documents/dashboard-documents-page.{ts,html}` — folder rail + document list.
- `src/app/dashboard/request-change/dashboard-request-change-page.{ts,html}` — change-request reactive form + helpful examples aside.
- `src/app/dashboard/report-issue/dashboard-report-issue-page.{ts,html}` — issue reactive form + “details that help” aside.
- Optional token additions in `src/styles.scss` (success / dashboard surface variants) when alignment requires shared semantics with marketing pages.

**Reference:** [`../research.md`](../research.md) §2 (tokens / utilities), §3.1 (visual DNA), §3.3 (frosted nav), §3.5 (principles glass shell), §3.6 (process overview phase chips + stats), §3.7 (CTA gradient card), §3.8 (timeline rail + glowing dots + “artifact” inset), §3.10 (motion gates), §3.11 (new-page checklist), §3.12 (about atmosphere / scripture aside vocabulary), §4.1 (`hideChrome` shell), §4.2 (nav glyph + wordmark + frosted bar), §4.3 (footer divider rhythm), §4.4 (loading spinner), §4.9 (login chrome — most adjacent surface to dashboard), §6.3 (process-overview stats `<dl>`), §10 (patterns to copy).

Sister plan: [`./login.plan.md`](./login.plan.md) — the dashboard sidebar / header should stay close cousins to the `/login` chrome it succeeds, especially the brand lockup, frosted bar, and atmosphere vocabulary.

---

## Current alignment (keep)

These already match the marketing system and should be preserved as the rest of the work lands:

- **`hideChrome` route data** on `/dashboard` (and child routes inherit) — consistent with `/login` and per-research §4.1, the global `app-nav` / `app-footer` are correctly suppressed; the dashboard supplies its own chrome.
- **Token usage on the major surfaces:** `--mss-bg-base`, `--mss-bg-surface`, `--mss-bg-card`, `--mss-bg-elevated`, `--mss-border-subtle`, `--mss-border-default`, `--mss-text-primary` / `secondary` / `muted` — already drive sidebar, cards, inputs, scrollbar.
- **Sky / orange accent split:** sky for nav-active rail and primary “change” affordances, orange for issue reporting and danger-tilted accents. Matches research §3.1 accent role table (sky = trust, orange = warmth / action).
- **Sidebar nav `.is-active` left rail** (3px gradient + glow) is conceptually the same as Principles `.principle::before` rail and feature tiles. Keep — just propagate the pattern further (see §4 below).
- **Reactive forms** are already typed (`NonNullableFormBuilder`), use `Validators`, and gate submission with `markAllAsTouched()` + `submitted()` signal — matches the login Phase 5 pattern.
- **Lazy-loaded child routes** with `portalTitle` / `portalGreeting` `data` keys feed the shell header from the active leaf route — keep this contract; only the renderer needs alignment.
- **Mobile breakpoint at `1120px`** drops the sidebar in favour of a sticky top bar + bottom tabbar — the underlying responsive intent matches §4.9.10 (login responsive summary). The execution needs polish (see §1, §16, §17).

---

## Gaps and proposed changes

Numbered to align with the phased todo list further down. Each gap names the **research section(s)** it traces back to so the eventual PR description can cite them directly.

---

### 1. Sidebar brand mark & wordmark parity (research §3.3, §4.2, §4.9.3)

**Issue:** `.dashboard__brand-mark` is a **CSS circle** built from `radial-gradient` + box-shadow rather than the shared **glyph SVG** (`/mustard-seed-glyph-logo.svg`) used on **`app-nav`**, **`app-footer`**, and the login header. The wordmark is a single 13px `<strong>Mustard Seed</strong>` + 11px `<small>Client portal</small>`, so the dashboard reads as a *different* product than every other surface that already uses the **two-line lockup** (`Mustard Seed` 700 + `SOLUTIONS` 600 uppercase wide-tracked).

The brand link is `<a href="/">`, which forces a full document load back to marketing — login uses `routerLink="/"` for an SPA return (research §4.9.3). The mobile top bar repeats the same CSS-circle pattern on `.dashboard__mobile-brand`.

**Plan:**

- Replace `.dashboard__brand-mark` with an **`<img>`** of `/mustard-seed-glyph-logo.svg` inside an `aria-hidden="true"` wrapper, **~32–36px** in the sidebar (denser than nav’s 56px because sidebar real estate is tight) and **~28px** on the mobile top bar.
- Apply the **cyan glow** via `filter: drop-shadow(0 0 10px color-mix(in oklab, var(--mss-sky) 34%, transparent))` to match `.nav__mark-logo` and `.login-page__mark-logo`.
- Adopt the **two-line wordmark** lockup (`Mustard Seed` primary, `CLIENT PORTAL` uppercase wide-tracked secondary) so the dashboard sits naturally between login chrome and the rest of the site. Keep `Client portal` as the second line — that label is the dashboard-specific differentiator and replaces login’s `SOLUTIONS`.
- Switch the brand `<a>` to `routerLink="/"` so signed-in clients return to marketing without a hard reload (and `RouterLink` is already imported on the component).

---

### 2. Sidebar surface & atmosphere (research §3.6, §3.12, §4.9.4)

**Issue:** The sidebar has a single linear gradient (`--mss-bg-surface` → mix with `--mss-bg-base`) and one bottom radial sky glow. There is **no grid, no orange counterpoint, no violet orb, no top hairline** — so it reads flatter than the marketing atmosphere system documented in About (§3.12) and the login brand panel (§4.9.4).

**Plan:**

- Add a stack of `aria-hidden="true"` decorative layers under `.dashboard__sidebar`, all `pointer-events: none` and behind `.dashboard__brand`/`.dashboard__nav`/`.dashboard__account` (`z-index: 0`):
  - **Grid:** **56×56px** lines at `rgba(148, 184, 230, 0.04–0.05)` with a **radial mask** biased toward the brand block at the top (matches About §3.12 “center-top readable fold”).
  - **Sky glow** (existing) tuned to ~`160px` blur, **opacity 0.20–0.24**, anchored bottom-right of the sidebar (already roughly there — soften it).
  - **Orange counterpoint** ellipse, same blur family, anchored upper-right behind the brand lockup at low opacity (~0.12) so the orange stays a hint, not a bloom.
  - Optional **violet orb** with `mix-blend-mode: screen` and ~`0.10` opacity for the “premium” tertiary accent (§3.1). Skip if it competes with the active-route rail glow.
- Add a **top hairline gradient** (`transparent → sky → orange → transparent`) as a `::before` on `.dashboard__sidebar` (1px tall, inset 16px from edges) so the panel echoes the principles shell vocabulary (§3.5) and the login card (§4.9.7).
- Mirror the **atmosphere strategy** on `.dashboard__main-atmosphere` (currently two corner glows only): add a faint **64×64px** grid behind the corner glows with a **radial mask** centered around the active page intro, plus a single **violet orb** at low opacity to match About’s tri-color story. Beams are optional and should be hidden under `max-width: 640px` per §3.12 / §4.9.4 mobile guidance.
- Confirm `prefers-reduced-motion: reduce` keeps everything **static** (no infinite drift) — same posture as login (§4.9.11) and About (§3.10).

---

### 3. Header bar — frosted nav parity (research §3.3, §4.2, §4.9.3)

**Issue:** `.dashboard__header` uses `color-mix(in oklab, var(--mss-bg-surface) 92%, transparent)` + `backdrop-filter: blur(12px)` — close, but **not** the frosted recipe shared by the global nav and the login header (`color-mix(in oklab, var(--mss-bg-base) 82%, transparent)`, `backdrop-filter: saturate(140%) blur(18px)` + `-webkit-` prefix, `border-bottom: 1px solid var(--mss-border-subtle)`, `height: var(--mss-nav-height)`). The dashboard header is also taller (`min-height: 88px`) than the 80px nav rhythm.

**Plan:**

- Switch `.dashboard__header` to the **shared frosted formula**: same fill mix, **`saturate(140%) blur(18px)`** (with `-webkit-backdrop-filter`), and align the height to **`var(--mss-nav-height)`** (80px). Padding can stay at 40px desktop / 20–24px mobile — this is a content header, not a global one, but the visual chrome should be indistinguishable from the marketing nav at a glance.
- Move `dashboard__header` from `--mss-bg-surface` to **`--mss-bg-base`** mix so it sits naturally over the page atmosphere (the surface mix currently breaks the layered band model from §3.2).
- Apply the **bottom hairline** as a 1px `--mss-border-subtle` line, identical to the global nav, instead of relying on the implicit `border-bottom` already declared.
- Mirror the same recipe on the **mobile top bar** (`.dashboard__mobile-top`) so mobile users see the same frosted treatment they get on every marketing route.
- Add a `position: sticky; top: 0; z-index: 50;` policy consistent with the global nav (research §4.2 SCSS highlights) — currently the dashboard `__header` is `position: relative` inside the scroll pane, which is correct given the dashboard scroll model, but `.dashboard__mobile-top` already mimics the sticky pattern; keep parity in both places.

---

### 4. Sidebar nav links — propagate principles / phase-chip vocabulary (research §3.5, §3.6)

**Issue:** Inactive links are flat 14px muted text on hover-only `--mss-bg-elevated` swap. Active links get a sky tint + 3px gradient rail — close to principles vocabulary, but the rail is **only on active**. Compared with feature tiles (About §3.12) and tier cards (Solutions §3.9), sidebar items can carry a subtler resting state that already hints at the accent system.

**Plan:**

- Bump inactive `.dashboard__nav-link` to use **`--mss-bg-elevated` at low opacity** for resting state (e.g. `color-mix(in oklab, var(--mss-bg-elevated) 50%, transparent)`), so hover does not feel like a sudden surface jump.
- Add a **left accent micro-rail** (1px tall on rest, 3px gradient on active) so the active treatment reads as an *amplification*, not a new shape — same idea as Principles `.principle::before` (§3.5).
- Replace the four hand-drawn icon glyphs (`data-icon="overview" | "documents" | "request" | "report"`) with **PrimeIcons** classes (e.g. `pi pi-th-large`, `pi pi-folder`, `pi pi-pencil`, `pi pi-flag-fill`). PrimeIcons are already loaded globally per `angular.json` and used everywhere else (research §12), so the dashboard becomes the **only** surface still rolling its own SVG-via-CSS icons. PrimeIcons also scale cleaner under DPR and respect text color for free.
- Add a **PrimeIcons capsule** treatment on hover/active (~28×28px tinted background + soft glow) to echo the feature-tile / phase-chip icon capsules (§3.12, §3.6).
- The mobile **`.dashboard__tabbar`** icons should reuse the same PrimeIcons classes (single source of truth for the dashboard nav icon set).

---

### 5. Account block (sign-out card) — token + button parity (research §2.6, §4.5)

**Issue:** `.dashboard__account` is a hairline card with a custom bare-text **`Sign out`** button. The button uses raw `font-size: 12px`, `font-weight: 500`, color shifts from `--mss-text-muted` to `--mss-sky` on hover. There is no parity with the **`mss-btn-ghost`** ghost-outline button defined globally in `styles.scss` (§2.6), and the avatar `AC` is hard-coded against the company name.

**Plan:**

- Promote the **Sign out** button to **`<button pButton class="mss-btn-ghost p-button-sm">Sign out</button>`** (PrimeNG `ButtonModule` already available as a peer dependency on the login page; importing on the shell is cheap). This gives correct radius, padding, focus ring, and disabled state for free, and matches the “ghost outline on dark surface” language used on `/about` ghost links and the process closing strip.
- Bind the avatar initials to a **computed signal** off `AuthService.user()` (e.g. first letter of `firstName` + first letter of `lastName`, fallback to `companyName`) so the avatar reflects the actual logged-in user instead of the hard-coded `AC`. Same idea as `auth.user()` consumption in §4.5.
- Render the avatar as a **PrimeIcons-style capsule** if the user has no initials (e.g. `pi pi-user`), mirroring the icon-capsule vocabulary used elsewhere.
- Bind `<small>Your site</small>` to a real `siteHost` derived from auth state (or move that copy into a separate `.dashboard__site-label` span) so the account meta isn’t pretending to know `adventurecon.com` when it doesn’t.
- Replace the hard-coded `0 12px 36px rgba(0, 0, 0, 0.22)` shadow with `color-mix(in oklab, var(--mss-bg-base) 78%, transparent)` so the account card respects theme tokens (Phase 9 of the login plan style).

---

### 6. Header titles — typography rhythm + duplicate `h1`s (research §2.4, §3.11, §10)

**Issue:** `dashboard-page.html` renders the active route’s portal title inside `.dashboard__header h1` (`font-size: 22px`), and the child pages render **another** `<h2 class="dashboard__title">` inside `.dashboard__page-intro` (`font-size: 30px`) which is visually larger than the actual `h1`. The eyebrow → display → body rhythm from the new-page checklist (§3.11) is inverted, and the page has two competing primary headings.

The greeting (`.dashboard__header-greeting`) uses raw `font-size: 13px` instead of `mss-body-sm` + `mss-text-secondary`. The page intro `.dashboard__summary` uses raw `font-size: 15px` instead of `mss-body` / `mss-body-lg`.

**Plan:**

- Make the **header `h1`** the **single primary heading** for each page (it already binds to `pageTitle()` which is fed by route data). Apply **`mss-h2`** or a constrained version of `mss-display-lg` to it so the type ramp matches the marketing rhythm but stays compact in the chrome bar. The greeting moves to **`mss-body-sm mss-text-muted`**.
- Demote `.dashboard__page-intro` `<h2 class="dashboard__title">` to a **section heading** — either remove it entirely (the eyebrow + body lede is enough as a “greeting”), or repurpose it as an `<h2>` with `mss-h3` styling that introduces a *sub-section* of the page (e.g. “Your project at a glance” for Overview, “Your project files” for Documents). Single `h1` per route is the rule (see About §9 / login §4.9.2).
- Replace `.dashboard__summary` raw font sizing with **`mss-body mss-text-secondary`**.
- Add **`.mss-eyebrow--orange`** modifiers on the dashboard pages whose mood is warmer (Report an Issue already uses it; Request a Change should pick **default sky** dot to mirror the “sky for trust / change” split; Overview and Documents stay default sky).
- Strip the duplicate `font-size: 30px` / `28px` rules from `.dashboard__content h2:not(.dashboard__title)` once `mss-h*` utilities take over (no double-spec).

---

### 7. Site pill (`adventurecon.com`) — token & data binding (research §2.5, §3.1)

**Issue:** `.dashboard__site-pill` already lives in pill vocabulary, but the pulse dot uses **hard-coded `#4ade80`** + raw box-shadow. Research §3.1 catalogues green as a **success / launch beat** and the principles atmosphere uses violet as the **third** accent — neither has a token in `styles.scss` today. The pill itself also hard-codes `adventurecon.com`.

**Plan:**

- Add a small **success token family** to `styles.scss` (mirroring `--mss-danger-*` from login §4.9.9):
  - `--mss-success-fg: #4ade80;` (or the same `#bbf7d0` text already used on stat badges).
  - `--mss-success-bg: color-mix(in oklab, #22c55e 18%, var(--mss-bg-elevated));`
  - `--mss-success-border: color-mix(in oklab, #4ade80 45%, var(--mss-border-subtle));`
  - `--mss-success-glow: color-mix(in oklab, #4ade80 70%, transparent);`
- Reroute the green pulse dot, the `.dashboard-stat__header span` healthy badge, the `dashboard-activity__item--green` dot, and the mobile status `Live` chip through these tokens — every green surface becomes themeable in one place.
- Drive the host text from **`AuthService.user()` → site host** (or a new `dashboardSite` signal on the shell). Falls back to a generic `Site is live` label if no host is configured. Same pattern as the avatar binding in §5.
- Optionally add a **violet token** (`--mss-violet`, `--mss-violet-strong`) so the principles / about / dashboard atmosphere violet orbs stop relying on raw `#a78bfa`.

---

### 8. Stats trio (Overview) — adopt `<dl>` storytelling (research §3.4 stats, §3.6 stats, §6.3, §9.1)

**Issue:** Overview stats are rendered as `<article class="dashboard-card dashboard-stat">` with `<p>` / `<strong>` / `<small>` — visually fine, **semantically off-pattern**. Hero, About, and Process Overview all use **`<dl> / <dt> / <dd>`** with consistent typography:

- Large value (`<dt>` with display-weight number)
- Uppercase muted descriptor (`<dd>`)
- Optional caption row.

Only one stat carries an accent (`tone: 'sky'` lights up the top hairline); orange and violet tier-style accents are unused, so the trio reads monochrome.

**Plan:**

- Restructure the stats to a `<dl class="dashboard__stats">` with `<dt>` (value) + `<dd>` (label) + optional caption block — same shape as the **process-overview stats** (§6.3) and About `dl.about__stats` (§3.12).
- Carry **`[attr.data-accent]="stat.accent"`** with `'sky' | 'orange' | 'violet'` values, propagating to:
  - top hairline 3px gradient (currently sky-only),
  - large value color (currently `--mss-sky` on sky stat only),
  - badge tint (currently green-only).
- Rename `tone: 'sky' | 'primary'` to `accent: 'sky' | 'orange' | 'violet'` to match the rest of the codebase (Process steps, About features, Solutions tiers all use `accent`). The “healthy” pill should become a separate field (`status: 'success' | 'warn' | 'info'`) so accent and status concerns aren’t conflated on a single field.
- Promote stat values to **`mss-display-lg`**-class typography (or a local clamp around 30–36px) so they read as the same family as About / Hero stats; keep labels at the existing 10px uppercase wide-tracked style — that part already mirrors `mss-eyebrow` cadence.

---

### 9. Recent activity panel — timeline rail vocabulary (research §3.8)

**Issue:** `.dashboard-activity__list` is a vertical list with a **1px subtle border** as the connector and **flat dots** as nodes. The Process timeline (§3.8) uses a **gradient spine** (sky → violet → orange) with **glowing dots** and **speech-bubble cards**. The dashboard activity is the closest dashboard analogue and currently misses the entire visual vocabulary.

**Plan:**

- Replace the implicit `::after` connector with a real **`.dashboard-activity__rail`** absolute element, **2px wide**, gradient `var(--mss-sky-deep) → var(--mss-violet) → var(--mss-orange-strong)` (or a simplified two-stop sky → orange if violet token isn’t added yet), pinned to the dot column, with **fade-out masks** at top/bottom — direct quote of §3.8 spine vocabulary.
- Promote `.dashboard-activity__dot` to a **glowing ring + dot** node: a 14px ring colored to the activity accent + 6px filled dot inside + soft `box-shadow` glow using a `--mss-glow-*` mix. Each accent (`sky` / `orange` / `green` / `muted`) lights its own dot color and glow — keep `green` mapped to the new `--mss-success-*` tokens from §7.
- Wrap each `<li>` body in a **subtle elevated card** (`--mss-bg-elevated`, hairline border, `--mss-radius-md`) so the items read as **timeline cards**, not loose list rows. The h4 + time + description structure already aligns with the `.pstep__card` head + body grouping.
- Headings keep **`mss-h4`-class** styling; time line uses **`mss-body-sm mss-text-muted`**; description uses **`mss-body-sm mss-text-secondary`** instead of raw 11–12px.
- Mobile collapse currently hides the entire activity feed (`@media (max-width: 1120px) { .dashboard-activity { display: none; } }`). That is a real product call, but the timeline-rail upgrade should make it more compelling on tablet sizes — consider re-enabling it from `1120px` down to `760px`.

---

### 10. Next steps actions panel — feature-tile / CTA vocabulary (research §3.5, §3.7, §3.11)

**Issue:** `.dashboard-action` is a hairline row with a 4px colored left border and a CSS-arrow `__chevron`. It’s decent but plain. Marketing CTAs (§3.7) are warm gradient cards with sky bloom; feature tiles (§3.5) carry icon capsules + accent rails. The dashboard action rows could echo the **feature-tile vocabulary** so they feel like the same family as About / Principles tiles.

**Plan:**

- Promote each `.dashboard-action` to a **mini feature tile**:
  - **Left rail** ~3px gradient (`--accent-strong` → mix), same idea as `.principle::before` and `.about__feat::before`.
  - **Icon capsule** (~36×36px) on the left, pulled from PrimeIcons (`pi pi-pencil` for Request a Change, `pi pi-flag-fill` for Report an Issue, `pi pi-folder` for Documents).
  - **Title** (`mss-h4`-class) + **description** (`mss-body-sm mss-text-secondary`) stacked.
  - **Chevron** stays — but bump the chevron size and color it from the accent to keep the visual cue strong.
- Wrap the top of the “Next steps” panel with the **principles top hairline gradient** (transparent → sky → orange → transparent) so the panel header signals the elevated-card family.
- The panel itself should use **`--mss-radius-2xl`** (currently `--mss-radius-lg` via `.dashboard-card`); see §11.
- On hover, lift the action ~4px and add a colored outer glow (`color-mix(in oklab, var(--accent-strong) 35%, transparent)` at ~24px blur) — gated by `prefers-reduced-motion: no-preference`, mirroring About feature hover (§3.12) and principles cards (§3.5).

---

### 11. Card system — radius, hairline, shadow (research §3.5 glass shell, §3.11 card checklist, §4.9.7)

**Issue:** Every dashboard surface uses **`.dashboard-card`** with **`border-radius: var(--mss-radius-lg)`** (16–20px), a single hairline border, and a `0 18px 48px rgba(0, 0, 0, 0.18)` shadow. Compared with the **principles glass shell** (§3.5), the **timeline cards** (§3.8), the **solutions tier cards** (§3.9), and the **login card** (§4.9.7) — all of which sit at **`--mss-radius-2xl`** (28px) with deeper shadows, an **inner top rim**, and an optional **top hairline gradient** — the dashboard cards feel a half-tier shorter on the depth ladder.

**Plan:**

- Bump **`.dashboard-card`** `border-radius` to **`var(--mss-radius-2xl)`**. Cascade-edit any inner elements (e.g. `.dashboard-document__icon` corner, `.dashboard-action` corner) so corners harmonize.
- Add an **inner top rim** highlight via `box-shadow: inset 0 1px 0 color-mix(in oklab, #fff 4%, transparent)` so cards lift off the base band without the heavy outer shadow taking over.
- Add an optional **top hairline gradient** as a `::before` on selected cards (Stats, Activity, Actions, Documents panel, Forms) — same recipe as the login card and principles shell, **left/right inset 16px** so the hairline stops short of the corners.
- Tokenize the outer shadow color: replace `rgba(0, 0, 0, 0.18)` with `color-mix(in oklab, var(--mss-bg-base) 72%, transparent)` so dark-mode adjustments propagate correctly.

---

### 12. Documents folder rail — phase-chip parity (research §3.6 phase chips, §3.11)

**Issue:** Folder buttons use **`--mss-bg-elevated`**, **10px** radius, hairline border, and a sky border on `.is-active`. Research §3.6 documents the **phase chip** vocabulary: **`--mss-bg-elevated`**, **~12px** radius, hairline border, **orange micro-label** for step number, **semibold** title. The dashboard folder list is *one nudge* away from a perfect quote of that chip.

**Plan:**

- Bump folder-button radius to **`var(--mss-radius-md)`** (12px) so it matches the phase-chip family.
- The right-aligned count should adopt the **micro-label** treatment: **uppercase wide-tracked** would be wrong (counts are numeric), but the chip pill background can match the **eyebrow / `.p-tag`** ramp — `var(--mss-bg-card)`, `--mss-text-muted`, `--mss-radius-pill`. Already largely true; just align typography (11px wide-tracked → 11px `mss-body-sm`).
- Add a **left accent rail** (1px on rest, 3px gradient on active) so the rail vocabulary used in the sidebar nav, the principles cards, and the action panel propagates here too — single consistent active treatment across the dashboard.
- Drive the active folder from a **signal** (`activeFolderId = signal<string>('all')`) so the click handler can actually filter `documents`. Currently `[class.is-active]="$first"` makes the buttons cosmetic — wiring them through a signal also gives reduced-motion users a real keyboard control.
- Document folder labels could carry an **icon capsule** (e.g. `pi pi-folder`, `pi pi-image`, `pi pi-pen-to-square`) that matches the documents’ accent system.

---

### 13. Document rows — icon capsule, accent tile, typography (research §3.5, §3.12, §10)

**Issue:** `.dashboard-document` is a 3-column row with a **plain colored 42×42 block** as the icon, a **12px** corner radius, and a **4px colored left border** for accent. The icon is a flat solid square — it neither evokes a file format nor matches the **PrimeIcons capsule** language used everywhere else.

**Plan:**

- Replace `.dashboard-document__icon` with a **PrimeIcons capsule**: `pi pi-file`, `pi pi-image`, `pi pi-file-edit` chosen per `document.type`. Capsule background uses the accent-mix (`color-mix(in oklab, var(--mss-sky | orange | violet) 16%, var(--mss-bg-card))`) and a hairline border in the same mix — mirrors About feature capsule (§3.12) and Solutions tier icon well (§3.9).
- Bump card `border-radius` to **`--mss-radius-2xl`** to ride the §11 cascade.
- Promote the type pill (`Design approval`, `Website copy`, `Launch details`) to the **`.p-tag`** vocabulary (PrimeNG `TagModule`) so the dashboard inherits the same chip styling Home / Solutions tiers use (research §2.7). Severity maps loosely to accent: **`info`** → sky, **`warn`** → orange, **`secondary`** → muted.
- Ensure the document title uses **`mss-h4`**-class typography, the description uses **`mss-body-sm mss-text-secondary`**, the `Updated …` line uses **`mss-body-sm mss-text-muted`**.
- Add an `accent: 'sky' | 'orange' | 'violet' | 'muted'` field on the `ClientDocument` model; propagate via `[attr.data-accent]` and remove the per-class boolean toggles (`dashboard-document--sky`, `--orange`).

---

### 14. Documents panel header & upload action (research §2.6, §3.11)

**Issue:** The **Upload** button is a hand-rolled rounded sky button (`min-height: 38px`, custom border, hover glow). Marketing primary actions use **PrimeNG `p-button`** with **`mss-btn-ghost`** / **`mss-btn-primary`** — the dashboard is the only surface still rolling its own button geometry. The login plan (Phase 5) already migrated submit buttons to PrimeNG.

**Plan:**

- Replace the upload `<button>` with **`<button pButton class="mss-btn-ghost p-button-sm">Upload</button>`** — sky ghost outline matches the existing intent, but inherits global radius, padding, focus ring, disabled, and loading state.
- Wire an **`uploading()`** signal → `[loading]="uploading()"` so the button has a real busy state if the eventual file-upload feature lands.
- Move the panel `<header>` into the **principles top hairline + display-row** vocabulary: title uses `mss-h3`, kicker (`Shared for AdventureCon`) uses `mss-body-sm mss-text-muted`. Bind kicker text to the auth user’s `companyName` so it isn’t hard-coded.
- The panel itself adopts the §11 card upgrade.

---

### 15. Forms — input geometry, submit button, success state (research §2.6, §4.9.7, §4.9.8)

**Issue:** Both **Request a Change** and **Report an Issue** forms use:

- **10px** input/select/textarea border-radius (login forms went to `--mss-radius-md` — 12px family).
- **Custom `<button class="dashboard-form__submit">`** instead of `<p-button>`, contradicting the §2.6 system and the login Phase 5 migration.
- A **plain coloured success banner** that is *not* tokenized (it uses `color-mix(... var(--mss-sky) 12%, transparent)` directly, which is fine, but the markup is just a `<div role="status">`).
- Form headers (`<header><h3>What you noticed</h3>…`) without the principles top hairline + section eyebrow rhythm.
- “Help” asides (`Helpful examples`, `Details that help`) use **plain coloured dot bullets** and **raw 13px** body text.

**Plan:**

- Promote inputs and textareas to **`var(--mss-radius-md)`** (12px) and align focus rings with the login pattern: `outline: 2px solid color-mix(in oklab, var(--accent) 45%, transparent)`, `outline-offset: 2px`, `border-color: var(--accent)` on focus, where `--accent` resolves to `--mss-sky` for the change form and `--mss-orange-strong` for the issue form (already partially done via `.dashboard-form-page--issue` cascade). Tokenize via `--mss-form-accent` so the cascade is data-driven.
- Set **`min-height: 48px`** on text inputs / selects to align with the login form (§4.9.8); textareas keep their `rows` attribute.
- Replace the **submit `<button>`** with **`<p-button type="submit" [label]="…" styleClass="mss-btn-primary dashboard-form__p-button" [loading]="submitting()" [rounded]="true" size="large" />`** for the change form. Issue form swaps `mss-btn-primary` for an orange variant — either reuse `mss-btn-primary` (which is already orange — confirm via `styles.scss`) or introduce `mss-btn-primary--orange` if the change form is sky-styled. Pull the **same** styleClass approach the login submit uses (`mss-btn-primary login-card__p-button`) so the dashboard buttons are visually identical to the login submit at full width.
- Wrap the success banner in the **principles top hairline + small inset card** vocabulary instead of a single hairline `<div>`. Add an icon (`pi pi-check-circle` for change, `pi pi-info-circle` for issue) and `mss-body-sm` text. Keep `role="status"` for screen readers.
- Promote the form `<header>` to use **`mss-eyebrow`** (or `--orange` for the issue form) + `mss-h3` title + `mss-body-sm mss-text-muted` kicker. Ride the principles top hairline (§11).
- Promote the help aside (`.dashboard-help`) to use **timeline-style glowing dot bullets** (same as the new `.dashboard-activity__dot` from §9). The colour follows the form accent (sky on change, orange on issue) — the active accent system propagates correctly.
- Adopt **field-level error messages** under each input (currently the form just refuses to submit on `markAllAsTouched`). Use `mss-body-sm` with `--mss-danger-text` token; same pattern as the login error banner per §4.9.9.

---

### 16. Mobile top bar & bottom tabbar — frosted parity (research §3.3, §4.2)

**Issue:** `.dashboard__mobile-top` and `.dashboard__tabbar` both use **flat `var(--mss-bg-surface)`** with no blur. The marketing nav and login header are both **frosted** — the dashboard mobile chrome should match. The tabbar active state is **sky text + bold weight** with no rail or capsule, weaker than the desktop sidebar active treatment.

**Plan:**

- Apply the **frosted recipe** (`color-mix(... var(--mss-bg-base) 82%, transparent)`, `saturate(140%) blur(18px)`) to `.dashboard__mobile-top` and `.dashboard__tabbar`. Confirm the bottom tabbar still reads against page content when the page background is bright (rare in this dark theme, but worth a check).
- Each tabbar `<a>` adopts the **icon capsule on active** treatment from §4 (PrimeIcons + capsule mix). Active state additionally lights a **3px top rail** (gradient sky → sky-deep) on the tab — mirrors the sidebar `.is-active::before` left rail rotated 90°.
- Add **`focus-visible`** rings on tabbar links to match the sidebar focus rings — currently no visible focus treatment.
- Tabbar height moves to **64–72px** (already 72px — keep). Add the same 1px hairline border on top using `--mss-border-subtle` (already present).

---

### 17. Mobile tabbar accent + reduced motion (research §3.10)

**Issue:** The tabbar already animates nothing (good), but the sidebar nav icons subtly transition on background/color changes. There is no global `prefers-reduced-motion` gate on the dashboard transitions.

**Plan:**

- Wrap **all** dashboard transitions (`.dashboard__nav-link`, `.dashboard-action`, `.dashboard-document`, `.dashboard-documents__upload`, `.dashboard-form__field input/select/textarea`, `.dashboard__sign-out`) in a `@media (prefers-reduced-motion: no-preference)` block, mirroring the login form pattern (§4.9.11).
- Document the policy in the SCSS comments so future contributors know the pattern.

---

### 18. Page-level atmosphere on each child route (research §3.11, §10)

**Issue:** Each child page (`overview`, `documents`, `request-change`, `report-issue`) is currently **just a `<div class="dashboard__content">`** — no per-page atmosphere, no `mss-section`-style band. The shell `.dashboard__main-atmosphere` is the only decor, so all pages look identical even though Process / About / Solutions all carry per-section grids and corner glows.

**Plan:**

- Add a **per-page atmosphere layer** (decorative `<div aria-hidden="true">` inside each child page’s root) with:
  - **Faint grid** (32–48px cells, lower contrast than the shell atmosphere) — anchored differently per page (top-left for Overview, right side for Documents, around the form column for the form pages).
  - **Single corner glow** in the page’s primary accent (`--mss-sky` for Overview, `--mss-orange` for Report an Issue, `--mss-sky` for Request a Change, `--mss-violet` or `--mss-orange` for Documents).
- Confirm the layer sits **behind** the page content (`z-index: 0`, content `z-index: 1`) and uses `pointer-events: none`.
- Disable the per-page atmosphere at `max-width: 640px` to keep mobile lightweight (research §3.4 / §4.9.4 mobile guidance).

---

### 19. Loading & empty states (research §4.4, §4.1)

**Issue:** No loading state when route children lazy-load (the shell relies on the global route loader from `App`). No empty state on Documents / Overview when the user has no documents / no activity yet. The `app-loading-spinner` (§4.4) already exists and is used by the route loader.

**Plan:**

- Wire **`app-loading-spinner size="md" color="sky"`** as a **fallback render inside `.dashboard__scroll`** when the lazy child component hasn’t resolved yet (currently the spinner is global-only).
- Add **empty-state components** (or inline `@if (!documents.length)` / `@if (!activities.length)` blocks) that show:
  - PrimeIcons illustration (`pi pi-folder-open`, `pi pi-history`).
  - **`mss-h4`** title + **`mss-body-sm mss-text-secondary`** body.
  - Optional CTA button using `mss-btn-ghost` ("Request your first change", "Upload your first document").
- Apply the same empty-state vocabulary to the Activity feed (Overview) so the dashboard is graceful before the user has historical events.

---

### 20. Copy tone audit (workspace `client-audience-content.mdc` rule)

**Issue:** Most copy is already client-friendly. A few strings still lean technical or system-flavoured:

- `Site health` → `Site status`.
- `adventurecon.com is online` → `Your site is live and visible to visitors.`
- `Your file are ready when you need them` (typo: `Your files`).
- `Documents pending review` → `Changes pending review`.
- `Tell us what broke so we can reproduce it quickly.` is already friendly — keep.
- Form labels (`Where did you see it?`, `What kind of problem is it?`) — keep, they are already plain-language.

**Plan:**

- Pass through every string in the four child page TS files + the shell with the **client-audience** lens. Replace any remaining vendor-style language (e.g. “site health”, “domain configuration”, “DNS cutover”) with outcome-led equivalents.
- Greeting copy fed via route `data.portalGreeting` should explicitly avoid stack jargon (currently safe).
- Document the **tone rule** in the dashboard SCSS preamble as a comment so future copy edits stay aligned.

---

### 21. Tokens to introduce in `styles.scss` (research §2.1)

Consolidating the new tokens introduced through this plan so they land in **one PR slice** before downstream pages depend on them:

- **Success family** (§7): `--mss-success-fg`, `--mss-success-bg`, `--mss-success-border`, `--mss-success-glow`.
- **Violet family** (optional, §2 / §7): `--mss-violet`, `--mss-violet-strong`, `--mss-glow-violet` — only if the violet orb / activity dot stops being raw `#a78bfa` / `#4ade80` and propagates across About / Login / Dashboard.
- **Form accent local var** (§15): `--mss-form-accent` (consumed by `.dashboard-form` and toggled by the page-level `--issue` modifier) — keeps focus-ring color tokenized.
- **Dashboard nav rail gradient** (optional, §4): `--mss-rail-active: linear-gradient(180deg, var(--mss-sky), var(--mss-sky-deep))` reused by sidebar, tabbar, and folder list.

---

## Detailed todo list (phased)

Work **top to bottom** unless parallelizing safe tasks (e.g. tokens in `styles.scss` while editing dashboard SCSS). **Optional** phases can ship in a follow-up PR. Each phase is sized for a single PR slice.

### Phase 1 — Tokens (foundation)

- [x] Audit `src/styles.scss` for an existing **success family**; if missing, add **`--mss-success-fg`** / **`--mss-success-bg`** / **`--mss-success-border`** / **`--mss-success-glow`** alongside `--mss-danger-*` (§7, §21).
- [x] Decide on a **violet family**: introduce `--mss-violet` / `--mss-violet-strong` / `--mss-glow-violet` if the principles + about + dashboard atmospheres should share violet via a token (§2, §7). Otherwise keep raw `#a78bfa` for now and note the deferral.
- [x] Add **`--mss-rail-active`** gradient if the sidebar / tabbar / folder rail share a single source of truth (§4, §16, §12).
- [x] Snapshot the token additions in the PR description so reviewers see the surface change before code changes.

### Phase 2 — Sidebar brand & wordmark

- [x] Replace `.dashboard__brand-mark` and `.dashboard__mobile-brand` mark with **`<img src="/mustard-seed-glyph-logo.svg">`** (§1).
- [x] Apply the **cyan glow** filter via `drop-shadow(... var(--mss-sky) 34%, transparent)`.
- [x] Adopt the **two-line wordmark lockup** (`Mustard Seed` 700 + `CLIENT PORTAL` uppercase wide-tracked).
- [x] Switch the brand link from `<a href="/">` to **`routerLink="/"`** so signed-in clients return to marketing without a hard reload.
- [x] Mirror the same glyph treatment on the mobile top bar (smaller dimensions).
- [x] Visual diff against `app-nav` and `/login` header at desktop and 640px to confirm parity.

### Phase 3 — Sidebar atmosphere

- [x] Add `aria-hidden="true"` decorative layers under `.dashboard__sidebar`: **grid (56×56)**, **sky glow** (tune existing), **orange counterpoint**, optional **violet orb** (§2).
- [x] Add **top hairline gradient** `::before` on `.dashboard__sidebar` (transparent → sky → orange → transparent, 1px, inset 16px).
- [x] Confirm `prefers-reduced-motion` keeps everything **static** — no infinite drift / pan.

### Phase 4 — Header & mobile top bar frost

- [x] Migrate `.dashboard__header` to the shared **frosted recipe** (`color-mix(... --mss-bg-base 82%)`, `saturate(140%) blur(18px)`, `border-bottom: 1px solid var(--mss-border-subtle)`, `height: var(--mss-nav-height)`) (§3).
- [x] Apply the same recipe to `.dashboard__mobile-top`.
- [x] Confirm padding rhythm at desktop (40px) and mobile (20–24px) still feels right after the height change.
- [x] Add `-webkit-backdrop-filter` for Safari coverage.

### Phase 5 — Header titles & page intro typography

- [x] Make `.dashboard__header h1` the **single primary heading** per route; bind the `pageTitle()` signal to it (already wired) and apply **`mss-h2`** or a constrained `mss-display-lg` (§6).
- [x] Demote `.dashboard__page-intro h2` to either an **`<h2>`** with `mss-h3` styling **or** remove it — pick one path and apply across all four child pages.
- [x] Promote `.dashboard__summary` to **`mss-body mss-text-secondary`**.
- [x] Standardize eyebrow modifiers per page: Overview default sky, Documents default sky, Request a Change default sky, Report an Issue **`mss-eyebrow--orange`** (already correct) (§6).
- [x] Strip duplicate `font-size` rules now superseded by `mss-h*` / `mss-body*` utilities (avoid double-spec).

### Phase 6 — Sidebar nav links & PrimeIcons migration

- [x] Replace the four `data-icon` CSS-drawn glyphs with **PrimeIcons** classes: `pi pi-th-large`, `pi pi-folder`, `pi pi-pencil`, `pi pi-flag-fill` (§4).
- [x] Promote inactive `.dashboard__nav-link` resting state to a softer `--mss-bg-elevated` mix and add a 1px left rail.
- [x] Bump active rail to 3px gradient (already there) and add **icon capsule** on active (~28×28 tinted background + soft glow).
- [x] Mirror the PrimeIcons set on the mobile **`.dashboard__tabbar`** (single source of truth for icon glyphs).
- [x] Confirm `focus-visible` rings on both nav and tabbar.

### Phase 7 — Account block & sign-out button

- [x] Bind `.dashboard__avatar` initials to a **computed signal** off `AuthService.user()` (§5).
- [x] Swap hard-coded `AdventureCon` / `Your site` for auth-driven values (or move into `dashboard-page.ts` signals fed by data).
- [x] Promote the **Sign out** button to **`<button pButton class="mss-btn-ghost p-button-sm">`** — import `ButtonModule` on the dashboard component.
- [x] Tokenize the existing rgba shadow (`color-mix(... --mss-bg-base 78%)`).

### Phase 8 — Site pill & success tokens

- [x] Migrate the green pulse dot, healthy badge, mobile status `Live`, and activity green dot to **`--mss-success-*`** tokens (§7).
- [x] Bind the host text (`adventurecon.com`) to a real auth-derived host signal.
- [x] Optionally migrate the violet decor to **`--mss-violet*`** tokens.

### Phase 9 — Card system upgrade

- [x] Bump **`.dashboard-card`** `border-radius` to **`var(--mss-radius-2xl)`** (§11).
- [x] Add the **inner top rim** highlight via `box-shadow: inset 0 1px 0 ...`.
- [x] Add **top hairline gradient** `::before` on Stats / Activity / Actions / Documents panel / Forms cards (left/right inset 16px).
- [x] Tokenize outer shadow (`color-mix(... --mss-bg-base 72%, transparent)`).
- [x] Cascade radius into nested elements (`.dashboard-document`, `.dashboard-action`, `.dashboard-stat`).

### Phase 10 — Stats trio (Overview)

- [x] Restructure stats markup to **`<dl>` / `<dt>` / `<dd>`** in `dashboard-overview-page.html` (§8).
- [x] Rename the data field `tone` to `accent: 'sky' | 'orange' | 'violet'`; introduce a separate `status` field for badges (`'success' | 'warn' | 'info'`).
- [x] Propagate `[attr.data-accent]` on each stat card; light the top hairline + value color from the accent.
- [x] Bump value typography toward **`mss-display-lg`** family (or a local clamp).
- [x] Confirm the mobile responsive collapse (`.dashboard__stats` 2-column at `1120px`) still reads well after the type bump.

### Phase 11 — Recent activity → timeline rail

- [x] Replace the implicit `::after` border with a real **`.dashboard-activity__rail`** absolute element, 2px gradient (sky-deep → violet → orange-strong) (§9).
- [x] Promote `.dashboard-activity__dot` to a **glowing ring + dot** node, accent-driven.
- [x] Wrap each `<li>` body in an elevated card (`--mss-bg-elevated`, `--mss-radius-md`, hairline border).
- [x] Migrate typography to `mss-h4` / `mss-body-sm mss-text-muted` / `mss-body-sm mss-text-secondary`.
- [x] Re-evaluate hiding the activity feed on mobile — consider re-enabling at `≥760px`.

### Phase 12 — Next steps actions

- [x] Promote `.dashboard-action` to **mini feature tile** vocabulary: 3px gradient left rail + PrimeIcons capsule + `mss-h4` title + `mss-body-sm mss-text-secondary` description (§10).
- [x] Color the chevron from the accent strong color.
- [x] Add hover lift + colored glow gated by `prefers-reduced-motion`.
- [x] Ensure the panel header rides the §9 top hairline.

### Phase 13 — Documents folder rail

- [x] Wire an `activeFolderId` signal in `dashboard-documents-page.ts` and bind `[class.is-active]="folder.id === activeFolderId()"` (§12).
- [x] Bump folder-button radius to **`var(--mss-radius-md)`** and add the 1px → 3px left rail.
- [x] Add PrimeIcons capsules per folder (`pi pi-folder`, `pi pi-image`, `pi pi-pen-to-square`, `pi pi-flag-fill` for launch).
- [x] Hook the folder click into a `documents` filter (computed signal off `activeFolderId`).

### Phase 14 — Document rows

- [x] Replace `.dashboard-document__icon` block with a **PrimeIcons capsule** (§13).
- [x] Promote the type pill to **`<p-tag>`** with severity mapped from `accent`.
- [x] Migrate typography to `mss-h4` / `mss-body-sm mss-text-secondary` / `mss-body-sm mss-text-muted`.
- [x] Rename `tone` to `accent` on `ClientDocument` and propagate via `[attr.data-accent]`.
- [x] Cascade card radius to `--mss-radius-2xl`.

### Phase 15 — Documents panel header & upload

- [x] Replace the upload `<button>` with **`<button pButton class="mss-btn-ghost p-button-sm">`** (§14).
- [x] Wire an `uploading()` signal (placeholder for future file-upload feature).
- [x] Adopt the `mss-h3` + `mss-body-sm mss-text-muted` header rhythm; bind the kicker to `auth.user().companyName`.

### Phase 16 — Forms (Request a Change + Report an Issue)

- [x] Bump input/select/textarea radius to **`var(--mss-radius-md)`** and `min-height: 48px` on text inputs / selects (§15).
- [x] Promote the submit button to **`<p-button styleClass="mss-btn-primary dashboard-form__p-button" size="large" [rounded]="true" [loading]="submitting()" />`** in both forms.
- [x] Tokenize the focus accent via **`--mss-form-accent`** (sky default, orange on `.dashboard-form-page--issue`).
- [x] Wrap success banners in a small inset card with PrimeIcons + `mss-body-sm` text.
- [x] Promote the form `<header>` to `mss-eyebrow` + `mss-h3` title + `mss-body-sm mss-text-muted` kicker.
- [x] Promote help asides (`Helpful examples`, `Details that help`) to use **timeline glowing-dot bullets** matching the activity rail vocabulary; align typography.
- [x] Add **field-level error messages** under each invalid input on `markAllAsTouched`, using `--mss-danger-text`.
- [x] Confirm both forms still pass `Validators` exactly as before — only the rendering changes, not the contract.

### Phase 17 — Mobile top bar & tabbar frost

- [x] Apply the **frosted recipe** to `.dashboard__mobile-top` and `.dashboard__tabbar` (§16).
- [x] Add icon capsules + 3px top rail on tabbar `.is-active`.
- [x] Add `focus-visible` rings on tabbar links.
- [x] Confirm the mobile chrome reads against the page atmosphere on the four child pages.

### Phase 18 — Reduced-motion gate

- [x] Wrap **all** dashboard transitions in `@media (prefers-reduced-motion: no-preference)` blocks (§17).
- [x] Document the policy in the dashboard SCSS preamble.

### Phase 19 — Per-page atmosphere

- [x] Add a decorative `<div aria-hidden="true">` layer to each child page root (§18).
- [x] Tune the grid + corner glow per page accent (sky for Overview / Request a Change, orange for Report an Issue, sky/violet for Documents).
- [x] Disable the per-page atmosphere at `max-width: 640px`.

### Phase 20 — Loading & empty states

- [x] Wire `app-loading-spinner` as the lazy-load fallback inside `.dashboard__scroll` (§19).
- [x] Add empty-state markup to Overview activity feed and Documents list — PrimeIcons illustration + `mss-h4` + `mss-body-sm mss-text-secondary` + `mss-btn-ghost` CTA.
- [x] Confirm screen reader announcements on empty states (use `role="status"` where appropriate).

### Phase 21 — Copy & tone pass

- [x] Pass through all four child page `.ts` files + shell strings against the workspace `client-audience-content.mdc` rule (§20).
- [x] Fix any remaining technical-flavoured strings (`Site health` → `Site status`, etc.).
- [x] Confirm route `data.portalGreeting` strings stay outcome-led.

### Phase 22 — Verification & visual diff

- [x] Run through the **Verification checklist** below and tick items in the PR description.
- [x] Visual regression: **desktop ≥1280px**, **1120px** (mobile collapse breakpoint), **900px**, **640px**, **375px**.
- [x] Spot-check `prefers-reduced-motion: reduce` (no animation, decor stays static).
- [x] Spot-check **Tab** keyboard order across sidebar → header → page content → tabbar.
- [x] Compare side-by-side with `/login` (chrome continuity), `/about` (atmosphere parity), and `/process` (timeline rail parity).
- [x] Optional follow-up: extract a shared **brand header** partial if `app-nav` + login header + dashboard sidebar all duplicate the lockup markup.

---

## Out of scope / defer

- **Hero-grade animation stack** (aurora, scanline, SVG stage, rotating phrase) — wrong surface for the dashboard; conflicts with focus, perf, and the “task-focused portal” posture (research §3.4 mobile-stripping logic + login §4.9.12 explicit non-goals).
- **Re-enabling global `app-nav` / `app-footer`** on `/dashboard` — the dashboard supplies its own chrome by design (research §4.1).
- **Multi-tenant / team switcher UI** — not in the current data model. The avatar bind in §5 should stay simple until `AuthService` exposes a tenant list.
- **Real-time websocket activity feed** — Phase 11 only restyles the existing static activities; live updates are a product follow-up.
- **Document upload feature** — Phase 15 only restyles the button. The actual upload flow (file picker, progress, validation) is a separate plan.
- **Dark / light theme toggle** — `styles.scss` is single-theme today; Phases 1, 9, 11 should still tokenize aggressively so a future theme switch is a token swap, not a markup rewrite.

---

## Verification checklist

- [x] Dashboard sidebar uses the **shared glyph SVG** + two-line wordmark; no CSS-circle brand mark remains (§1).
- [x] Sidebar carries **grid + corner glows + top hairline**; reduced-motion users see static decor (§2).
- [x] `.dashboard__header` and `.dashboard__mobile-top` use the **`saturate(140%) blur(18px)` frost** identical to `app-nav` and the login header (§3).
- [x] **One `<h1>` per route**, bound to the route’s `portalTitle`, styled with `mss-h2`/`mss-display-lg`-class typography; no duplicate primary headings inside `.dashboard__page-intro` (§6).
- [x] All eyebrows use **`mss-eyebrow`** (with `--orange` modifier where the page mood is warm) — no per-page custom eyebrow CSS (§6).
- [x] All sidebar / tabbar icons are **PrimeIcons**; no `data-icon` CSS-drawn glyphs remain (§4, §16).
- [x] **`.dashboard-card`** sits at **`--mss-radius-2xl`** with inner top rim + optional top hairline gradient (§11).
- [x] Stats render as **`<dl>` / `<dt>` / `<dd>`** with `[attr.data-accent]` propagation; values use `mss-display-lg`-family typography (§8).
- [x] Activity feed has a **gradient timeline rail** + **glowing dot nodes** + per-item elevated card (§9).
- [x] Action rows render with **icon capsule + accent rail + `mss-h4` title** vocabulary (§10).
- [x] Documents list uses **PrimeIcons capsules** + **`<p-tag>`** type chips + `accent`-driven cards (§13, §14).
- [x] Forms use **`--mss-radius-md`** inputs + **`<p-button styleClass="mss-btn-primary">`** submits + token-driven success / error states + field-level error messages (§15).
- [x] **Sign out** button uses **`mss-btn-ghost`** via `pButton`; avatar initials and host text bind to `AuthService.user()` (§5, §7).
- [x] **`prefers-reduced-motion: reduce`** disables every transition on dashboard surfaces; no infinite animations exist anywhere (§17).
- [x] Per-page atmosphere ships on Overview, Documents, Request a Change, Report an Issue and **disables** at `max-width: 640px` (§18).
- [x] Token additions (`--mss-success-*`, optional `--mss-violet*`, `--mss-rail-active`, `--mss-form-accent`) live in `styles.scss` and are referenced from at least two surfaces each (§7, §15, §21).
- [x] No raw hex colours remain on the dashboard surfaces except inside the new tokens themselves (§7, §11, §21).
- [x] Touch targets ≥ 44px on sidebar, tabbar, action rows, document rows, form inputs, submit buttons.
- [x] Visual spot-check at desktop, 1120px, 900px, 640px, 375px confirms parity with `/login`, `/about`, and `/process`.

---

*Companion to [`./about.plan.md`](./about.plan.md) and [`./login.plan.md`](./login.plan.md). Lives next to `../research.md` so cross-references stay short and the dashboard work can ship in PR-sized phase slices.*
