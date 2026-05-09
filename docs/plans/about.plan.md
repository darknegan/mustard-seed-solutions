# About page — alignment plan (MSS marketing theme)

Plan to bring **`/about`** (`AboutComponent` + `about-page` wrapper) in line with [`../research.md`](../research.md): tokens, atmosphere, typography rhythm, card language, and closing funnel parity with Home, Process, and Solutions.

**Scope:** `src/app/home/sections/about/` (`about.html`, `about.ts`, `about.scss`), optionally `src/app/about/about-page.*` for layout/CTA assembly.

**Reference:** [`../research.md`](../research.md) (§2 tokens/utilities, §3 visual DNA incl. depth §3.1, principles §3.5, timeline rail §3.8, new-page checklist §3.11, §9 patterns). Scripture aside: plan §11 + Phase **2b**.

---

## Current alignment (keep)

- Thin page wrapper like Process/Solutions: `id="top"`, `AboutPageComponent` → `<app-about />`.
- Section primitives: `mss-section mss-section--base mss-section--page-top`, content in `mss-container`.
- Eyebrow + structured copy; body uses `mss-body-lg`, `mss-text-secondary`, `mss-h4`, etc.
- Accent atmosphere: sky / orange / violet blobs + horizontal beams; scripture aside uses **tokenized card**, **process-style gradient spine** (~3px), **principles-style top hairline**, **`blockquote` / `cite`**, **`mss-*` type**, optional hover lift gated by **`prefers-reduced-motion`** (Phase **2b** done — §11).

---

## Gaps and proposed changes

### 1. Atmosphere layer (research §3.6, §9.5)

**Issue:** Process overview / timeline use a **faint grid** + **large corner glows** (~160px blur family). About relies on smaller blobs (`blur(72px)`), **no grid**, and decor height is capped (`min(938px, 100%)`), so long pages can feel visually flat below the fold.

**Plan:**

- Add a background grid layer (e.g. `.about__bg-grid`), analogous to `process-overview__bg-grid` — ~56px cells, low contrast, optional radial fade toward center.
- Tune glows toward documented scale (softer, larger blur) and/or tie blur radii to tokens where practical.
- Extend or tile subtle atmosphere so the section reads as one continuous **band**, not a decorative header-only zone.

---

### 2. Intro typography stack (research §3.11, §9.7)

**Issue:** Doc pattern is **eyebrow → display → body**. About uses **`mss-h1`** for the main title; other marketing headers heavily use **`mss-display-lg`** (Process overview, Solutions).

**Plan:**

- Apply **`mss-display-lg`** to the visible headline while preserving a semantic **`<h1>`** (single `h1` per page for SEO/accessibility).
- Ensure spacing below display matches other section headers.

---

### 3. Tokenized surfaces (research §2.1)

**Issue:** Feature rows use hard-coded `#171f33` and `rgba(42, 58, 86, …)` instead of shared surfaces/borders.

**Plan:**

- Replace with **`var(--mss-bg-card)`** (or `--mss-bg-elevated` if distinction matters), **`var(--mss-border-subtle)`** / **`--mss-border-default`**, matching Principles/Solutions elevation language.

---

### 4. Feature tiles vs Principles card language (research §3.5, §3.11)

**Issue:** Principles use ~**28px** corners, **left accent rail**, **icon capsules** with tint + border + soft glow, optional hover lift. About features use **18px** radius, neutral slab, **dot-only** icon treatment — weaker visual sibling.

**Plan:**

- Increase radius toward **`--mss-radius-2xl`** (or consistent `xl`/`2xl` with photo/scripture).
- Add **`data-accent`** or BEM modifiers (`sky` | `orange` | `violet`) for:
  - ~**3px left rail** (tier color),
  - **icon capsule** (PrimeIcons `pi pi-*` aligned with Process/Solutions),
  - optional **colored outer glow** on hover when `prefers-reduced-motion: no-preference`.

---

### 5. Headline emphasis (research §3.4, §3.5)

**Issue:** Hero and Principles use **italic orange** and/or **gradient text** on key words; About headline is flat.

**Plan:**

- Emphasize one short phrase in the H1 (e.g. italic **`mss-text-orange`** or gradient clip treatment on “Strong sites” / “Small seeds”) for brand continuity without copying full hero motion.

---

### 6. Eyebrow standardization (research §2.5)

**Issue:** Custom `.about__eyebrow.mss-eyebrow::before { background: … }` duplicates **`mss-eyebrow--orange`**.

**Plan:**

