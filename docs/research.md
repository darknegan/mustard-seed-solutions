# Marketing pages reference — Home, About, Process, Solutions

Reference for how the **home** (`/`), **about** (`/about`), **process** (`/process`), **solutions** (`/solutions`), and **client login** (`/login`) experiences are wired in Angular, how HTML is structured, and how the shared **MSS** theme (CSS variables + utility classes) ties sections together. Use **§3** for **visual layout, enhanced effects, and Figma MCP** alignment; use later sections for code structure and file paths.

Implementation alignment notes for `/about` live in [`plans/about.plan.md`](plans/about.plan.md) (atmosphere, typography, feature tiles, scripture card, stats, CTA parity). **Login / client portal gate** alignment and phased implementation history live in [`plans/login.plan.md`](plans/login.plan.md); the canonical **runtime + visual spec** for `/login` is **§4.9** below.

---

## 1. High-level architecture

| Concern | Detail |
|--------|--------|
| Framework | Angular (standalone components, `ChangeDetectionStrategy.OnPush`) |
| Global styles | `src/styles.scss` (design tokens, `.mss-*` utilities, PrimeNG overrides) |
| Third-party UI | PrimeNG (`ButtonModule`, `TagModule`), PrimeIcons (`pi pi-*`) |
| App shell | `App` → sticky `app-nav`, `<main id="main">` + `router-outlet`, `app-footer` (hidden when `data.hideChrome === true`) |
| Routing | `src/app/app.routes.ts` — marketing routes are **eager** (not lazy-loaded); titles set via `title` on each route |

### Route → component map

- **`''`** → `Home` (`src/app/home/home.ts`)
- **`'about'`** → `AboutPageComponent` (`src/app/about/about-page.ts`)
- **`'process'`** → `ProcessPageComponent` (`src/app/process/process-page.ts`)
- **`'solutions'`** → `SolutionsPageComponent` (`src/app/solutions/solutions-page.ts`)
- **`'login'`** → **`LoginPageComponent`** (`src/app/login/login-page.ts`) — **lazy-loaded** (`loadComponent`); **`data.hideChrome: true`**; **`redirectToDashboardIfLoggedInGuard`** (logged-in users skip the screen); route **`title`:** `Client sign in — Mustard Seed Solutions` (`app.routes.ts`)

### Composition pattern (important)

- **Home** is an assembly of **four** section components only: `Hero`, `ProcessPrinciples`, `ProcessOverview`, `Cta`.
- **Process** and **Solutions** **reuse** the heavy section implementations from `src/app/home/sections/`:
  - `/process` renders `<app-process />` (`ProcessComponent`).
  - `/solutions` renders `<app-solutions />` (`SolutionsComponent`).
- **About** follows the same **thin wrapper** pattern as Process/Solutions: `/about` renders `<app-about />` (`AboutComponent` from `home/sections/about/`) plus **`<app-cta />`** so the route closes with the same contact funnel as Home (`about-page.html`).

So: **one source of truth** for the full process timeline and pricing UI lives under `home/sections/`; About’s section implementation also lives there but is **only** mounted from `AboutPageComponent`, not from `Home`. Dedicated marketing routes use thin wrappers (`about-page`, `process-page`, `solutions-page`) with `id="top"` + a page wrapper class + minimal layout SCSS.

Home’s `home.html` does **not** currently include `AboutComponent`.

---

## 2. Global theme (`src/styles.scss`)

### 2.1 CSS custom properties (tokens)

All marketing sections should prefer these variables over hard-coded hex values when possible:

- **Surfaces:** `--mss-bg-base`, `--mss-bg-surface`, `--mss-bg-elevated`, `--mss-bg-card`
- **Borders:** `--mss-border-subtle`, `--mss-border-default`, `--mss-border-strong`
- **Text:** `--mss-text-primary`, `--mss-text-secondary`, `--mss-text-muted`, `--mss-text-on-brand` (dark text on orange/sky fills)
- **Brand accents:** `--mss-sky`, `--mss-sky-strong`, `--mss-sky-deep`, `--mss-orange`, `--mss-orange-strong`, `--mss-orange-deep`
- **Radii:** `--mss-radius-sm` … `--mss-radius-2xl`, `--mss-radius-pill`
- **Layout:** `--mss-container` (1200px content width intent), `--mss-nav-height` (80px)
- **Destructive / alerts:** `--mss-danger-bg`, `--mss-danger-text`, `--mss-danger-border` (login error banner and shared alert styling — **§4.9.9**)

### 2.2 Layout primitive: `.mss-container`

- `max-width: calc(var(--mss-container) + 48px)` with `padding-inline: 24px`.
- Wrap section **content** (not necessarily decorative full-bleed backgrounds).

### 2.3 Section primitives: `.mss-section*`

| Class | Purpose |
|-------|---------|
| `.mss-section` | Default vertical rhythm: `padding-block: 120px` (72px on small screens). |
| `.mss-section--page-top` | First section below global nav: **reduced top padding** (`32px` desktop, `24px` mobile) so you don’t stack “nav gap + huge section top padding.” Used on **about**, **process**, and **solutions** root sections. |
| `.mss-section--base` | Background `var(--mss-bg-base)` — default “main” dark band. |
| `.mss-section--surface` | Background `var(--mss-bg-surface)` — slightly lifted band (used on **solutions**). |

**Hero** uses `mss-section--base` plus its **own** gradient stack inside `.hero` (section background token + hero-specific gradients).

### 2.4 Typography utilities

- Display: `.mss-display-xl`, `.mss-display-lg`
- Headings: `.mss-h1` … `.mss-h4`
- Body: `.mss-body-lg`, `.mss-body`, `.mss-body-sm`
- Color modifiers: `.mss-text-primary`, `.mss-text-secondary`, `.mss-text-muted`, `.mss-text-sky`, `.mss-text-orange`

Responsive font scaling for display sizes is **centralized** in `styles.scss` (e.g. `@media (max-width: 1024px)` / `640px`).

### 2.5 Eyebrow labels: `.mss-eyebrow`

- Pill-shaped label with a **leading dot** (`::before`).
- Modifier: `.mss-eyebrow--orange` changes the dot to orange (used for “The process” labels).

### 2.6 Buttons (PrimeNG + brand)

PrimeNG `.p-button` gets global radius and weight. Brand variants:

- **Primary CTA:** `styleClass="mss-btn-primary"` (orange fill, dark text)
- **Ghost outline:** `styleClass="mss-btn-ghost"` (transparent, bordered)
- **On strong/color backgrounds:** `styleClass="mss-btn-on-brand"` (used in CTA card over orange gradient)

Anchor tags often mimic buttons: `class="p-button p-component p-button-lg mss-btn-ghost"` etc.

### 2.7 PrimeNG tags

`.p-tag` is tuned globally (pill, uppercase, small type). Some sections use `::ng-deep` to position/style tags (e.g. tier badges on solutions cards).

---

## 3. Visual layout, hierarchy & Figma MCP reference

Use this when creating or extending frames in **Figma** (via MCP or otherwise) so mocks match **composition**, **depth**, and **motion intent** in code. Map colors and radii to **§2 tokens** as Figma variables where possible.

### 3.1 Overall visual DNA

| Trait | What to draw |
|--------|----------------|
| **World** | Dark, slightly **blue-shifted** charcoal — not neutral gray. Sections read as **bands** (base vs surface) plus optional **full-bleed effects**. |
| **Depth** | Separation comes from **soft elevation shadows** (large blur, dark at low opacity), **hairline borders** (`--mss-border-subtle` / `default`), and occasional **inner highlights** (1px white at ~2–6% opacity). |
| **Accent roles** | **Orange** = primary action & warmth. **Sky/cyan** = tech, clarity, trust. **Violet** = design / depth / “premium” beats. **Green** (`#4ade80`) = launch / success beats only. |
| **Type** | **Inter**: display sizes with **tight negative tracking**; meta labels with **wide tracking + uppercase** (eyebrows, stat captions, section labels). |
| **Radii** | UI blocks: **12–28px**; fully rounded **pills** for buttons, chips, eyebrows, tags. |
| **Measure** | Content lives in **~1200px** max width with **24px** side gutters (`mss-container`). |

### 3.2 Vertical composition (scroll model)

