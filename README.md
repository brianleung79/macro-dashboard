# VectorStrat Macro Economic Dashboard

A modern web application for analyzing macroeconomic variables using FRED and Alpha Vantage data. Built with React, TypeScript, Vite, and Plotly.js.

## Features

- **5-Chart Dashboard**: Time series, ratio/spread analysis (x2), rolling correlations, rolling statistics
- **116+ Variables**: Interest rates, inflation, GDP, employment, housing, commodities, currencies, equity factors, sector ETFs
- **Interactive Charts**: Zoom, pan, hover tooltips via Plotly.js
- **Configurable**: Date ranges with quick presets, rolling window sizes, ratio vs. spread modes

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
```

## Environment Variables

Set these in your Vercel dashboard (not in frontend code):

| Variable | Description |
|----------|-------------|
| `FRED_API_KEY` | [Get free key](https://fred.stlouisfed.org/docs/api/api_key.html) |
| `ALPHA_VANTAGE_API_KEY` | [Get free key](https://www.alphavantage.co/support/#api-key) (optional) |

See `.env.example` for reference.

## Tech Stack

- **Frontend**: React 18, TypeScript 5.4, Vite 5, Tailwind CSS 3.4, Plotly.js
- **Backend**: Vercel serverless functions (API proxy)
- **Data**: FRED API (56 series) + Alpha Vantage (60+ ETFs)

## Adding Variables

Add rows to `public/FRED_DATA.csv` — variables are auto-categorized by name. No code changes needed.

## Development Plan

See [PLAN.md](PLAN.md) for the full roadmap and progress.
