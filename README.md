# cyber-dashboard
React dashboard built with [Vite](https://vite.dev/).

You can see the resulting dashboard on [https://cyber-dashboard.pages.dev/](https://cyber-dashboard.pages.dev/) - [![Publish](https://github.com/massyn/cyber-dashboard-react/actions/workflows/publish.yml/badge.svg?branch=main)](https://github.com/massyn/cyber-dashboard-react/actions/workflows/publish.yml)

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

### `npm run lint`

Checks the code with ESLint.

### `npm run build`

Builds the app for production into the `dist/` folder. Output is minified and filenames include content hashes.

### `npm run preview`

Serves the production build locally so you can verify it before deploying.

---

## Data model

See [datamodel.md](datamodel.md) for the full schema (`library.csv`, `summary.csv`, `detail.csv`).

---

## Loading a metric

Use `tools/load_metric.py` to import metric data from a CSV file. The script merges the data into `public/library.csv`, `public/summary.csv` and `public/detail.csv`, following the upsert rules in [datamodel.md](datamodel.md).

```bash
cd tools
pip install -r requirements.txt
python load_metric.py -id CC04 -csv dummy.csv -date 2026-04-24 -title "Hello" -category Alpha
```

To write somewhere other than `public/`, set `CYBER_DASHBOARD_DATA_DIR` (in the environment or a `.env` file).

To regenerate the sample data set, run `python generate_dummy.py` from `tools/`. Tests for the loader run with `pip install -r requirements-dev.txt` then `pytest`.

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

The input CSV can live anywhere and must contain the following columns:

| Column          | Required | Description |
|-----------------|----------|-------------|
| `resource`      | Yes      | Resource identifier |
| `compliance`    | Yes      | Compliance value (`0.0` = non-compliant, `1.0` = compliant) |
| `detail`        | No       | Free-text detail about the resource state |
| `business_unit` | No       | Business unit (defaults to `unknown`) |
| `team`          | No       | Team name (defaults to `unknown`) |
| `location`      | No       | Location (defaults to `unknown`) |
| `datestamp`     | No       | Overrides `-date` per row if present |