```text
┌─ Sticky nav (~80px) — frosted dark bar, bottom hairline ─────────────┐

HOME
│ Hero           │ Cosmic full-bleed + optional right “stage” (omit on tiny mobile)
│ Principles     │ Large inset “glass shell” + 4 accent cards
│ Process ov.    │ Centered story + 6 phase chips + stats + CTA
│ CTA            │ Warm gradient closing card (orange-forward)

PROCESS (/process)
│ Process        │ Timeline: vertical gradient spine + alternating cards + artifact mocks

SOLUTIONS (/solutions)
│ Solutions      │ Surface band + segmented toggle + 3 tier columns + nested panels

ABOUT (/about)
│ About          │ Base band + grid atmosphere + 2×2 story grid (lead + photo / features + scripture) + stats + CTA
└────────────────────────────────────────────────────────────────────┘
```

**Spacing:** Standard sections use **~120px** vertical padding (**~72px** on small breakpoints). The **first** block under the nav on `/about`, `/process`, and `/solutions` uses **`mss-section--page-top`** — only **~32px** top padding (desktop) so the hero/header doesn’t float too far below the sticky bar.

### 3.3 App chrome (nav) — look & feel

- **Sticky** top, **translucent** dark fill (mostly `--mss-bg-base` with opacity).
- **Backdrop blur ~18px** + slight saturation — reads as **frosted glass** over content.
- Thin **bottom divider** (`--mss-border-subtle`).
- Brand glyph ~**56px** with a subtle **cyan glow** (`drop-shadow`).

### 3.4 Hero — enhanced visual features (richest block)

**Composition:** Inside the container, a **2-column grid**: copy column slightly wider (**~1.05fr**) than the **square stage** (**~1fr**, max width ~**620px**). Column gap ~**80px**. Below the fold of the headline stack: **lede → CTAs → 4-up stats** separated by a **subtle top border** on the stats band.

**Backdrop layers (back → front)** — treat as separate Figma layers for control:

1. **Ambient wash:** Corner **radial glows** (sky upper-right, orange lower-left) over a **vertical linear gradient** (~`#050913` → `#070b14` → `#050913`).
2. **Aurora blobs:** Three **large ellipses**, heavy **Gaussian blur (~140px class)**, **`Screen`-like** blend — slow drift (16–24s loops).
3. **Grid:** **64×64px** line grid, very low-contrast blue lines, **masked** with a **center radial fade** so edges dissolve; slow pan on desktop.
4. **Scanline:** Full-area faint cyan band that **slides vertically** (~7s) — **desktop-first**; removed on mobile perf tier.
5. **SVG overlay:** **Twinkling** star dots + **horizontal beam** rectangles with sky/orange gradients sweeping across — “signal / constellation” without competing with type.

**Headline treatment:**

- **Italic** emphasis on one word in **solid orange**.
- **Rotating phrase:** Text filled with a **horizontal gradient** (sky → violet → orange), **clipped to glyphs**, plus a slow **background-position shimmer** — reads as **living highlight**.

**Stage (right — brand metaphor “seed → tree”)** — square frame, layered energy:

| Layer | Effect |
|--------|--------|
| **Halos** | Three **radial** color washes (sky / orange / warm yellow), **heavy blur**, **pulse** scale + opacity |
| **Rays** | **Repeating conic-gradient** rings, masked to a donut; **two speeds**, one reversed |
| **Orbits** | Three circles: dashed / solid / dashed, **slow rotation** |
| **Sweep** | **Conic** wedge, blurred, rotating like **radar** |
| **Waves** | **Expanding rings** (stroke fades as scale grows), staggered delays |
| **Orbs** | Dot clusters on rotating carriers + twinkle |
| **Streaks** | Short “meteor” lines (desktop only) |
| **Glyph** | Inline **SVG tree/seed** with **stroke-draw**, **leaf unfurl**, **fruit bloom**, **radial bloom rays** — tied to a **~12s** master loop |

**Scroll cue:** Bottom-center **vertical line** with pulse animation + tiny **uppercase** label (“Scroll to explore”) — **hidden** on small phones and reduced-motion.

**Responsive / simplified variants for Figma:**

- **≤900px:** Fewer effects (no fine rays, no streaks, slower beams, simpler halos). Still show glyph loop intent.
- **≤480px:** **Remove entire backdrop + stage**; frame is **headline + body + CTAs + stats** only on the hero gradient — ship this as an explicit **mobile frame**.

### 3.5 Process principles — enhanced visual features

**Section atmosphere:** Expanded **64px grid** (can bleed past edges), **elliptical vignette** mask; **three** blurred glows (sky / orange / violet) with **slow float** (~18s).

**Shell panel (“glass card”):**

- Corner radius **~28px** (`--mss-radius-2xl`).
- Fill = **angled dark gradient** (multiple blue-gray stops, ~160deg).
- **1px** border + **deep outer shadow** + subtle **inner top rim** highlight.
- **Top hairline:** 1px **horizontal gradient** (transparent → sky → orange → transparent).

**Header:** Eyebrow + large title; accent word **“never”** uses **gradient text** (orange → peach → sky). **Decorative bars** on the side (3 segments with gradient fills) — vertical desktop, horizontal on narrower layouts.

**Principle cards:** Four tiles in a row (2 → 1 columns on small screens). Each has:

- **Left accent rail** (~3px) in tier color.
- **Icon capsule** (~48px, ~14px radius) with tinted fill + border + soft colored shadow.
- **Watermark index** (01–04) huge and faint.
- **Hover:** lift ~**4px**, stronger border + **colored outer glow** (motion-safe designs).

### 3.6 Process overview — enhanced visual features

**Atmosphere:** **56px** grid + dual **large blurred orbs** (sky / orange), **~160px** blur, anchored to corners — softer than hero.

**Layout:** **Center-aligned** stack: eyebrow → **display** heading → body → **6-up phase chips** → **4-up stats** → CTA.

**Phase chips:** Elevated surface (`--mss-bg-elevated`), **rounded ~12px**, hairline border; **orange** micro-label for step number; title semibold.

**Stats:** Same **pattern language** as hero stats (large value + uppercase muted descriptor), **dividing border** above.

### 3.7 CTA — enhanced visual features

**Card:** Full-width inside container, **~28px** corners, **diagonal linear gradient** dominated by **orange** fading into **deep navy**.

**Interior bloom:** Two **soft blurred circles** overlaid — near-white top-left, **sky-tinted** bottom-right (`blur` ~80px) — adds **readable glow** on the warm fill.

**Heading highlight:** Key phrase in a **high-contrast pill** — **dark fill** behind **light text** (inverted strip).

**Eyebrow:** Darker translucent pill + **light blur** so it survives on orange.

**Buttons:** Primary **orange**; secondary **ghost on warm bg** (light outline).

### 3.8 Process timeline — enhanced visual features

**Background:** Same family as overview (**56px grid**, corner glows, top-centered fade mask).

**Spine:** Vertical **gradient rail** (sky → violet → orange), **2px** wide, centered on desktop; **nodes** on the rail are **rings + glowing dots** colored per step accent.

**Cards:**

- **Elevated** dark card (`--mss-bg-card`), **28px** corners, **large** shadow.
- **Speech-bubble tail:** small **rotated square** / diamond clipped to point at the spine (alternates left/right on desktop).
- **Header:** Accent **pill** with icon + step number; duration as **compact neutral tag**.
- **Body split:** Left **deliverables** with **glowing bullet dots**; right **“artifact” window** with **traffic-light dots**, **monospace** lines, subtle **diagonal shine** sweep (optional prototype motion).

**Roles footer inside card:** **Inset** dark panel, two columns; labels **Your job** vs **My job** tinted **orange** vs **sky**.

**Page closing strip:** Separate rounded panel with **light orange + sky wash** over card background; italic emphasis in **orange**.

**Mobile:** Spine shifts **left**; cards **single column**; bubble tails **normalize** to left edge.

### 3.9 Solutions — enhanced visual features

**Band:** Page uses **`--mss-bg-surface`** so it feels **slightly lifted** vs home middle sections; pair with **two corner glows** (sky / orange), **~160px** blur.

**Segmented control (Build / Care):**

- Outer **pill track** with border + shadow.
- **Sliding thumb:** half-width pill with **orange gradient** when “Build” selected; moves right and switches to **sky gradient** for “Care”.
- Active label reads **high contrast**; inactive **muted**.

**Tier columns (×3):**