- Use **`mss-eyebrow mss-eyebrow--orange`** in markup and remove redundant SCSS unless a unique variant is required.

---

### 7. Layout / container redundancy

**Issue:** `.about__inner` sets `max-width: 1200px; margin-inline: auto` while **`mss-container`** already encodes width + gutters.

**Plan:**

- Rely on **`mss-container`** for width; keep inner flex/grid only for column layout and gaps.

---

### 8. Closing funnel / CTA parity (research §3.7, §7)

**Issue:** Process ends with **`.process__cta`** strip; Home ends with **`<app-cta />`**. About ends after scripture — feels disconnected from the rest of the marketing flow.

**Plan:**

- Add **`<app-cta />`** to `about-page.html` (or a slim dual-action strip: contact + links to `/process`, `/solutions`) so `/about` closes like other routes.

---

### 9. Optional credibility strip

**Issue:** Process page header repeats **stats** (`<dl>` pattern). Not mandatory for About.

**Plan (optional):**

- Add 2–3 **stats** in the same **`process-overview`-style** markup/classes if you want extra trust signals without new visual language.

---

### 10. Motion and accessibility (research §3.10)

**Issue:** Decor is mostly static today — acceptable.

**Plan:**

- If grid pan, blob drift, or hover animations are added later, gate infinite motion behind **`prefers-reduced-motion`** (mirror Hero / Process patterns).

---

### 11. Scripture aside (`about__scripture`) — theme parity (research §3.1, §3.5, §3.8, §3.11)

**Issue:** Pull-quote aside should read as same **MSS depth stack** as Principles tiles and Process cards: tokenized surfaces, predictable radius/shadow/border, typography utilities — not a one-off slab that drifts from `--mss-*` and the **28px / rail / hairline** family.

**Plan:**

- **Surfaces & borders:** Fill from **`--mss-bg-card`** or **`--mss-bg-elevated`** (same elevation story as `.about__feat`); borders **`--mss-border-subtle`** / **`--mss-border-default`** — no orphan `#…` / raw RGBA that duplicate token roles (research §2.1, §3.11 checklist item 4).
- **Radius & shadow:** Corner radius **`--mss-radius-2xl`** (~28px) aligned with feature tiles and photo frame; **soft large blur shadow** + optional **inner top rim** (~1px light at ~2–6% opacity) per §3.1 “depth”.
- **Accent spine / rail:** Keep or refine **vertical gradient spine** (sky → violet → orange) so it echoes **Process timeline rail** (§3.8) at **quote-appropriate weight** — or swap for a **~3px left accent rail** (e.g. orange-forward warmth) like Principles cards (§3.5); avoid competing with feature rails at full timeline saturation.
- **Top hairline (optional):** 1px **horizontal gradient** transparent → sky → orange → transparent (Principles shell vocabulary, §3.5) if the aside should “belong” to the glass/shell language without wrapping the whole section.
- **Typography:** Quote body via **`mss-body-lg`** + **`mss-text-primary`**; citation / ref via **`mss-text-secondary`** or **`mss-text-muted`**; optional **italic + `mss-text-orange`** on a short clause if it matches hero/process emphasis rules (§3.4) without shouting over the quote.
- **Semantics:** Prefer **`<blockquote>`** (+ **`cite`** if applicable) inside the aside for accessibility; keep `aria-labelledby` / labels consistent with section heading if referenced.
- **Motion:** Default **static**; any hover lift only if it mirrors `.about__feat` and respects **`prefers-reduced-motion`**.

---

## Implementation order

1. **Atmosphere:** grid layer + glow tuning + full-section continuity.
2. **Feature cards:** tokens, radius, accent rail, PrimeNG/icon capsules, optional hover lift.
3. **Scripture aside:** tokenized surface/border/shadow, `--mss-radius-2xl`, spine or rail + optional top hairline, typography utilities, semantic quote markup.
4. **Typography:** display headline + optional headline accent word/phrase.
5. **Page arc:** wire **`app-cta`** (or equivalent) on `about-page`.
6. **Cleanup:** eyebrow modifier class, remove duplicate container max-width.
7. **Optional:** stats strip; further PrimeNG/button consistency if new CTAs appear.

---

## Detailed todo list

Use this as execution checklist. Order phases roughly sequential; some tasks inside a phase can run in parallel (HTML vs SCSS) once structure is agreed.

### Phase 0 — Prep

