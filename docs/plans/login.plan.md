# Login page — theme alignment plan (MSS client portal)

Plan to bring **`/login`** (`LoginPageComponent`: `login-page.html`, `login-page.scss`, `login-page.ts`) closer to the marketing visual system documented in [`../research.md`](../research.md): tokens, atmosphere, typography rhythm, card depth, and chrome continuity—without turning the page into a full hero clone (perf + focus: auth task first).

**Scope:** `src/app/login/` only unless you deliberately re-enable global chrome for login (today **`data.hideChrome`** removes nav/footer—see research §4.1).

**Reference:** [`../research.md`](../research.md) §2 (tokens/utilities), §3.1 (visual DNA), §3.5–3.7 (glass shell / CTA gradient language), §3.11 (new-page checklist), §4.1–4.2 (nav parity).

---

## Current alignment (keep)

- **`hideChrome`** layout: dedicated slim header + split shell fits “portal” mental model; avoids competing with marketing nav while logged-out.
- **Token usage** on core surfaces: `--mss-bg-base`, `--mss-bg-surface`, `--mss-bg-card`, borders, text hierarchy, sky focus rings, orange primary submit.
- **Structure:** Left story panel + right form panel; eyebrow “Client portal”; benefit list with glowing dot bullets—already echoes brand accents (sky/orange).
- **Responsive:** Single column under ~900px; form card padding tightens on small screens.

---

## Gaps and proposed changes

### 1. Brand mark & header chrome (research §3.3, §4.2)

**Issue:** Login header uses a **CSS circle** for `.login-page__mark` instead of the shared **glyph SVG** (`/mustard-seed-glyph-logo.svg`) and stacked wordmark rhythm used in **`app-nav`** / **`app-footer`**. Nav bar background is **hard-coded `#050913`** instead of the frosted **`color-mix`** + **`backdrop-filter`** treatment.

**Plan:**

- Swap mark for the **same brand link pattern** as nav: glyph asset + typographic lockup (reuse markup/classes or extract a tiny shared partial later if duplication hurts).
- Align **header bar** with §3.3: translucent **`--mss-bg-base`**, **`backdrop-filter: saturate(140%) blur(18px)`**, **`border-bottom: var(--mss-border-subtle)`**, preserve **~80px** height intent (`--mss-nav-height`).
- Apply **cyan glow** on glyph via `drop-shadow` mix (`--mss-sky`) like `.nav__mark-logo`.

---

### 2. Atmosphere on brand panel (research §3.6, §3.12, §3.11)

**Issue:** Left panel only has **two small-blur glows** (`blur(4px)` reads more like blobs than the **~160px** corner wash family). Marketing sections add **56px grid**, **radial vignette**, optional **horizontal beams**, and **violet** tertiary accent for depth.

**Plan:**

- Add **`aria-hidden`** full-bleed layers inside `.login-page__brand-panel`:
  - **Grid:** ~56×56px lines, low-contrast blue, **center or top-weighted radial fade** (About §3.12 pattern) so copy stays readable.
  - **Corner glows:** Large ellipses with **`filter: blur(160px)`** (sky upper area, orange lower area); tune opacity to ~0.18–0.24 range per research.
  - Optional **single violet** soft orb (`mix-blend-mode: screen` at low opacity) for “premium” parity with About/principles—keep subtle on login.
  - Optional **thin horizontal gradient beams** (sky / orange) like About—**disable ≤640px** if noisy on phones.
- Respect **`prefers-reduced-motion`:** static layers only (no infinite pan); login is not the place for hero-grade motion.

---

### 3. Typography stack (research §2.4, §3.11)

**Issue:** Headline uses **custom font-size (32px)** and tracking; marketing prefers **`.mss-display-lg`** (or **`mss-display-xl`** if you want stronger portal hero). Lede/benefits don’t use **`mss-body-lg`** / **`mss-body`** / **`mss-text-secondary`** consistently.

**Plan:**

- Promote headline to **`mss-display-lg`** (single semantic **`h1`** kept—portal page title).
- Use **`mss-body-lg mss-text-secondary`** on lede; **`mss-body-sm`** or **`mss-body`** on benefit lines with **`mss-text-secondary`**.
- Add **`.mss-eyebrow--orange`** on “Client portal” if you want parity with orange-flavored section labels (Process/Solutions toggles use orange for warmth).