- Equal cards with icon tile, name, tagline, **large price** row, meta rows, **chip row** (build only), divider, checklist, full-width CTA.
- **Featured** column: **warm tinted overlay** on card + **orange-border glow**; floating **`p-tag`** badge above top edge (**negative offset ~14px**).
- **Care “Recommended”:** Same idea with **sky-tinted** featured treatment + sky badge.

**Accent propagation:** `data-accent` on card drives **icon capsule**, **chip check color**, and **check-circle** tint (**sky / orange / violet**).

**Build-only panels:**

- **“Every build includes”** — nested **large** rounded panel with darker stacked gradient; inner **4-column** “pillar” tiles, each with **rotating accent color** on icon (sky, orange, violet, green).
- **Add-ons:** smaller cards, **orange-forward** icon wells.

**Care-only row:** Three **reassurance** cards with **sky** icon tiles and supportive copy.

**Toggle transition:** Content grid **fades + rises slightly** when swapping modes — match with Figma **smart animate** between variants.

### 3.10 Motion annotations for Figma specs

- About (`§3.12`): **static** atmosphere layers (no infinite drift/pan); **micro-motion** on **feature** + **scripture** hovers only, gated by **`prefers-reduced-motion`**.
- Hero + principles backgrounds: **slow ambient** loops (often **10–40s**).
- Hero glyph: **~12s** narrative loop.
- Solutions grid: **~0.45s** ease on swap.
- Process artifact: **~5s** shine loop.
- Document a **“Reduced motion”** variant: static glows, optional **no** sliding toggle animation — parity with `prefers-reduced-motion` in CSS.

### 3.11 New-page checklist (Figma)

1. Choose **band**: `base` vs `surface` vs **custom gradient** (hero / CTA style).
2. Add **atmosphere**: faint **grid** + **two** blurred brand-colored ellipses, edge-softened.
3. Lock content to **1200 max / 24 gutter**.
4. Cards: `--mss-bg-card`, hairline border, **28px** radius, soft shadow.
5. Assign **accent role** per component (sky / orange / violet / green).
6. CTAs: **orange primary** + **ghost** secondary.
7. Section intro stack: **eyebrow → display → body**.

### 3.12 About (`/about`) — enhanced visual features

**Band:** Single primary section uses **`mss-section--base`** + **`mss-section--page-top`** (same first-section-under-nav rhythm as Process/Solutions). **`id="about"`**, **`aria-labelledby="about-heading"`** on the `<section>`.

**Atmosphere (`.about__bg`, full bleed, `aria-hidden="true"`):**

1. **Grid:** **56×56px** line grid, low-contrast blue lines (`rgba(148, 184, 230, 0.05)`), **radial mask** (ellipse center-top, strong center → transparent edges) so the fold stays readable — same family as process overview / timeline (**§3.6**, **§3.8**).
2. **Corner glows:** Two large circles **`filter: blur(160px)`**, **`opacity` ~0.22**, anchored **upper-right** (sky radial) and **lower-left** (orange radial) via **`var(--mss-sky)`** / **`var(--mss-orange)`**.
3. **Violet orb:** Additional ellipse **`blur(140px)`**, **`mix-blend-mode: screen`**, soft violet radial — echoes principles “premium” accent without dominating.
4. **Beams:** Two thin **horizontal** gradient bars (sky-forward and orange-forward, **`color-mix`** from brand tokens). **Removed at `max-width: 640px`** to reduce noise on small phones.

**Layout — desktop / tablet (default grid):** `.about__inner` is a **2×2 CSS Grid** (`minmax(0, 1fr)` × 2), **`gap: 48px 80px`**, **`align-items: start`**:

| Area name (`grid-template-areas`) | Content |
|-----------------------------------|---------|
| **`title`** | **Lead stack** (`.about__lead`): headline column |
| **`photo`** | Profile **`figure.about__photo`** (`justify-self: center`) |
| **`copy`** | Feature list **`.about__copy-block`** |
| **`scripture`** | **`aside.about__scripture`** (`justify-self: center`, `width: min(100%, 560px)`) |

**Lead stack (`.about__lead`):** On wide viewports, **`display: flex`**, column, **`gap: 20px`**, **`max-width: 560px`**, **`grid-area: title`**. Wraps:

- **`<header class="about__title-block">`:** **`mss-eyebrow mss-eyebrow--orange`**, single **`<h1 id="about-heading" class="mss-display-lg">`** (two lines: first neutral **`.about__title-line`**, second **italic** **`.about__title-accent`** in **`var(--mss-orange-strong)`**), then **`.about__rule`** — a **6px-tall** horizontal bar with **sky → orange** gradient (**§3.4**-family emphasis without hero animation).
- **Intro:** **`<p class="about__intro mss-body-lg mss-text-secondary">`** immediately after the header inside the same lead wrapper — keeps **eyebrow → display → rule → body** in one column for tablet+.

**Responsive story — narrow (`max-width: 720px`):** **`.about__lead { display: contents }`** so children participate in the parent grid. **Single column** areas:

```text
title → photo → intro → copy → scripture
```

- **`title`** = **`.about__title-block`** only (eyebrow + `h1` + rule).
- **`photo`** = profile figure **before** intro paragraph — mobile-first portrait placement (see [`plans/about.plan.md`](plans/about.plan.md) layout notes).
- **`intro`** = **`.about__intro`**.
- Then features and scripture as before.

**Photo:** **`.about__photo-frame`** square **`min(384px, 88vw)`**, **`border-radius: var(--mss-radius-2xl)`**, **2px** border **`color-mix(in srgb, var(--mss-sky) 55%, transparent)`**, dual outer shadows (warm + cyan). Image **`object-fit: cover`**; paths/alts from **`AboutComponent`** (`profileSrc`, `profileAlt`).

**Feature tiles (`<ul class="about__features">`):** Each **`<li class="about__feat" [attr.data-accent]="feature.accent">`** mirrors **Principles** card vocabulary (**§3.5**, **§3.11**):

- **`--mss-radius-2xl`** corners; angled tint **`rgb(var(--feat-accent) / …)`** + **`color-mix`** borders tying into **`--mss-border-subtle`** / **`--mss-border-default`** on hover.
- **`::before` left rail ~3px**, gradient from **`--feat-accent-solid`** (`sky` | **`--mss-orange-strong`** | violet `#a78bfa`).
- **Icon capsule** ~**48×48px**, ~**14px** radius, **`PrimeIcons`** via **`feature.icon`** (e.g. `pi pi-globe`), tinted fill + border + soft glow.
- **Hover:** **`translateY(-4px)`**, stronger border + accent glow only when **`prefers-reduced-motion: no-preference`**.

**Scripture aside (`aside.about__scripture`, `aria-label="Scripture references"`):**

- **Surface:** **`--mss-bg-card`**, **`--mss-border-subtle`** (stronger on hover **`--mss-border-default`**), **`--mss-radius-2xl`**, inset highlight **`color-mix`** + depth shadows using **`--mss-bg-base`** / **`--mss-glow-sky`** (hover adds **`--mss-glow-orange`**).
- **Spine:** **~3px** vertical gradient (**sky → violet → orange**), faded ends — timeline-rail language (**§3.8**) at quote weight.
- **Hairline:** **1px** top gradient (transparent → sky → orange → transparent) — principles shell **§3.5** vocabulary.
- **Content:** Two **`<blockquote class="about__scripture-quote">`** with **`mss-body-lg mss-text-primary`**; **`<footer><cite class="mss-body-sm mss-text-muted">`** per passage; **`.about__scripture-em`** for italic **`var(--mss-orange-strong)`** phrases; **`font-style: normal`** on blockquote to avoid UA italic bleed.

**Stats row (`<dl class="about__stats">`):** Below **`about__inner`**, still inside **`mss-container`** — **top border** **`--mss-border-subtle`**, **3-column** grid ( **`max-width: 900px`** → **2 columns**, last stat centered; **`max-width: 640px`** → **1 column**). Pattern aligns with **hero / process-overview** stats: large **`dt`** value, uppercase muted **`dd`** labels — data from **`stats`** readonly array on **`AboutComponent`** (`@for` with **`track`** by **`id`**).

**Motion:** Decorative atmosphere is **static** (no infinite grid pan on About). **Hover** only on feature rows + scripture card; respect **`prefers-reduced-motion`** for transforms/shadow bumps.