- [x] Re-read [`../research.md`](../research.md) §2–§3 and skim `process-overview`, `process-principles`, `cta` section SCSS for patterns to mirror.
- [x] Snapshot current `/about` in browser (desktop + mobile widths) for before/after comparison.
- [x] Confirm profile image path and alt text unchanged unless intentionally updating copy.

### Phase 1 — Atmosphere (grid, glows, full-section band)

- [x] Inspect `process-overview__bg` / `process-overview__bg-grid` markup and sizing in `process-overview.html` + `.scss`.
- [x] Add semantic background wrapper under `.about` (e.g. rename or extend `.about__decor` vs new `.about__bg` split: grid vs glows vs beams) consistent with research §9.5 sibling pattern.
- [x] Implement `.about__bg-grid` (or equivalent): ~56px cell rhythm, low-contrast lines using MSS tokens where possible, optional radial mask so center stays readable.
- [x] Retune blob layers: increase blur toward ~140–160px class where perf OK; align sky/orange/violet opacity with process-overview family.
- [x] Remove or raise `height: min(938px, 100%)` cap on decor so atmosphere covers full section height; verify no layout overflow/regression.
- [x] Reconcile thin horizontal beams with new grid (z-order, opacity); keep or simplify if redundant.
- [x] Spot-check `prefers-reduced-motion`: if any new infinite animations added here, disable or reduce per hero/process precedent.

### Phase 2 — Feature tiles (tokens, radius, rail, icons)

- [x] Replace `.about__feat` hard-coded `#171f33` and raw RGBA borders with `--mss-bg-card` / `--mss-bg-elevated` and `--mss-border-subtle` or `--mss-border-default`.
- [x] Set card radius to `--mss-radius-2xl` or pair `xl`/`2xl` intentionally with `.about__photo-frame` and `.about__scripture` (full scripture token/spine/hairline pass → Phase **2b** / §11).
- [x] Extend `AboutFeature` interface in `about.ts`: add `readonly icon: string` (PrimeIcons class fragment) and `readonly accent: 'sky' | 'orange' | 'violet'` (or reuse existing process/solutions accent union if exported).
- [x] Populate each feature with icon + accent in data; drop `nth-child` dot color hacks in SCSS in favor of `data-accent`.
- [x] Update `about.html` `@for`: bind `[attr.data-accent]="feature.accent"` on each `.about__feat` (or BEM modifier classes).
- [x] Add left accent rail (~3px) per accent via CSS variables or shared mixin pattern (compare `.principle--N` / `color-mix` approach).
- [x] Replace dot-only `.about__feat-icon` with capsule treatment: tinted background, border, soft shadow colored by accent (see principles cards).
- [x] Render `<i class="pi …" aria-hidden="true">` (or `<span>` with PrimeIcons) inside capsule; import nothing if global stylesheet already loads primeicons — otherwise add minimal module/import per project convention.
- [x] Add hover lift + stronger border/glow for `.about__feat` when `prefers-reduced-motion: no-preference`; no motion-only critical info.
- [x] Verify focus outlines / contrast on feature titles and descriptions still pass.

### Phase 2b — Scripture aside (`about__scripture`)

- [x] Audit `.about__scripture` + nested quote markup in `about.html`; ensure **`<blockquote>`** / **`cite`** (or equivalent) where appropriate; wire `aria-*` if tied to section heading.
- [x] Replace hard-coded fills/borders/shadows in `about.scss` for `.about__scripture` with **`--mss-bg-card`** or **`--mss-bg-elevated`**, **`--mss-border-subtle`** / **`--mss-border-default`**, shadow recipe aligned with other elevated cards (research §3.1).
- [x] Set radius to **`--mss-radius-2xl`** and verify visual parity with `.about__feat` / `.about__photo-frame` (research §3.11).
- [x] Refine **gradient spine** vs **~3px left rail**: pick one primary accent treatment consistent with Process timeline (§3.8) or Principles tiles (§3.5); tune stops/opacity so aside does not outrank feature cards.
- [x] Optionally add **top hairline** gradient strip (Principles shell pattern, §3.5) if spine+rail still reads flat.
- [x] Apply typography utilities: quote **`mss-body-lg`** + **`mss-text-primary`**; attribution **`mss-text-secondary`** / **`mss-text-muted`**; optional italic **`mss-text-orange`** phrase per §3.4 — check contrast.
- [x] Responsive pass: aside + photo column stacking unchanged functionally; spacing vs features row and following CTA unchanged or improved.
- [x] If hover states added, mirror `.about__feat` motion policy + **`prefers-reduced-motion`**.