---

### 4. Headline emphasis (research §3.4, §3.5)

**Issue:** Marketing headlines often carry **italic orange** or **gradient-clipped** accent on one phrase; login headline is visually flat.

**Plan:**

- Split the **`h1`** into lines/spans: apply **italic** + **`var(--mss-orange-strong)`** (or a **static** sky→orange gradient clip **without** animation) on one short anchor word (“results”, “account”, etc.)—enough to feel “MSS” without hero shimmer loops.

---

### 5. Form card elevation (research §3.5 shell, §3.11 card checklist)

**Issue:** `.login-card` uses **`--mss-radius-lg`** and a single hairline border—flatter than principles **~28px** glass shells and timeline cards (**`--mss-radius-2xl`**, deep shadow, inner top rim, optional **top hairline gradient** transparent→sky→orange).

**Plan:**

- Bump card radius toward **`--mss-radius-2xl`**.
- Add **layered depth:** larger **outer shadow** (dark at low opacity), **1px** border on **`--mss-border-subtle`**, subtle **inner highlight** (1px white ~3–6% opacity at top edge)—match vocabulary in §3.1 “Depth”.
- Optional **top hairline gradient** strip (principles shell §3.5) across the card header zone—keeps parity with “glass card” language.
- On **focus/hover** of the whole card: unnecessary; keep micro-interaction on **inputs** and **submit** only.

---

### 6. Inputs & actions vs global button system (research §2.6)

**Issue:** Submit is a **custom `<button>`** with orange fills; elsewhere CTAs often use **PrimeNG `p-button`** + **`mss-btn-primary`** / **`mss-btn-ghost`** for consistent radius, padding, and disabled states.

**Plan:**

- Replace submit with **`<button pButton type="submit" class="... mss-btn-primary">`** (import **`ButtonModule`**) for parity with marketing CTAs and shared disabled styling.
- Consider **`mss-btn-ghost`** for tertiary actions if you add **“Back”** inside the card later.
- Inputs: slightly increase radius toward **`--mss-radius-md`** if marketing forms elsewhere use mid radii (12px family); keep **16px** input font on mobile for iOS zoom behavior.

---

### 7. Benefit list as “feature chips” (research §3.6 phase chips)

**Issue:** Benefits are plain text rows; Process overview uses **elevated chips** (`--mss-bg-elevated`, ~12px radius, hairline border).

**Plan:**

- Optionally wrap each benefit in a **compact pill row** or **mini-card** with left sky/orange micro-accent—lighter than full Principles tiles but closer to §3.6 vocabulary.

---

### 8. Error state tokenization (research §2.1, accessibility)

**Issue:** Error panel uses **raw red hex** / rgba for background and text—outside MSS semantic tokens.

**Plan:**

- Introduce or reuse **destructive** tokens in `styles.scss` if absent (e.g. `--mss-danger-bg`, `--mss-danger-text`) and reference them from `.login-card__error` so alerts match theme-aware evolution.

---

### 9. Optional right-panel backdrop (research §3.1)

**Issue:** Form side is flat **`--mss-bg-base`**; acceptable for focus, but can feel disconnected from the richer left panel.

**Plan:**

- Add **very faint** base-layer grid or **single blurred orb** behind the form (lower contrast than left panel) so the split still reads as **one page**—stop before competing with the card.

---

### 10. Content tone (workspace client-facing copy rules)

**Issue:** Copy is already plain-language and outcome-oriented—good.

**Plan:**

- When editing strings, keep **benefit-led** phrasing; avoid stack jargon on labels; “Forgot password?” flow copy should stay reassuring and short when wired.

---

## Detailed todo list (phased)

Work **top to bottom** unless parallelizing safe tasks (e.g. tokens in `styles.scss` while editing login SCSS). **Optional** tasks can ship in a follow-up PR.

### Phase 1 — Brand mark & login header chrome