**Page closure:** **`AboutPageComponent`** appends **`<app-cta />`** after **`app-about`**, so **`id="contact"`** exists on `/about` as well as Home — nav **“Free consult”** remains **`/#contact`** for routes without a local anchor (**§4**). Documented as closing-funnel parity in [`plans/about.plan.md`](plans/about.plan.md) Phase 5.

---

## 4. App shell, routing chrome & shared folder (`src/app/shared/`)

The **`shared/`** directory holds **marketing chrome** (nav, footer), a reusable **loading spinner**, the **`AuthService`** singleton, and **functional route guards** used by `app.routes.ts`. Everything is **standalone** with **`ChangeDetectionStrategy.OnPush`** where it’s a component. Imports elsewhere use the **`@app/shared/...`** path alias (`tsconfig`).

---

### 4.1 Root shell (`App`) — how chrome and loaders attach

**Files:** `src/app/app.ts`, `app.html`, `app.scss`

**Template (`app.html`):**

1. **`app-nav`** — rendered only when **`!chromeHidden()`**.
2. **`<main id="main">`** wraps **`router-outlet`** and optionally a full-bleed overlay loader.
3. **`app-footer`** — same **`chromeHidden`** gate as nav.

**`chromeHidden`:** Derived from **route `data.hideChrome`**. After each navigation completes, `App` walks **`router.routerState.snapshot.root`** through **`firstChild`** and ORs **`route.data['hideChrome'] === true`** so **any ancestor or leaf** with `hideChrome` hides nav/footer. Used for **`/login`** and **`/dashboard`** (`app.routes.ts`), giving the client portal a chrome-free layout.

**`aria-busy`:** **`main`** sets **`[attr.aria-busy]="routeLoading() ? 'true' : 'false'"`** while the route loader is visible.

**Route loading overlay (`App` constructor):**

- Subscribes to **`NavigationStart`**, **`NavigationEnd`**, **`NavigationCancel`**, **`NavigationError`** (via **`takeUntilDestroyed`**).
- Tracks **`latestNavId`** from **`NavigationStart`**; only completion events whose **`e.id`** matches clear the loader (avoids stale clears).
- **`initialNavigationSettled`:** first completion marks it **`true`**; **`NavigationStart`** triggers **`showRouteLoading()`` only **after** that, so the **initial app bootstrap** does not flash the overlay on first paint.
- **`ROUTE_LOADING_MIN_VISIBLE_MS = 300`:** when navigation finishes, the spinner stays visible until at least **300ms** has elapsed since show — avoids subliminal flicker on fast redirects.
- Overlay markup: **`div.app-route-loader`** (absolute **`inset: 0`**, semi-transparent **`--mss-bg-base`** mix, **`z-index: 1`**) containing **`<app-loading-spinner size="md" color="sky" label="Loading" />`**.

**`app.scss` (shell layout):**

- **`:host`** — column flex, **`min-height: 100dvh`**, **`--mss-bg-base`**.
- **`:host:has(app-dashboard-page)`** — pins **`height/max-height: 100dvh`** and **`overflow: hidden`** so the dashboard portal fills the viewport (see comments: nested flex needs a real height).
- **`main:has(app-dashboard-page)`** — outlet + **`app-dashboard-page`** absolutely positioned **`inset: 0`** so lazy-loaded dashboard fills **`main`** correctly.

---

### 4.2 Nav (`shared/nav/`)

**Selector:** **`app-nav`**

**Purpose:** Sticky global header — brand, primary links, “Free consult”, conditional **Client login**, mobile drawer.

**TS (`nav.ts`):**

- **`AuthService`** injected as **`auth`**; template uses **`auth.isLoggedIn()`** (**`computed`** signal from service). When logged in, **Client login** buttons are **not** rendered (`@if (!auth.isLoggedIn())`).
- **`mobileOpen`** signal; **`toggleMobile()`** / **`closeMobile()`** — selecting a link closes the drawer.
- **`links`:** readonly **`NavLink[]`** — `{ label, href }` for Home, About, Process, Solutions.

**Template notes:**

- **Marketing routes** use plain **`<a [href]="link.href">`** (not **`RouterLink`**). That performs normal browser navigation to paths like **`/about`** (same-origin document load). **`routerLink`** is reserved for **`/login`** (SPA navigation without full reload).
- **Brand** uses **`<a href="/">`** + glyph **`/mustard-seed-glyph-logo.svg`**, stacked wordmark (matches footer typography rhythm).
- Inner **`<nav class="nav__links" aria-label="Primary">`** wraps the four marketing links.
- **Free consult:** **`href="/#contact"`** — hash targets Home CTA **`id="contact"`**; on **`/about`** a local CTA also exposes **`#contact`**, but nav intentionally keeps **`/#contact`** so Process/Solutions still reach Home’s contact block (see **`plans/about.plan.md`**).

**SCSS highlights:**

- **`:host`** — **`position: sticky`**, **`top: 0`**, **`z-index: 50`**.
- **`.nav`** — **`color-mix(in oklab, var(--mss-bg-base) 82%, transparent)`**, **`backdrop-filter: saturate(140%) blur(18px)`** (+ webkit prefix), **`border-bottom: var(--mss-border-subtle)`** — aligns with **§3.3** research (frosted bar).
- **`.nav__mark-logo`** — **`drop-shadow`** using **`--mss-sky`** mix (cyan glow).
- **Breakpoint `max-width: 960px`:** hides **`.nav__links`** and **`.nav__cta`**, shows **`.nav__menu-btn`** (three-bar icon); **`.nav__mobile.is-open`** becomes **`display: flex`** panel under the bar (**`#mobile-links`**).
- **Mobile `aria-*`:** menu button **`aria-expanded`**, **`aria-controls="mobile-links"`**.

**Imports:** **`RouterLink`** only (for login); **`ButtonModule`** not imported — login uses global PrimeNG **`p-button`** / **`mss-btn-primary`** classes from **`styles.scss`**.

---

### 4.3 Footer (`shared/footer/`)

**Selector:** **`app-footer`**

**Purpose:** Four-column marketing footer + divider + copyright/legal row.

**TS (`footer.ts`):**

- **`currentYear`** from **`new Date().getFullYear()`** for **`©`** line.
- **`columns`:** **`FooterColumn[]`** — **`title`** + **`links[]`** with **`label`** / **`href`**. Columns: **Services** (all **`/solutions`** anchors), **Studio** (About/Process/Service area/Free consult), **Contact** (**`mailto:`**, Book a call **`/#contact`**, location blurb → **`/about`**).

**Template:**

- Brand block mirrors nav (glyph + wordmark **`href="/"`**), **`mss-body-sm`** tagline, scripture excerpt with **`.footer__verse`** orange left border.
- **`@for (column of columns; track column.title)`** — semantic **`h3`** column titles, **`ul`** lists.
- **`p-divider`** with **`styleClass="footer__divider"`** — PrimeNG **`DividerModule`** imported on component.

**SCSS:**

- **Surface:** **`--mss-bg-surface`**, top border **`--mss-border-subtle`**, **`padding-block: 80px 40px`**.
- **Grid:** **`1.4fr 1fr 1fr 1fr`** desktop; **`960px`** → 2 columns with brand spanning full width; **`560px`** → single column.
- **Links:** **`--mss-text-secondary`**, hover/focus → **`--mss-orange`** (footer-specific accent).
- **`::ng-deep`** overrides for **`p-divider`** horizontal rule color/spacing.

**Placeholders:** **Privacy** / **Terms** use **`href="#"`** — not wired to real pages yet.

---

### 4.4 Loading spinner (`shared/loading-spinner/`)

**Selector:** **`app-loading-spinner`**

**Purpose:** Branded circular spinner + optional text; used by **`App`** route overlay and reusable elsewhere.

**API (signal **`input()`**s):**

- **`size`:** **`'sm' | 'md' | 'lg'`** (default **`'md'`**).
- **`color`:** **`'sky' | 'orange'`** (default **`'sky'`**).
- **`label`:** string (default **`'Loading'`**); when falsy, host omits **`aria-label`** and defaults screen reader text is **`'Loading'`** via host binding.

**Host bindings (`loading-spinner.ts`):**

- **`role="status"`**, **`aria-live="polite"`**.
- Size/color classes applied on **`:host`** via **`host: { … }`** map.

**Markup:** Track ring (**`--mss-border-subtle`**) + rotating arc (**`--mss-sky`** or **`--mss-orange-strong`**), **`drop-shadow`** using **`--mss-glow-sky`** / **`--mss-glow-orange`**. **`@keyframes`** **`loading-spinner-rotate`** **0.75s** linear infinite — **not** currently gated by **`prefers-reduced-motion`** (potential enhancement if policy requires).

