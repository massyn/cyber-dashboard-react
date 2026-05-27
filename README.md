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

## Data files

Both files live in `public/` and are fetched at runtime. Replace them with your own data — column names must match exactly.

### `public/summary.csv`

One row per **metric × dimension cohort × reporting period**. Each row represents the aggregated compliance count for a specific slice of the population (e.g. the Marketing / Advertising / Sydney team for metric AA01 in January 2023).

| Column | Type | Description |
|---|---|---|
| `datestamp` | string | Reporting period, e.g. `2023-01`. Used as the x-axis on trend charts. |
| `metric_id` | string | Unique identifier for the metric, e.g. `AA01`. Links to `detail.csv`. |
| `category` | string | Category that groups related metrics, e.g. `Vulnerability Management`. |
| `title` | string | Human-readable metric name shown in the UI. |
| `slo` | decimal | Target compliance threshold (0–1), e.g. `0.9` = 90%. |
| `slo_min` | decimal | Minimum acceptable threshold (0–1), e.g. `0.8` = 80%. |
| `weight` | decimal | Relative weight used when calculating aggregated/category scores. |
| `business_unit` | string | Business unit dimension. Drives the Business Unit filter. |
| `team` | string | Team dimension. Drives the Team filter. |
| `location` | string | Location dimension. Drives the Location filter. |
| `totalok` | integer | Number of compliant items in this cohort for this period. |
| `total` | integer | Total number of items in this cohort for this period. |

Score for a cohort = `totalok / total`. The weighted organisational score rolls these up using `weight`.

---

### `public/detail.csv`

One row per **individual resource** for a given metric and reporting period. This is the raw evidence that explains the numbers in `summary.csv` — e.g. each device, user account, or finding that was evaluated.

| Column | Type | Description |
|---|---|---|
| `datestamp` | string | Reporting period. Must match values used in `summary.csv`. |
| `metric_id` | string | Links this record back to a metric in `summary.csv`. |
| `business_unit` | string | Must match the values used in `summary.csv` so filters apply consistently. |
| `team` | string | As above. |
| `location` | string | As above. |
| `resource` | string | The specific item being measured, e.g. a hostname, username, or account name. |
| `compliant` | float | Compliance score for this resource (0–1), e.g. `1.0` = fully compliant, `0.0` = non-compliant, or a partial value such as `0.75`. |
| `detail` | string | Optional free-text note explaining the result, e.g. a reason for non-compliance. |

The sum of `compliant` values for a given `metric_id` + `datestamp` + dimension cohort should equal `totalok` in `summary.csv`, and the row count should equal `total`.