- [x] Inspect `shared/nav/` (and footer if needed) for exact **glyph path**, **wordmark markup**, and **link semantics** (`routerLink` vs `href="/"` for home)—mirror behavior appropriate for login (`routerLink` to `/` is fine inside SPA).
- [x] Replace `.login-page__mark` circle with **`<img>` or inline-use** of `/mustard-seed-glyph-logo.svg` (match nav dimensions or scale proportionally within ~36–56px height band per research §3.3).
- [x] Align **wordmark** typography with nav/footer (font weight, size ramp, spacing)—reuse classes if exported to shared partial **or** duplicate minimally with a TODO to dedupe.
- [x] Remove **hard-coded** `#050913` from `.login-page__nav`; use **`color-mix(in oklab, var(--mss-bg-base) 82%, transparent)`** (or same formula as `.nav`) for translucent bar.
- [x] Add **`backdrop-filter: saturate(140%) blur(18px)`** (+ `-webkit-backdrop-filter` if required for Safari).
- [x] Add **`border-bottom: 1px solid`** using **`var(--mss-border-subtle)`** (or equivalent token already used on nav).
- [x] Set header height using **`var(--mss-nav-height)`** (80px) for consistency with global nav.
- [x] Apply **glyph glow**: `drop-shadow` using **`--mss-sky`** mix (match `.nav__mark-logo` intent).
- [x] Verify **focus-visible** styles on brand link and “Back to site” match keyboard UX (contrast + outline).

### Phase 2 — Typography & eyebrow (left panel)

- [x] Change portal **`h1`** to use **`mss-display-lg`** (keep single **`h1`**; adjust markup if wrapper spans needed in Phase 9).
- [x] Apply **`mss-body-lg`** + **`mss-text-secondary`** to `.login-page__lede`.
- [x] Apply **`mss-body-sm`** or **`mss-body`** + **`mss-text-secondary`** to `.login-page__benefits` list items.
- [x] Decide eyebrow variant: add **`mss-eyebrow--orange`** to “Client portal” **or** keep default dot; document choice in PR.
- [x] After class changes, **strip redundant** custom `font-size` / `line-height` / `letter-spacing` from SCSS that duplicates token utilities (avoid double-spec).
- [x] Check **narrow breakpoints**: heading scale still acceptable at 720px / 480px (research responsive display rules live in `styles.scss`).

### Phase 3 — Form card elevation & “glass” vocabulary

- [x] Bump `.login-card` **`border-radius`** to **`var(--mss-radius-2xl)`**.
- [x] Keep **`border: 1px solid var(--mss-border-subtle)`** (or tighten to match principles if design wants **`--mss-border-default`** on hover only).
- [x] Add **outer shadow** (large blur, dark at low opacity)—tune so card separates from `--mss-bg-base` without muddying inputs.
- [x] Add **inner top rim** / highlight (~1px white or `color-mix` at 3–6% opacity) for depth per §3.1.
- [x] Optional: add **top hairline gradient** (`transparent → sky → orange → transparent`) as a pseudo-element on `.login-card` or a dedicated inner wrapper.
- [x] Confirm **signup vs login** modes both inherit the same card shell (no drift between `@if` branches).
- [x] Ensure **error banner** width/layout still aligns when card padding changes.

### Phase 4 — Brand panel atmosphere (static decor)

- [x] Add wrapper(s) **`aria-hidden="true"`** for decorative layers inside `.login-page__brand-panel` (don’t nest interactive content).
- [x] Implement **56×56px grid** background (low-contrast blue lines); **mask** with radial fade (center-top bias per About §3.12).
- [x] Replace or supplement existing `.login-page__glow*` with **large ellipses** + **`filter: blur(160px)`**—sky anchor (e.g. upper-right), orange anchor (e.g. lower-left); tune **opacity ~0.18–0.24**.
- [x] Optional: add **violet** orb with **`mix-blend-mode: screen`** at low intensity.
- [x] Optional: add **two thin horizontal beams** (sky / orange via `color-mix`); **`@media (max-width: 640px)`** hide or reduce opacity.
- [x] Confirm **`prefers-reduced-motion`**: no animated pans/drifts; decor stays static.
- [x] Performance sanity: no expensive filters on **form** side; decor confined to left panel.
- [x] Remove obsolete glow rules if superseded (avoid duplicate blur stacks).

### Phase 5 — Inputs & primary actions (PrimeNG parity)