---

### 4.5 AuthService (`shared/services/auth.service.ts`)

**`@Injectable({ providedIn: 'root' })`** — single app-wide instance.

**State:**

- **`_user`** writable **`signal<AuthUser | null>`**; exposed as **`readonly user`** and **`isLoggedIn = computed(() => this._user() !== null)`**.
- **`AuthUser`** shape: **`id`**, **`email`**, **`firstName`**, **`lastName`**, **`companyName`**, **`role`**.

**Session bootstrap:**

- **`sessionReady: Promise<void>`** — resolves after startup token validation **finishes** or immediately if no token. **`constructor`:** if **`localStorage`** has **`mss_token`**, **`loadCurrentUser()`** runs ( **`GET /api/auth/me`** with **`Authorization: Bearer …`** ); **`finally`** resolves **`sessionReady`**. If **`/me`** fails, token is **removed** and user cleared.

**API methods:**

- **`signup(body)`** — **`POST /api/auth/signup`**, stores token + sets user.
- **`login(email, password)`** — **`POST /api/auth/login`**, same.
- **`logout()`** — clears **`localStorage`** key, **`_user.set(null)`**, **`router.navigate(['/'])`**.

**Storage:** constant **`TOKEN_KEY = 'mss_token'`**.

**Consumers:** **`NavComponent`**, **`LoginPageComponent`**, **`DashboardPageComponent`** (**`signOut()`**), both **guards**.

---

### 4.6 Route guards (`shared/guards/`)

Both are **`CanActivateFn`** (functional guards), **`async`**, and **`await auth.sessionReady`** before branching — avoids flashing login/dashboard during token hydration.

| Guard | File | Behavior |
|-------|------|----------|
| **`redirectToDashboardIfLoggedInGuard`** | `redirect-to-dashboard-if-logged-in.guard.ts` | If **`isLoggedIn()`** → **`router.createUrlTree(['/dashboard'])`**. Applied on **`''`** (Home) and **`'login'`**. Logged-in users never see marketing home or login screen via direct navigation. |
| **`requireAuthGuard`** | `require-auth.guard.ts` | If **not** logged in → **`createUrlTree(['/login'])`**. Applied on **`'dashboard'`** with **`canActivateChild`** so all nested portal routes stay private. |

---

### 4.7 Design-system alignment (shared UI)

- Nav/footer reuse **`mss-container`**, **`--mss-*`** tokens, **`mss-body-sm`**, **`mss-text-secondary`**, **`mss-text-muted`**, **`mss-btn-primary`** — consistent with **§2** / **§3.3**.
- Nav sticky bar matches documented **blur ~18px**, **hairline border**, **glyph glow**.
- Footer verse block uses **`--mss-orange-strong`** accent rail — subtle brand tie-in without hero-level motion.

---

### 4.8 In-page anchors (contact)

For **in-page anchors**, the **CTA** section sets **`id="contact"`** — that’s what **`/#contact`** targets from nav/footer when forcing Home’s contact band.

---

### 4.9 Login page (`/login`) — client portal gate

**Purpose:** Dedicated **chrome-free** auth surface for clients (`data.hideChrome` — see **§4.1**). Visually aligned with marketing **§3** (dark bands, sky/orange accents, glass-card vocabulary, frosted header) while staying **task-focused**: no hero-grade animation, no global **`app-nav`** / **`app-footer`**. Structured alignment and refactor checklist: [`plans/login.plan.md`](plans/login.plan.md).

**Files:** `src/app/login/login-page.ts`, `login-page.html`, `login-page.scss`

**Component:** **`app-login-page`**, **`standalone: true`**, **`ChangeDetectionStrategy.OnPush`**. **Imports:** **`ReactiveFormsModule`**, **`RouterLink`**, **`ButtonModule`** (PrimeNG **`p-button`**).

---

#### 4.9.1 Routing & guards

| Concern | Detail |
|--------|--------|
| Path | **`login`** |
| Load | **`loadComponent`** → **`LoginPageComponent`** |
| Chrome | **`data: { hideChrome: true }`** — **`App`** hides **`app-nav`** and **`app-footer`** (**§4.1**) |
| Guard | **`redirectToDashboardIfLoggedInGuard`** — same as Home **`''`**; authenticated users are redirected to **`/dashboard`** and do not see marketing Home or login |
| Title | **`Client sign in — Mustard Seed Solutions`** |

**Post-auth navigation:** On successful **`login`** or **`signup`**, **`router.navigate(['/dashboard'])`** (**§4.6** **`requireAuthGuard`** protects portal).

---

#### 4.9.2 Page landmarks & DOM skeleton

**Root:** **`<section class="login-page" aria-labelledby="portal-heading">`** — section accessible name comes from the portal story **`h1`**, not the form card.

**Header:** **`<header class="login-page__nav" aria-label="Login navigation">`** — **not** the global **`app-nav`**; local slim bar only.

**Split shell:** **`<div class="login-page__shell">`** — CSS grid:

- **Desktop:** **`grid-template-columns: minmax(360px, 540px) minmax(0, 1fr)`** — fixed-ish **story column** + fluid **form column**.
- **`min-height: calc(100dvh - var(--mss-nav-height))`** — fills viewport below the login header.

**Left column:** **`<aside class="login-page__brand-panel" aria-label="Client portal overview">`**

- Decorative stack: **`.login-page__brand-atmosphere`** (**`aria-hidden="true"`**) — grid, glows, beams (**§4.9.4**).
- Content stack: **`.login-page__brand-content`** — eyebrow, **`h1`**, lede, benefits **`ul`**.

**Right column:** **`<div class="login-page__form-panel">`**

- **`.login-page__form-atmosphere`** (**`aria-hidden="true"`**) — faint grid + blurred orb (**§4.9.6**).
- **`.login-page__form-inner`** — centers card + error; **`@if (errorMessage())`** alert above **`login-card`**.

**Heading semantics:**

- **One **`h1`:** **`id="portal-heading"`**, classes **`mss-display-lg login-page__headline`**. Line order (with **`<br />`**): **Your site.** → **Your account.** → **Your** + accent span **results** + **.** (word **results** in **`<span class="login-page__headline-accent">`** — **italic**, **`var(--mss-orange-strong)`**, marketing headline accent pattern **§3.4** / **§3.5** without gradient animation).
- **Form card **`h2`:** **`id="login-heading"`** — **Sign in** or **Create your account** depending on mode. Same **`id`** on both branches (only one mounted); used as local card title, **not** **`aria-labelledby`** on **`<section>`**.

---

#### 4.9.3 Login header — brand parity with global nav (**§4.2**, **§3.3**)

**Brand link:** **`routerLink="/"`**, **`aria-label="Mustard Seed Solutions — Home"`** (SPA return to marketing shell).

**Glyph:** **`/mustard-seed-glyph-logo.svg`** inside **`.login-page__mark`** (**`aria-hidden="true"`**), **`img.login-page__mark-logo`**, **`56×56`** desktop; **`48×48`** at **`max-width: 560px`**. **`filter: drop-shadow(0 0 10px color-mix(in oklab, var(--mss-sky) 34%, transparent))`** — matches **`.nav__mark-logo`** intent.

**Wordmark:** Two-line stack (**`.login-page__wordmark-top`** / **`-bottom`**) — **Mustard Seed** (18px / 16px mobile, **700**, primary text) + **SOLUTIONS** line (11px / 10px mobile, **600**, **`uppercase`**, wide **`letter-spacing`**, secondary color).

**Bar chrome:** **`color-mix(in oklab, var(--mss-bg-base) 82%, transparent)`**, **`backdrop-filter: saturate(140%) blur(18px)`** (+ webkit), **`border-bottom: 1px solid var(--mss-border-subtle)`**, **`height: var(--mss-nav-height)`**, horizontal padding **`clamp(24px, 8vw, 120px)`** (**`24px`** at **`≤900px`**).

**Back link:** **`.login-page__back`**, **`routerLink="/"`**, muted → primary on hover/focus; **`focus-visible`** ring **`2px`** **`--mss-sky`**.

---

#### 4.9.4 Brand panel atmosphere (static decor)

