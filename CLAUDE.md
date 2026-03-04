# Macro Dashboard — Claude Code Instructions

## Project Overview

VectorStrat Macro Economic Dashboard — a React + TypeScript web app for analyzing macroeconomic data using FRED and Alpha Vantage APIs, deployed on Vercel.

## Plan

See **PLAN.md** for the full improvement plan with phase-by-phase tasks and checkboxes. Update PLAN.md as tasks are completed (check off items, update session log).

## Tech Stack

- **Frontend**: React 18, TypeScript 5.4, Vite 5, Tailwind CSS 3.4, Plotly.js
- **Backend**: Vercel serverless functions (`api/` directory)
- **Data**: FRED API, Alpha Vantage API
- **Hosting**: Vercel (auto-deploys from GitHub)

## Key Files

- `src/App.tsx` — main orchestrator (needs refactoring, see Phase 2)
- `src/components/DashboardControls.tsx` — largest component (608 lines, needs dedup)
- `src/components/ChartDisplay.tsx` — Plotly chart rendering
- `src/services/fredService.ts` — FRED API client + calculation functions
- `src/services/alphaVantageService.ts` — Alpha Vantage ETF data
- `src/utils/dataLoader.ts` — CSV + ETF variable loading
- `src/types/index.ts` — TypeScript interfaces
- `api/fred/[seriesId].js` — Vercel serverless proxy for FRED API
- `FRED_DATA.csv` — economic indicator definitions (in `public/`)

## Development

```bash
npm run dev      # Vite dev server on port 3000
npm run build    # TypeScript check + Vite production build
npm run preview  # Preview production build locally
```

## Environment Variables

Server-side (set in Vercel dashboard, NOT in frontend code):
- `FRED_API_KEY` — FRED API key (required for `/api/fred/*` endpoints)
- `ALPHA_VANTAGE_API_KEY` — Alpha Vantage key (for ETF data, optional for now)

See `.env.example` for reference.

## Conventions

- All FRED/Alpha Vantage API calls go through serverless proxies in `api/` — never expose API keys in frontend code
- Use Vite env vars (`import.meta.env.VITE_*`) for any frontend config, not `process.env`
- Config files use `.cjs` extension (ESM project with `"type": "module"`)
- Commit after completing each phase or significant batch of changes
- Keep `PLAN.md` updated with progress after each session

## Known Issues (to fix in Phase 2)

- `(window as any).tempVar1` anti-pattern in DashboardControls.tsx
- Duplicate `setChartData` call in App.tsx
- Date presets hardcoded to 2024-01-01
- 60+ debug console.log statements throughout codebase
- Duplicate TimeSeriesData interface between fredService and alphaVantageService
