# VectorStrat Macro Economic Dashboard — Improvement Plan

## Context

This is a macroeconomic analysis dashboard for visualizing FRED and Alpha Vantage data. Originally built with Cursor + older Claude model using Create React App. Now being modernized and expanded.

- **Repo**: https://github.com/brianleung79/macro-dashboard.git
- **Hosting**: Vercel (serverless functions + static frontend)
- **Stack**: React 18, TypeScript 5.4, Vite 5, Tailwind CSS 3.4, Plotly.js
- **Data sources**: FRED API (56 series), Alpha Vantage (60+ ETFs)

---

## Phase 0: Project Migration — DONE

- [x] Move from `C:\Users\brian\Projects\Macro` → `C:\Users\brian\Dropbox\AI\coding\macro-dashboard`
- [x] Verify git remote preserved (`brianleung79/macro-dashboard`)
- [x] npm install and verify site loads

---

## Phase 1: Security Fix + Tech Stack Modernization — DONE

### 1A. Remove Hardcoded API Key — DONE
- [x] Remove FRED API key `abf2178d3c7946daaddfb379a2567750` from `api/fred/[seriesId].js` (was on lines 56, 97)
- [x] Replace with `process.env.FRED_API_KEY` + add missing-key check
- [x] Remove key + CORS proxy fallback from `src/services/fredService.ts`
- [x] Create `.env.example` documenting required env vars
- [ ] **USER ACTION**: Rotate FRED API key (old one is in git history) and set `FRED_API_KEY` in Vercel dashboard

### 1B. Migrate CRA → Vite — DONE
- [x] Create `vite.config.ts` with React plugin, `/api` proxy, port 3000
- [x] Move `public/index.html` → root `index.html` with `<script type="module" src="/src/index.tsx">`
- [x] Create `src/vite-env.d.ts`
- [x] Update `tsconfig.json` (target ES2020, moduleResolution bundler, vite/client types)
- [x] Replace `react-scripts` with `vite` + `@vitejs/plugin-react`
- [x] Rename env vars: `REACT_APP_*` → `VITE_*` (alphaVantageService.ts)
- [x] Update `vercel.json` (framework: vite, outputDirectory: dist)
- [x] Rename `postcss.config.js` → `.cjs`, `tailwind.config.js` → `.cjs` (ESM compat)