All layers sit under **`.login-page__brand-atmosphere`**, **`pointer-events: none`**, **`z-index: 0`**; **`.login-page__brand-content`** is **`z-index: 1`**. **No infinite motion** — **`prefers-reduced-motion`** does not need to gate layers (unlike Hero **§3.4**).

| Layer | Class | Behavior |
|-------|--------|----------|
| Grid | **`.login-page__brand-grid`** | **56×56px** lines, **`rgba(148, 184, 230, 0.05)`**; **`inset: -20%`**; **radial mask** ellipse **85% × 70%** at **50% 18%** (center-top readable fold — same family as About **§3.12**). |
| Sky glow | **`.login-page__brand-glow--sky`** | **`filter: blur(160px)`**, **`opacity: 0.22`**, **`var(--mss-sky)`**, anchored upper-right. |
| Orange glow | **`.login-page__brand-glow--orange`** | Same blur/opacity family, **`var(--mss-orange)`**, anchored lower-left. |
| Violet orb | **`.login-page__brand-glow--violet`** | **`#a78bfa`**, **`opacity: 0.14`**, **`mix-blend-mode: screen`** — principles / About tertiary accent **§3.1**. |
| Sky beam | **`.login-page__brand-beam--sky`** | **1px** horizontal gradient via **`color-mix(in srgb, var(--mss-sky) …)`**, **`top: 28%`**. |
| Orange beam | **`.login-page__brand-beam--orange`** | Same, orange mix, **`top: 62%`**. |

**Mobile:** **`max-width: 640px`** — **`.login-page__brand-beam`** **`display: none`** (noise reduction per [`plans/login.plan.md`](plans/login.plan.md)).

**Panel surface:** **`background: var(--mss-bg-surface)`** on **`.login-page__brand-panel`**, **`isolation: isolate`** for blend containment.

---

#### 4.9.5 Typography, eyebrow, benefits (“chips”)

- **Eyebrow:** **`mss-eyebrow mss-eyebrow--orange`** — **Client portal** (**§2.5** orange dot variant).
- **Lede:** **`mss-body-lg mss-text-secondary`** on **`.login-page__lede`** (**max-width ~420px**).
- **Benefits:** **`readonly PortalBenefit[]`** in **`login-page.ts`** — **`id` + `label`** for **`@for (benefit of benefits; track benefit.id)`**. Labels: *Real-time project visibility*, *Direct access to your team*, *Site care, visitor numbers, and updates*.

**Benefit row styling (**§3.6 **phase-chip family, lighter weight):**

- **`<li class="login-page__benefit">`** — **`min-height: 48px`**, **`padding: 12px 16px`**, **`border-radius: var(--mss-radius-md)`**, **`border: 1px solid var(--mss-border-subtle)`**, **`background: var(--mss-bg-elevated)`**.
- **Micro-dot:** **`.login-page__benefit-accent`** (**`8px`** circle, **`aria-hidden="true"`**) — **odd** rows **sky** + glow; **even** rows **`--mss-orange-strong`** + glow.
- Copy: **`.login-page__benefit-label`** with **`mss-body-sm mss-text-secondary`**.

---

#### 4.9.6 Form panel atmosphere

**Surface:** **`--mss-bg-base`**, **`overflow: hidden`**, **`padding: 56px 24px`**, grid **centered** content.

**`.login-page__form-atmosphere`:** **64×64** faint grid (**`0.025`** line opacity), radial mask **80% × 65%** at **70% 45%**. **`::after`** pseudo — large bottom **`border-radius: 50%`** ellipse, **`var(--mss-sky-deep)`**, **`blur(120px)`**, low opacity — ties visually to left panel without competing with **`login-card`**.

**`max-width: 640px`:** grid layer **`opacity: 0.45`**, **`::after`** **`opacity: 0.06`** — keeps form readable.

---

#### 4.9.7 Login / signup card (“glass” elevation)

**Container:** **`<form class="login-card">`** — **`width: min(100%, 480px)`**, **`gap: 20px`**, **`padding: 40px 48px 36px`** (**`32px 24px`** at **`≤560px`**).

| Property | Token / value |
|----------|----------------|
| Radius | **`var(--mss-radius-2xl)`** (**28px** — principles / timeline family **§3.5**, **§3.11**) |
| Border | **`1px solid var(--mss-border-subtle)`** |
| Fill | **`var(--mss-bg-card)`** |
| Outer shadow | **`0 28px 80px`** **`color-mix(in oklab, var(--mss-bg-base) 72%, transparent)`** |
| Inner rim | **`box-shadow`** inset **`1px`** **`color-mix(in oklab, #fff 4%, transparent)`** |
| Top hairline | **`::before`** — horizontal gradient **transparent → sky mix → orange mix → transparent** (**§3.5** shell vocabulary); **`left/right: 16px`**, **`top: 0`**, **`height: 1px`** |

**Card title / intro:** **`login-card__title`** (24px semibold stack); **`login-card__intro`** + **`mss-body-sm mss-text-secondary`**.

**Divider:** **`.login-card__divider`** — hairline / **or** / hairline, **`aria-hidden="true"`**.

**Tertiary text buttons:** **Forgot password?**, **Create one →**, **Sign in →** — **`.login-card__text-button`**, sky color, **`focus-visible`** ring.

---

#### 4.9.8 Forms, validation, PrimeNG submit

**Pattern:** **Typed reactive forms** (**`NonNullableFormBuilder`**), **`novalidate`** on **`<form>`**, **`(ngSubmit)`** handlers.

**Login group:** **`email`** (**`required`**, **`Validators.email`**), **`password`** (**`required`**).

**Signup group:** **`firstName`**, **`lastName`**, **`email`**, **`password`** (**`minLength(8)`**), optional **`companyName`**, **`phone`**.

**Invalid submit:** **`markAllAsTouched()`** then return — no API call.

**Inputs:** Native **`<input>`** under **`<label class="login-card__field">`** — **`min-height: 52px`**, **`font-size: 16px`** (zoom-safe), **`border-radius: var(--mss-radius-md)`**, **`background: var(--mss-bg-elevated)`**, **`border: var(--mss-border-default)`**, focus **sky** border + **3px** sky glow mix.

**Signup layout:** **`.login-card__row`** — two columns **`≤560px`** → single column.

**Submit:** **`<p-button type="submit" … />`** — **`label`** **Sign in** / **Create account**, **`size="large"`**, **`styleClass="mss-btn-primary login-card__p-button"`**, **`[rounded]="true"`**, **`[loading]`** / **`[disabled]`** tied to **`loading()`** signal. Full-width via **`:host ::ng-deep .login-card__p-button .p-button`** (**`min-height: 52px`**). Implements **`login.plan.md`** Phase 5 PrimeNG parity (**§2.6**).

**Mode toggle:** **`isSignup`** signal; **`toggleMode()`** flips boolean and clears **`errorMessage`**.

---

#### 4.9.9 Errors, HTTP shapes, danger tokens

**Banner:** **`<p class="login-card__error" role="alert">`** — **`width: min(100%, 480px)`**, above the card inside **`.login-page__form-inner`**.

**CSS variables** (**`:root`** in **`styles.scss`** — **§2** extension):

- **`--mss-danger-bg`**: **`color-mix(in oklab, #ef4444 18%, var(--mss-bg-card))`**
- **`--mss-danger-text`**: **`#fca5a5`**
- **`--mss-danger-border`**: **`color-mix(in oklab, #ef4444 45%, var(--mss-border-default))`**

**TS extraction:** **`catch`** narrows with **`instanceof HttpErrorResponse`** / **`Error`**; **`messageFromHttpError`** inspects **`error.error`** JSON:

- **Wrapped:** **`{ error: { error: string } }`** (**`isAuthWrappedNestedErrorBody`**)
- **Flat:** **`{ error: string }`** (**`isAuthErrorMessageBody`**)

Uses **`Reflect.get`** for **`in`**-guard-safe reads (**no `any` / `unknown`** in component error parsing). Fallback: **`Something went wrong. Please try again.`**

---

#### 4.9.10 Responsive summary

| Breakpoint | Effects |
|-------------|---------|
| **`max-width: 900px`** | Shell **single column**; nav **`padding-inline: 24px`**; brand content **`min-height: 420px`**, **`padding: 56px 24px`**. |
| **`max-width: 640px`** | Brand beams hidden; form atmosphere toned down (**§4.9.6**). |
| **`max-width: 560px`** | Signup name row stacks; smaller glyph/wordmark/back link; card tighter padding. |