- [x] Import **`ButtonModule`** into `login-page.ts` (standalone `imports` array).
- [x] Replace **login** submit `<button class="login-card__submit">` with **`<button pButton type="submit" …>`** using **`mss-btn-primary`** (+ size class if project standard exists, e.g. `p-button-lg`).
- [x] Replace **signup** submit the same way.
- [x] Map **`[disabled]="loading()"`** to PrimeNG button; verify **loading** label still readable (template `@if` vs `label` prop—pick one pattern).
- [x] Delete **unused** `.login-card__submit` rules after migration (or keep only overrides if global styles insufficient).
- [x] Bump input **`border-radius`** toward **`var(--mss-radius-md)`** if aligned with global form controls; keep **`font-size: 16px`** on inputs at mobile widths.
- [x] Re-verify **focus ring** on inputs (sky ring) still contrasts after radius change.

### Phase 6 — Benefit list as elevated chips *(optional)*

- [x] Decide chip density: **one row per benefit** vs compact stack.
- [x] Wrap each `<li>` content in a container with **`--mss-bg-elevated`**, **~12px radius**, **hairline border** (`--mss-border-subtle`).
- [x] Add **micro-accent**: left border segment or small sky dot (alternate orange optional)—stay subtler than Principles tiles.
- [x] Adjust **spacing** between chips (`gap`) so panel vertical rhythm still balances headline + lede.
- [x] Mobile: chips **full width**; touch targets comfortable.

### Phase 7 — Error state tokens

- [x] Audit `src/styles.scss` for existing **danger/error** CSS variables; if missing, add **`--mss-danger-bg`** / **`--mss-danger-text`** (and border if needed) alongside other tokens.
- [x] Update `.login-card__error` to use those variables instead of raw **`#f87171`** / **`rgba(239, 68, 68, …)`**.
- [x] Ensure error text meets **contrast** on `--mss-bg-card` (adjust token mixes if fail).
- [x] If **`role="alert"`** already present, keep; confirm screen reader announces on new login error.

### Phase 8 — Right (form) panel backdrop *(optional)*

- [x] Add **low-contrast** decor on `.login-page__form-panel`: faint grid **or** single **blurred orb** (weaker than left panel).
- [x] Validate card remains **visual foreground** (decor does not reduce input readability).
- [x] Disable or simplify decor at **`max-width: 640px`** if clutter competes with form.

### Phase 9 — Headline emphasis polish

- [x] Choose **accent phrase** (one word or short fragment) for brand continuity.
- [x] Apply **italic** + **`var(--mss-orange-strong)`** **or** **static** `background-clip: text` gradient (sky → orange) **without** animation.
- [x] Ensure **semantic heading**: still one **`h1`**; accent lives in **`span`** with **`aria-hidden`** only if decorative (prefer meaningful emphasis without hiding from AT).
- [x] Cross-check **WCAG** contrast for gradient text (fallback solid color if gradient fails).

### Phase 10 — Copy pass & final verification

- [x] Quick **copy review** against client-facing tone (outcomes, no stack jargon)—adjust strings only if needed.
- [x] Run through **Verification checklist** (below) and tick items in PR description or this doc.
- [x] Visual regression: **desktop**, **~900px** (stack), **640px**, **375px**.
- [x] **`prefers-reduced-motion`**: spot-check reduced animations (none expected beyond hover/submit).
- [x] Optional follow-up: extract **shared brand header** component if login + another chrome-free route duplicate markup.

---

## Out of scope / defer

- **Full hero** animation stack (aurora, scanline, SVG stage)—wrong surface for login; conflicts with focus and perf (research §3.4 mobile stripping).  
- Re-enabling **global nav/footer** on login unless product asks for full-site chrome on auth routes.

---

## Verification checklist

- [x] No hard-coded `#050913` where **`--mss-bg-base`** + frosted header suffice.  
- [x] Touch targets ≥44px where possible; **`prefers-reduced-motion`** respected on any transitions.  
- [x] Single **`h1`** (`id="portal-heading"`); **`section`** uses **`aria-labelledby="portal-heading"`**; form **`h2`** keeps **`id="login-heading"`** for the auth card heading.  
- [x] Contrast: orange/italic accents still meet WCAG on dark backgrounds.  
- [x] Visual spot-check against Home hero / About atmosphere at **desktop + 640px**.
