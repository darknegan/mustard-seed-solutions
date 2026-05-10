# Changelog

All notable changes to this project will be documented in this file.

The format is based on [**Keep a Changelog**](https://keepachangelog.com/en/1.1.0/), and this project adheres to [**Semantic Versioning**](https://semver.org/spec/v2.0.0.html).

### Types of changes

Entries are grouped under the headings defined on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/):

| Heading | Meaning |
| --- | --- |
| **Added** | New features |
| **Changed** | Changes in existing behavior or documentation |
| **Deprecated** | Soon-to-be removed features |
| **Removed** | Removed features |
| **Fixed** | Bug fixes |
| **Security** | Vulnerability fixes or hardening |

Release notes should list changes **newest first** within each section. **Omit any heading** that has nothing to report for that release.

---

## [Unreleased]

### Added

- **Client dashboard portal** at `/dashboard`: lazy-loaded authenticated shell (`requireAuthGuard` + `canActivateChild`), chrome-free app layout (`hideChrome`), sidebar navigation, sticky main header, mobile top bar + slide-down menu + bottom tab bar, and nested routes for **Overview**, **My Documents**, **Request a Change**, and **Report an Issue**.
- **`dashboard-seeded-example.ts`** (`src/app/shared/dashboard/`): centralized demo datasets for overview stats, activity timeline, and documents; **`emailShowsDashboardSeededExample()`** gates seeded UI vs empty-state copy for non-demo accounts (demo email: `drakedavisdev@gmail.com`).
- **Portal styling** in `dashboard-page.scss` (shell **`ViewEncapsulation.None`**): card system, page atmospheres, overview stats/activity/next-steps panels, documents folder/file UI, shared form + help-aside layout for change/issue flows, empty states, and **`dashboard__mobile-status--neutral`** for non-demo overview/documents pills on small screens.
- **Reactive forms** on Request a Change and Report an Issue (typed **`NonNullableFormBuilder`**, validation messages, PrimeNG submit **`p-button`**); success banners use **`setTimeout`** stubs until APIs exist.
- **Design tokens** in `src/styles.scss`: **`--mss-success-*`** (live-status pills), **`--mss-violet` / `--mss-violet-strong` / `--mss-glow-violet`**, and **`--mss-rail-active`** for accent rails and icons used by the portal.
- **`server/.env.example`**: template for `PORT`, `JWT_SECRET`, `SUPABASE_URL` (Project URL-only guidance), and `SUPABASE_SERVICE_ROLE_KEY`.
- **`docs/research.md`**: portal coverage in the title/intro; **§4.10 Client dashboard portal** (routing and `portalTitle`/`portalGreeting` data, shell DOM, scrolling/viewport coupling with `App`, shared visuals, Overview / forms pages, seeded vs empty data, responsive chrome, integration gaps); **§1** route map and **§11** file index updated for dashboard paths.
- **`docs/plans/dashboard.plan.md`**: dashboard implementation / planning notes (local plan artifact).

### Changed

- **`server/src/config/env.ts`**: trim `SUPABASE_URL` and service-role key; **`validateSupabaseProjectUrl()`** on startup — rejects URLs that look like the Supabase dashboard or main marketing site (path contains `/dashboard`, or host `app.supabase.com` / `supabase.com`), with actionable error text.
- **`server/src/config/supabase.ts`**: **`createClient`** uses **`env.supabaseUrl`** and **`env.supabaseServiceRoleKey`** from **`env.ts`** (aligned with trimmed values).

### Fixed

- **Misconfigured `SUPABASE_URL`** no longer fails silently with HTML blobs in API error messages: validation catches common wrong URLs before the JS client runs; `.env.example` documents using the API Project URL (`https://<ref>.supabase.co`).

---

## [0.0.0] - 2026-05-09

### Added

- This **`CHANGELOG.md`** file.