---

#### 4.9.11 Motion & accessibility notes

- **Decorative layers** — static (no scroll-linked or looping CSS animations on login page).
- **`prefers-reduced-motion: reduce`** — disables **transition** on back link, text buttons, and inputs (**§4.9.8**).
- **Focus:** Brand, back link, text buttons, inputs — visible **`focus-visible`** rings (**sky**).
- **Forgot password?** — **`type="button"`** (non-submit); **not** wired to a recovery flow in template-only review — product follow-up.

---

#### 4.9.12 Explicit non-goals (vs marketing hero)

Documented in [`plans/login.plan.md`](plans/login.plan.md) **Out of scope:** no Hero **aurora / scanline / constellation SVG / seed-tree stage** (**§3.4**); no re-enabling global **`app-nav`** / **`app-footer`** on **`/login`** unless product changes chrome policy. Login should stay **fast and legible** — atmosphere is **static** and **lower amplitude** than Home.

---

#### 4.9.13 Related references

- **§2** — tokens & **`mss-*`** utilities used on login.
- **§3.1** — visual DNA (depth, accent roles, radii).
- **§3.11** — new-page checklist (band, atmosphere, card radius, CTAs).
- **§4.1** — **`hideChrome`** behavior.
- **§4.2** — global nav (login header intentionally mirrors look, not component reuse).
- **§4.5** — **`AuthService`** **`login`** / **`signup`**.
- **§4.6** — guards affecting login and dashboard.

---

## 5. Home page (`Home`)

**Files:** `src/app/home/home.ts`, `home.html`, `home.scss`

**Template order:**

1. `<app-hero />`
2. `<app-process-principles />`
3. `<app-process-overview />`
4. `<app-cta />`

**`home.scss`:** only `:host { display: block; }` — all visual weight lives in child sections.

**Guard:** route `''` uses `redirectToDashboardIfLoggedInGuard` (logged-in users skip marketing home).

---

## 6. Section deep dives (home assembly)

Sections below are composed by **`Home`** (`§5`). **`AboutComponent`** (`home/sections/about/`) uses the same folder convention but is **not** on the home route — see **`§9`**.

### 6.1 Hero (`home/sections/hero/`)

**Role:** Full-viewport-style hero with animated backdrop, rotating headline phrase, dual-column grid (copy + “stage” illustration), stats row, CTAs.

**Key HTML patterns:**

- Root: `<section id="top" class="hero mss-section--base" aria-labelledby="hero-heading">`
- Content wrapper: `.mss-container.hero__inner`
- Decorative layers under `.hero__backdrop` (aurora blobs, grid, scanline, SVG stars/beams) — all `aria-hidden="true"` except live region on phrase
- Rotating phrase: `aria-live="polite"` on `.hero__phrase` bound to `activePhraseText()` signal
- Stats use `<dl>` / `<dt>` / `<dd>` with `@for (stat of stats; track stat.label)`

**Key TS patterns:**

- `rotatingPhrases` + `activePhraseIndex` signal + `setInterval` in `ngOnInit`, cleared in `ngOnDestroy`
- `stats` readonly array on the class

**CSS highlights:**

- Section min-height `clamp(720px, 92vh, 980px)`, layered background gradients on `.hero`
- Complex responsive grid: desktop two columns; breakpoints at `1100px`, `901–1100px`, `900px`, `640px`, `480px`
- **Performance tiers:** `@media (max-width: 900px)` reduces animations (no grid pan, no scanline, simpler halos, etc.); `@media (max-width: 480px)` hides backdrop + stage entirely (copy-only hero)
- **`prefers-reduced-motion: reduce`:** disables motion across hero decorations and phrase shimmer

**Deps:** `ButtonModule`, `RouterLink` (secondary CTA to `/solutions`).

**Note:** Primary “Book a free intro call” `p-button` has **no** `(click)` / `routerLink` in template — wire-up would be needed for real booking.

---

### 6.2 Process principles (`home/sections/process-principles/`)

**Role:** Four principle cards inside a **glass/shell** panel (gradient panel + inner grid).

**Structure:**

- `<section class="process-principles mss-section mss-section--base" aria-label="...">`
- Background atmosphere: `.process-principles__bg` (grid + floating glows)
- `.mss-container` → `.process-principles__shell` (rounded panel, border, inner highlight line via `::before`)
- Header grid + decorative `.process-principles__header-meta` segments (purely visual)
- Card grid: `<ul class="process-principles__grid">` with `@for` over `principles`; each `<li class="principle" [class.principle--N]>`

**Accent system:** `.principle--1` … `--4` set CSS vars `--pr-accent` / `--pr-accent-solid` used for borders, icons, hover glow. Uses `color-mix(in srgb, …)` for borders.

**Motion:** floating bg glows; hover lift on cards when `prefers-reduced-motion: no-preference`.

---

### 6.3 Process overview (`home/sections/process-overview/`)

**Role:** Compact **preview** of the six steps + stats + link to full process page.

**Structure:**

- `<section id="process" class="process-overview mss-section mss-section--base" …>`
- Centered column: eyebrow, `mss-display-lg` heading, lede
- `<ol class="process-overview__phases">` — semantic order list styled as grid chips (numbers + titles)
- Stats `<dl>` similar to hero
- CTA: `<a routerLink="/process" class="p-button … mss-btn-primary">`

**Responsive:** 6-column grid → 3 columns (`1024px`) → 2 columns (`640px`); stats 4 → 2 columns on small screens.

---

### 6.4 CTA (`home/sections/cta/`)

**Role:** Strong closing band with **orange-forward gradient card** and dual actions (book + email).

**Structure:**

- `<section id="contact" class="cta mss-section" …>` — note **no** `--base` / `--surface`; card supplies color.
- `.cta__card` with `.cta__glow` orbs + `.cta__content`

**Styling detail:** `::ng-deep .cta__eyebrow` overrides default eyebrow for contrast on warm background.

**Email:** `mailto:` uses encoded display name + angle brackets.

---

## 7. Process page (`/process`)

**Wrapper:** `process-page.html`

```html
<div id="top" class="process-page">
  <app-process />
</div>
```

**Wrapper SCSS:** `:host` block display; `.process-page { min-height: 50vh; width: 100%; }`

### Process section (`home/sections/process/`)

**Root:** `<section id="process" class="process mss-section mss-section--base mss-section--page-top">`

**Layers:**

1. `.process__bg` — grid + two radial glows (same vocabulary as process-overview)
2. `.mss-container` — header, timeline, CTA strip

**Header:** eyebrow, display heading, lede with `<strong>` for emphasis, duplicate stat strip (same messaging as process-overview but inline on page).

**Timeline:**

- `<ol class="process__timeline">` with a vertical `.process__rail` gradient line (absolute, centered on desktop)
- Each step: `<li class="pstep" [attr.data-accent]="step.accent" [class.pstep--right]="i % 2 === 1">`
- Three-column grid on desktop: `[card | anchor | empty]` alternating to `[empty | anchor | card]` via `.pstep--right`
- **Anchor:** `.pstep__anchor` ring + dot; color derives from `data-accent` (`sky` | `orange` | `violet` | `green`)
- **Card:** `.pstep__card` with CSS “speech bubble” corner via rotated pseudo-element (`::before`)
- **Head row:** icon+number pill, title/kicker, `p-tag` duration (`::ng-deep .pstep__duration`)
- **Body:** deliverables list + **artifact** mock (monospace `JetBrains Mono` stack, window dots, shine animation)
- **Roles:** two-column “Your job” / “My job” with divider

**Data:** `steps` readonly array on `ProcessComponent` — rich content model (`deliverables`, `artifact.lines`, `yourJob`, `myJob`, etc.).

**Footer CTA strip:** `.process__cta` gradient panel + primary button + ghost link to `/solutions`.

**Responsive:** ≤`900px` collapses to left rail + single column cards; duration tag spans full width; artifact/deliverables stack. ≤`560px` tightens padding; roles stack vertically.

**Reduced motion:** disables artifact shine + connector dot animation.

---

## 8. Solutions page (`/solutions`)

**Wrapper:** `solutions-page.html` mirrors process (`id="top"`, `.solutions-page`).

### Solutions section (`home/sections/solutions/`)

**Root:** `<section id="solutions" class="solutions mss-section mss-section--surface mss-section--page-top">`

Uses **`--surface`** so the page reads slightly different from base-bg sections.