### 1C. Upgrade Dependencies — DONE
- [x] TypeScript 4.9 → 5.4
- [x] Tailwind CSS 3.3 → 3.4
- [x] date-fns v2 → v3
- [x] Move `@types/*`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer` to devDependencies
- [x] Remove `express`, `cors`, `react-scripts` from dependencies

### 1D. Delete Legacy Files — DONE
- [x] `server.js`, `server-simple.js`, `cors-proxy.js`, `server-package.json`, `setup-api-key.js`
- [x] `test-*.js` and `test-*.html` files (8 files)
- [x] `src/components/VariableSelector.tsx` (unused, not imported anywhere)
- [x] `ALPHA_VANTAGE_UPDATE.md`, `DEPLOYMENT.md`, `VERCEL_SETUP.md` (outdated docs)

---

## Phase 2: Architecture Improvements — PENDING

### 2A. Unify Type System
- [ ] Rename Alpha Vantage's `TimeSeriesData` → `OHLCVData` in `src/services/alphaVantageService.ts`
- [ ] Add `source: 'fred' | 'alphavantage'` field to `MacroVariable` in `src/types/index.ts`
- [ ] Export all shared types from `src/types/index.ts` consistently

### 2B. Extract State Management
- [ ] Create `src/context/DashboardContext.tsx` — useReducer replacing 64 lines of useState in App.tsx
- [ ] Create `src/hooks/useDashboardAnalysis.ts` — extract 230-line `runDashboardAnalysis`
- [ ] Create `src/hooks/useDataLoader.ts` — extract variable loading + availability checking
- [ ] Simplify `src/App.tsx` from ~484 lines → ~50 lines

### 2C. Fix Anti-Patterns
- [ ] Replace `(window as any).tempVar1` in `DashboardControls.tsx` (lines 439, 451) with React state
- [ ] Fix duplicate `setChartData` call in `App.tsx` (line 374 overwrites line 359)
- [ ] Fix hardcoded date presets ending at `2024-01-01` → dynamic `new Date()`

### 2D. Deduplicate Components
- [ ] Create `src/components/RatioSpreadChartConfig.tsx` — Charts 2 & 3 are identical (~180 lines each)
- [ ] Create `src/components/TimeframeSelector.tsx` — reusable date range + presets
- [ ] Create `src/components/VariableDropdown.tsx` — reusable grouped dropdown
- [ ] Create `src/utils/categoryClassifier.ts` — consolidate duplicate category logic from `DashboardControls.tsx` (lines 90-123) and `dataLoader.ts` (lines 109-174)
- [ ] Reduce `DashboardControls.tsx` from 608 → ~200 lines

### 2E. Clean Up Debug Logging
- [ ] Remove 60+ `console.log` debug statements across all source files
- [ ] Remove duplicate `setChartData` call and `setTimeout` debug check in App.tsx
- [ ] Remove debug `useEffect` hooks in App.tsx, ChartDisplay.tsx, DashboardDisplay.tsx
- [ ] Remove "Force new deployment" comments in App.tsx
- [ ] Keep genuine `console.error` for real error paths only

---

## Phase 3: Feature Improvements — PENDING

### 3A. Data Caching
- [ ] Create `src/services/cacheService.ts` — in-memory + sessionStorage
- [ ] FRED data cached 1 hour, Alpha Vantage 15 minutes
- [ ] Cache key format: `{source}:{ticker}:{start}:{end}`
- [ ] Add cache status indicator in UI

### 3B. Frequency Resampling
- [ ] Create `src/utils/resampling.ts` — resample daily→monthly when mixing data sources
- [ ] Currently `ChartDisplay.tsx` detects mismatch but returns data unchanged (line 127: "return original data")
- [ ] Show indicator when resampling is applied

### 3C. Error Handling
- [ ] Create `src/components/ErrorBoundary.tsx` wrapping each chart independently
- [ ] Change `Promise.all` → `Promise.allSettled` in `fetchMultipleTimeSeries` for partial success
- [ ] Add retry buttons per chart
- [ ] Add toast/notification system for non-blocking errors

### 3D. Alpha Vantage API Key Security
- [ ] Create `api/alphavantage/[symbol].js` serverless proxy (keep key server-side)
- [ ] Update `alphaVantageService.ts` to call `/api/alphavantage/{symbol}` instead of AV directly
- [ ] Remove `VITE_ALPHA_VANTAGE_API_KEY` from frontend env vars

### 3E. Responsive Design
- [ ] Collapsible/accordion controls panel for mobile
- [ ] Responsive chart sizing (replace fixed `h-96`)
- [ ] Mobile-friendly chart navigation (tabs between charts)

---

## Phase 4: New Features — PENDING

### 4A. Saved Dashboard Layouts
- [ ] Create `src/services/layoutService.ts` — serialize/deserialize config to localStorage
- [ ] Create `src/components/LayoutManager.tsx` — save/load/reset UI
- [ ] Support URL-encoded layout sharing (base64 config in URL hash)

### 4B. Data Export
- [ ] CSV download button per chart (formatted with proper headers)
- [ ] PNG export per chart (via Plotly `toImage`)
- [ ] Create `src/utils/exportService.ts`

### 4C. Additional Analysis Types
- [ ] Z-score normalization option for Chart 1
- [ ] Percentage change mode for Chart 1
- [ ] Bollinger Bands for Chart 5 (rolling mean ± 2 std dev)
- [ ] Drawdown calculation for Chart 5
- [ ] Log scale toggle for all charts

### 4D. Configurable Chart Grid
- [ ] Show/hide individual charts
- [ ] 1-column or 2-column layout toggle
- [ ] Drag-to-reorder charts

---

## Phase 5: Testing & Deployment — PENDING

### 5A. Unit Tests (Vitest + React Testing Library)
- [ ] Test calculation functions: `calculateRatio`, `calculateSpread`, `calculateRollingCorrelation`, `calculateRollingStatistics`
- [ ] Test Alpha Vantage: `calculateReturns`, `calculateRollingVolatility`
- [ ] Test category classification, resampling, cache service
- [ ] Test components: loading/error/data states
- [ ] Test serverless function `api/fred/[seriesId].js` (mock axios)

### 5B. CI/CD
- [ ] Create `.github/workflows/ci.yml` — lint, test, build on push/PR

### 5C. Verify Vercel Deployment
- [ ] Confirm Vite build works on Vercel
- [ ] Set env vars in Vercel dashboard: `FRED_API_KEY`, `ALPHA_VANTAGE_API_KEY`
- [ ] Test on preview branch before merging to master

---

## Target File Structure

```
macro-dashboard/
  api/
    fred/[seriesId].js
    alphavantage/[symbol].js    (Phase 3D)
    health.js
  src/
    components/
      ChartDisplay.tsx
      DashboardControls.tsx      (refactored ~200 lines)
      DashboardDisplay.tsx
      ErrorBoundary.tsx          (Phase 3C)
      Header.tsx
      LayoutManager.tsx          (Phase 4A)
      RatioSpreadChartConfig.tsx (Phase 2D)
      TimeframeSelector.tsx      (Phase 2D)
      Toast.tsx                  (Phase 3C)
      VariableDropdown.tsx       (Phase 2D)
    context/
      DashboardContext.tsx       (Phase 2B)
    hooks/
      useDashboardAnalysis.ts   (Phase 2B)
      useDataLoader.ts          (Phase 2B)
    services/
      alphaVantageService.ts
      cacheService.ts           (Phase 3A)
      fredService.ts
      layoutService.ts          (Phase 4A)
    types/
      index.ts
    utils/
      categoryClassifier.ts     (Phase 2D)
      dataLoader.ts
      exportService.ts          (Phase 4B)
      resampling.ts             (Phase 3B)
    App.tsx                      (~50 lines after Phase 2B)
    index.css
    index.tsx
    vite-env.d.ts
  index.html
  vite.config.ts
  vitest.config.ts              (Phase 5A)
  vercel.json
  package.json
  tsconfig.json
  tailwind.config.cjs
  postcss.config.cjs
  .env.example
  .github/workflows/ci.yml     (Phase 5B)
  FRED_DATA.csv
  CLAUDE.md
  PLAN.md
  README.md
```

---

## Session Log

### Session 1 (2026-03-04)
- Completed Phase 0 + Phase 1
- Migrated project to Dropbox, removed hardcoded API keys, migrated CRA→Vite, upgraded deps, deleted 19 legacy files
- Commit: `7fb5654` — pushed to origin/master
