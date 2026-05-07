# GTFS Feed Health Dashboard

A React + TypeScript tool for validating GTFS Schedule feeds and surfacing data quality issues — the kind of thing a transit data pipeline team needs to monitor day to day.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:5173, drop in a GTFS `.zip` file, and the dashboard will parse and validate it in the browser.

## Where to get a GTFS feed

- **STM Montreal**: https://www.stm.info/en/about/developers
- **Transitfeeds**: https://transitfeeds.com
- **Mobility Database**: https://mobilitydatabase.org

## Validation checks

| Check | Severity | What it catches |
|---|---|---|
| Feed expiry | Critical / Warning | Calendar entries expired or expiring within 30 days |
| Trips with no stop times | Critical | Trips in trips.txt with zero entries in stop_times.txt |
| Stops with no trips | Warning / Info | Stops not visited by any trip |
| Out-of-sequence stop times | Critical | Trips where departure times go backwards |
| Missing shapes | Warning | Trips referencing a shape_id not in shapes.txt |
| Routes with no trips | Warning | Routes with no corresponding trips |

## Project structure

```
src/
  types/gtfs.ts          # TypeScript interfaces for all GTFS files
  utils/parser.ts        # ZIP parsing + CSV ingestion (JSZip + PapaParse)
  validators/checks.ts   # All validation logic — add new checks here
  hooks/useFeed.ts       # State management for loading / validating a feed
  components/
    FeedDropzone.tsx     # Drag-and-drop file input
    FeedSummary.tsx      # Agency name + row count stats
    ValidationCard.tsx   # Expandable result card per check
  App.tsx                # Top-level layout
  styles.css             # Dark-mode dashboard styles
```

## Adding a new check

All checks live in `src/validators/checks.ts` and return a `ValidationResult`. To add one:

1. Write a function `checkSomething(feed: GTFSFeed): ValidationResult`
2. Add it to the array returned by `runAllValidations()`

The dashboard picks it up automatically.

## Stack

- **Vite** — build tool
- **React 18 + TypeScript**
- **PapaParse** — CSV parsing
- **JSZip** — ZIP extraction (fully client-side, no server needed)