**Header:** eyebrow (default sky dot), display heading, lede with `<strong>` highlights.

**Mode toggle (signals):**

- `mode = signal<'build' | 'care'>('build')`
- `computed activeList` selects packages vs care plans (template uses `isBuild()` / `setMode()`)
- UI: `role="tablist"` / `role="tab"` / `aria-selected`; sliding `.solutions__toggle-pill` animates left/right; orange gradient when “Build”, sky when “Care”

**Build mode:**

1. **Tier grid:** `@for (pkg of packages)` → `<article class="tier tier--build" [attr.data-accent] [class.tier--featured]>`
   - Featured tier: `<p-tag value="Most chosen" severity="warn" styleClass="tier__badge" />`
   - Sections: head + price row + meta + highlight chips + divider + deliverables list + full-width CTA button
2. **Tech block:** `.solutions__tech` — “Every build includes” four `.pillar` cards in a sub-panel
3. **Add-ons:** `.solutions__addons` — grid of `.addon` rows

**Care mode:**

- Same tier card pattern with `tier--care`, different fields (included hours, response time)
- `p-tag` “Recommended” uses `styleClass="tier__badge tier__badge--sky"`
- **Reassurance row:** `.solutions__reassure` — three `.reassure` cards (only in care mode branch)

**Accent styling:** `[data-accent='sky'|'orange'|'violet']` drives chip icons, feature check circles, tier icon wells — parallel to process steps.

**Animations:** `.solutions__grid` gets `solutions-swap` keyframes when switching tabs (opacity + slight Y).

**Responsive:** ≤`1100px` tiers single column (max-width `560px` centered); tech + addons go 2-column then 1-column on phones; toggle buttons flex full width.

**Note:** Tier CTAs are `p-button` labels only — no navigation wired.

---

## 9. About page (`/about`)

**Route:** `'about'` → `AboutPageComponent` (`src/app/about/about-page.ts`), **`title`**: “About — Mustard Seed Solutions” (`app.routes.ts`).

**Wrapper:** `about-page.html`

```html
<div id="top" class="about-page">
  <app-about />
  <app-cta />
</div>
```

**Wrapper SCSS (`about-page.scss`):** `:host { display: block; }`; **`.about-page { min-height: 50vh; }`** — same “thin shell” idea as `process-page` / `solutions-page`.

**Imports:** `AboutComponent` (`home/sections/about/about.ts`) + `CtaComponent` (`home/sections/cta/cta.ts`). **`ChangeDetectionStrategy.OnPush`** on the page component.

### About section (`home/sections/about/`)

**Role:** Personal story + credibility: headline stack, bio intro, portrait, three narrative **feature** tiles (accented like Principles), scripture pull-quotes, optional-style **stats** strip — all on **`--mss-bg-base`** with process-family atmosphere (**§3.12**).

**Root:** `<section id="about" class="about mss-section mss-section--base mss-section--page-top" aria-labelledby="about-heading">`

**Layers:**

1. **`.about__bg`** — absolutely positioned, **`inset: 0`**, **`z-index: 0`**, **`pointer-events: none`**, **`aria-hidden="true"`**: grid, dual corner glows, violet blob, beams (**§3.12**).
2. **`.mss-container.about__container`** — **`position: relative`**, **`z-index: 1`**: holds **`about__inner`** grid + **`about__stats`**.

**Inner grid (`about__inner`):** Four logical tiles on desktop — **`lead` + photo / features + scripture** — implemented as five DOM nodes when counting **`display: contents`** split on mobile (see **§3.12**).

**Lead (`about__lead`):**

- **Tablet+:** Flex column grouping **`about__title-block`** + **`about__intro`** under **`grid-area: title`**.
- **Mobile (`≤720px`):** **`display: contents`**; **`about__title-block`** → area **`title`**; **`about__intro`** → area **`intro`**, with **`photo`** between them.

**Title block (`header.about__title-block`):** Eyebrow, semantic **`h1`** with **`mss-display-lg`**, gradient **`.about__rule`** — no duplicate eyebrow dot overrides (uses **`mss-eyebrow--orange`** per alignment plan).

**Features (`div.about__copy-block` → `ul.about__features`):** **`@for (feature of features; track feature.id)`** on **`readonly`** **`features`** array. **`AboutFeature`** model: **`id`**, **`title`**, **`description`**, **`icon`** (PrimeIcons class string), **`accent`**: **`'sky' | 'orange' | 'violet'`**. Tile headings use **`mss-h4`** + body **`mss-body mss-text-muted`**.

**Scripture (`aside.about__scripture`):** Two blockquotes + cites; spine + hairline + hover parity with elevated cards — detailed in **§3.12** and **`plans/about.plan.md`** §11 / Phase 2b.

**Stats (`dl.about__stats`):** **`@for (s of stats; track s.id)`** over **`readonly`** **`AboutStat[]`** (`id`, `value`, `label`). Matches overview/hero **`<dl>`** storytelling pattern.

**Assets:** **`profileSrc`** (`'/Profile Pic.webp'`), **`profileAlt`** — **`NgOptimizedImage` not used** (plain **`img`** with **`width`/`height`**).

**Dependencies:** Section **`imports: []`** — PrimeIcons loaded globally (`angular.json`); no PrimeNG modules in this component.

**Closing funnel:** Page-level **`<app-cta />`** duplicates Home’s contact anchor behavior on `/about` (**§6.4**, **§4**).

---

## 10. Patterns to copy for new pages

1. **Create a section component** under `src/app/.../sections/` (or a feature folder): `standalone: true`, `ChangeDetectionStrategy.OnPush`, co-located `.html` / `.scss`.
2. **Section root:** semantic `<section>` with unique `aria-labelledby` or `aria-label`, and an `id` if it’s a nav/hash target.
3. **Apply spacing:** `class="… mss-section mss-section--base"` or `--surface`; use `mss-section--page-top` on the **first** section below global nav.
4. **Content width:** wrap primary content in `<div class="mss-container">`.
5. **Atmosphere:** absolutely positioned `.__bg` sibling with grid + blurred glows; content `z-index: 1` — matches About (**§3.12**), process/overview/principles/solutions.
6. **Typography:** compose `mss-display-lg`, `mss-body-lg`, `mss-text-secondary`, etc., instead of one-off font sizes.
7. **CTAs:** reuse `mss-btn-primary` / `mss-btn-ghost` / `mss-btn-on-brand` with PrimeNG or anchor-button pattern.
8. **Lists:** use `@for` with explicit `track`; prefer semantic `<ol>` / `<ul>` / `<dl>` where it aids accessibility.
9. **PrimeNG overrides:** when necessary, scope with `:host ::ng-deep` sparingly (existing examples: duration tag, tier badges).
10. **Motion:** respect `prefers-reduced-motion` for infinite animations; offer lighter tiers on mobile if cost is high (see hero).

---

## 11. File index (quick lookup)

| Area | Path |
|------|------|
| Routes | `src/app/app.routes.ts` |
| Design tokens + utilities | `src/styles.scss` |
| App shell | `src/app/app.ts`, `app.html`, `app.scss` |
| Home shell | `src/app/home/home.ts`, `home.html`, `home.scss` |
| Hero | `src/app/home/sections/hero/*` |
| Principles | `src/app/home/sections/process-principles/*` |
| Process preview | `src/app/home/sections/process-overview/*` |
| CTA | `src/app/home/sections/cta/*` |
| Full process | `src/app/home/sections/process/*`, `src/app/process/process-page.*` |
| Full solutions | `src/app/home/sections/solutions/*`, `src/app/solutions/solutions-page.*` |
| About | `src/app/home/sections/about/*`, `src/app/about/about-page.*` |
| Shared (nav, footer, spinner, auth, guards) | `src/app/shared/nav/*`, `shared/footer/*`, `shared/loading-spinner/*`, `shared/services/auth.service.ts`, `shared/guards/*` |
| App shell | `src/app/app.ts`, `app.html`, `app.scss` |

---

## 12. Dependencies worth remembering

- **Styles pipeline:** `angular.json` includes `primeicons.css` then `src/styles.scss`.
- **Fonts:** Inter (global); artifact monospace stacks reference JetBrains Mono / Fira Code with system fallbacks.
- **Icons:** PrimeIcons classes (`pi pi-*`) across sections.

---

*Internal layout/theme reference for Mustard Seed Solutions marketing pages (Home, About, Process, Solutions).*