### Phase 3 — Intro stack (eyebrow, display title, headline accent)

- [x] Change eyebrow markup to `mss-eyebrow mss-eyebrow--orange`; remove custom `.about__eyebrow.mss-eyebrow::before` rules from `about.scss`.
- [x] Keep single `<h1 id="about-heading">`; add `mss-display-lg` (and drop `mss-h1` if redundant for styling).
- [x] Adjust heading margin/spacing to match `process-overview__header` / solutions header rhythm.
- [x] Implement headline emphasis: wrap chosen phrase in `<span>` with italic + `mss-text-orange` **or** documented gradient-text utility if one exists in `styles.scss`; avoid competing animations.
- [x] Review `.about__rule` gradient bar vs principles top hairline — keep, tweak stops to tokens, or replace if redundant with new grid/atmosphere.

### Phase 4 — Layout cleanup

- [x] Remove duplicate width constraint from `.about__inner` (`max-width` / `margin-inline: auto`); rely on `.mss-container` only.
- [x] Re-verify two-column flex behavior at `1100px`, `640px`, and smallest breakpoints; confirm scripture + photo stacking.
- [x] Confirm `z-index` stacking: bg layers `0`, content `1`, no stray overlap with nav.

### Phase 5 — Closing funnel / CTA

- [x] Open `cta` section component: note selector (`app-cta`), inputs if any, and `id="contact"` behavior for `#contact` links.
- [x] Import `CtaComponent` into `about-page.ts` and add to `imports` array.
- [x] Append `<app-cta />` below `<app-about />` in `about-page.html` (or wrap both in a fragment-less root as today).
- [x] Confirm scroll-to-contact from nav still works when arriving from `/about` (hash targets home vs in-page — adjust nav link only if product decision says `/about` needs `#contact`; document outcome).
- [x] Visual pass: spacing between scripture block and CTA section matches other route endings (post–Phase **2b** scripture polish verified).

### Phase 6 — Optional credibility stats

- [x] Decide copy for 2–3 stats (values + short uppercase labels) — align with client-facing tone rules.
- [x] Copy `process-overview` stats `<dl>` structure and classes into `about.html` (placement: after intro paragraph or after feature list).
- [x] Wire stats data as readonly array in `about.ts`; use `@for` with stable `track` id.
- [x] Tune spacing/divider above stats row to match overview; avoid duplicating process phase chips unless intentional.

### Phase 7 — QA and polish

- [x] Run responsive checks: 1440px, 1024px, 768px, 480px; verify grid visibility and perf on low-end mobile.
- [x] Toggle `prefers-reduced-motion` in devtools; confirm hover/grid/beam behavior acceptable.
- [x] Lighthouse quick pass (Accessibility tree: single `h1`, landmark order).
- [x] If Figma mocks exist for About, diff against [`../research.md`](../research.md) checklist §3.11.
- [x] After Phase **2b**: re-run spot-check on `.about__scripture` (tokens, contrast, `blockquote`/landmarks, spacing to CTA) against §3.1 / §3.11.

### Implementation notes (done)

- Stats row sits below the two-column block, full width inside `mss-container`, `track` on stat `id`.
- Nav **Free consult** stays `/#contact` so `/process` and `/solutions` (no local `#contact`) still reach Home’s CTA; `/about` also renders `<app-cta />` with `id="contact"` for same-route parity.
- **Scripture (Phase 2b):** dual `<blockquote>` + `<footer><cite>`, `.about__scripture-hairline`, timeline-like `.about__scripture-spine`, `--mss-border-subtle` / `--mss-glow-*` shadows, `.about__scripture-em` italic orange phrases; hover lift under `prefers-reduced-motion: no-preference`.
- Compile check: `ng build --configuration=development` passes.

---

## Files touched (expected)

| File | Role |
|------|------|
| `src/app/home/sections/about/about.html` | Structure: grid wrapper, eyebrow class, display `h1`, feature accents/icons, **scripture aside** semantics/utilities, optional stats |
| `src/app/home/sections/about/about.scss` | Grid, glows, tokenized feat cards, rail/capsule/hover, **`.about__scripture`** tokens/spine/hairline/type |
| `src/app/home/sections/about/about.ts` | Feature model (`icon`, `accent`) if expanding cards |
| `src/app/about/about-page.html` | Import/assemble `<app-cta />` or footer strip |
| `src/app/about/about-page.ts` | Import `CtaComponent` if added |

---

*Derived from [`../research.md`](../research.md) marketing theme reference and a comparative review of the About implementation.*
