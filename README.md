# cyber-dashboard
React dashboard built with [Vite](https://vite.dev/).

You can see the resulting dashboard on [https://cyber-dashboard.pages.dev/](https://cyber-dashboard.pages.dev/) - [![Publish](https://github.com/massyn/cyber-dashboard/actions/workflows/blank.yml/badge.svg?branch=main)](https://github.com/massyn/cyber-dashboard/actions/workflows/blank.yml)

## Getting started

Install dependencies (first time only):

```bash
npm ci
```

## Available scripts

### `npm run dev`

Starts the development server. Open [http://localhost:5173](http://localhost:5173) to view the app in your browser.

The page reloads automatically when you make changes.

### `npm test`

Runs the test suite once via Vitest.

### `npm run build`

Builds the app for production into the `dist/` folder. Output is minified and filenames include content hashes.

### `npm run preview`

Serves the production build locally so you can verify it before deploying.

---

## Data model

See [datamodel.md](datamodel.md) for the full schema (`library.csv`, `summary.csv`, `detail.csv`).

---

## Loading a metric

Use `public/load_metric.py` to import metric data from a CSV file. The script merges the data into `detail.csv`, `summary.csv`, and `library.csv`.

```bash
python3 ./load_metric.py -id CC04 -csv dummy.csv -date 2026-04-24 -title "Hello" -category Alpha
```

### Required arguments

| Argument | Description |
|----------|-------------|
| `-id`    | Unique metric identifier (e.g. `CC04`) |
| `-csv`   | Path to the input CSV file containing resource-level compliance data |

### Optional arguments

| Argument    | Default      | Description |
|-------------|--------------|-------------|
| `-date`     | Today        | Date stamp for this data load (`YYYY-MM-DD`) |
| `-title`    | Same as `-id` | Human-readable metric title |
| `-category` | `Default`    | Category grouping for the metric |
| `-weight`   | `1`          | Metric weight used in scoring |
| `-slo`      | `0.95`       | Target SLO threshold |
| `-slomin`   | `0.90`       | Minimum acceptable SLO threshold |

### Input CSV format

The input CSV must be placed in the `public/` directory and contain the following columns:

| Column          | Required | Description |
|-----------------|----------|-------------|
| `resource`      | Yes      | Resource identifier |
| `compliance`    | Yes      | Compliance value (`0.0` = non-compliant, `1.0` = compliant) |
| `detail`        | No       | Free-text detail about the resource state |
| `business_unit` | No       | Business unit (defaults to `unknown`) |
| `team`          | No       | Team name (defaults to `unknown`) |
| `location`      | No       | Location (defaults to `unknown`) |
| `datestamp`     | No       | Overrides `-date` per row if present |
