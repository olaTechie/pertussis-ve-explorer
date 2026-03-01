# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React SPA for exploring pertussis vaccine effectiveness (VE) data from a systematic review of 6 clinical studies. All study data is embedded as TypeScript constants (not fetched from an API). Deployed to GitHub Pages at `https://olatechie.github.io/pertussis-ve-explorer/`.

## Commands

- **Build:** `npm run build` (runs `tsc -b && vite build`, output in `dist/`)
- **Dev server:** `npm run dev` (Vite on port 5173)
- **Lint:** `npm run lint` (ESLint)
- **Test all:** `npx vitest run`
- **Test single file:** `npx vitest run src/test/data.test.ts`
- **Test watch:** `npx vitest`
- **Preview build:** `npm run preview`

## Architecture

### Data Layer (`src/data/studies.ts`)

All data lives in a single file as typed arrays. No backend. Data source: `Corrected_DataExtraction_Complete.xlsx`.

Four exported constants:
- `STUDIES` — 6 study records (Ward2005, Baxter2013, Bell2019, Liu2020, Witt2013, Crowcroft2021)
- `VE_ESTIMATES` — 28 VE point estimates with CIs, stratified by time/age/sensitivity
- `WANING_DATA` — time-series VE points for the waning line chart
- `ROB_DATA` — per-domain risk-of-bias assessments (RoB 2.0 for RCT, ROBINS-I for observational)

Helper functions: `getStudy()`, `getEstimatesForStudy()`, `getWaningForStudy()`, `getRoBForStudy()`.

### Routing (`src/App.tsx`)

BrowserRouter with `basename="/pertussis-ve-explorer"` (required for GitHub Pages subpath).

- `/` → redirects to `/studies`
- `/studies` → study cards grid
- `/studies/:id` → individual study detail (VE table, RoB domains, waning chart)
- `/forest-plot` → D3 forest plot with study/subgroup filters
- `/data/:section` → tabbed data explorer (8 sections mirroring Excel sheets)

### Visualization Components

- `ForestPlot.tsx` — D3 SVG forest plot (diamond markers, CI whiskers, click-to-navigate)
- `WaningChart.tsx` — D3 line chart with CI shading, grouped by `studyId-series` key. Series colors defined in `SERIES_COLORS` map — must match `series` values in `WANING_DATA`.

### Layout

- `Sidebar.tsx` — left nav (220px fixed), collapsible on mobile, lists all studies with RoB-colored dots
- `Header.tsx` — navy top bar with hamburger menu for mobile

### UI Primitives (`src/components/ui/`)

shadcn/ui components (card, badge, button, tabs, tooltip, separator). Style config in `components.json` using "new-york" variant. Class merging utility: `cn()` from `src/lib/utils.ts`.

### Types (`src/types/index.ts`)

Core interfaces: `Study`, `VEEstimate`, `WaningPoint`, `RoBDomain`. Union types: `RoBJudgement`, `StudyDesign`, `RoBTool`.

## Styling

Tailwind CSS with custom design tokens in `tailwind.config.ts`:
- **Navy palette:** `navy` (#1F4E79), `navy-mid` (#2E75B6), `navy-light` (#DEEAF1)
- **RoB colors:** `rob-low` (green), `rob-some` (yellow), `rob-moderate` (orange), `rob-serious` (red); Critical uses `red-900`
- Font: Inter (loaded from Google Fonts in `index.css`)

## Key Conventions

- VE estimate IDs follow a per-study scheme: `W-VE01` (Ward), `B-VE01` (Baxter), `Be-FC1` (Bell full cohort), `L-VE02` (Liu), `C-F1` (Crowcroft FMD)
- Witt2013 has no VE estimates (reports RR only, narrative synthesis)
- Crowcroft2021 FMD design is preferred for synthesis over TND
- Unicode characters in JSX text must use HTML entities (`&ndash;`) or JS expressions (`{'\u2013'}`), not raw `\u2013` escapes
- `DataTable.tsx` is a generic reusable component with sort, search, and CSV export

## Deployment

GitHub Actions workflow (`.github/workflows/deploy.yml`) auto-deploys on push to `main`. Builds with Node 20, uploads `dist/` as Pages artifact.
