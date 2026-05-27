# Data Model

The dashboard consumes three CSV files from `public/`. All files are fetched at runtime — replace them with your own data, keeping column names exactly as documented here.

`summary` and `detail` both join to `library` using the surrogate key `metric_id + datestamp`.

---

## Tables

### `public/library.csv`

Metric metadata. One row per **metric × reporting period**. Because thresholds and weights can change between periods, each `metric_id + datestamp` pair is an independent version of a metric's definition.

| Column      | Type          | Description                                      |
| ----------- | ------------- | ------------------------------------------------ |
| `datestamp` | varchar       | Reporting period in `YYYY-MM-DD` format          |
| `metric_id` | varchar       | Unique identifier for the metric, e.g. `AA01`   |
| `category`  | varchar       | Category grouping related metrics                |
| `title`     | varchar       | Human-readable metric title shown in the UI      |
| `slo`       | decimal(5,4)  | Target compliance threshold (0–1), e.g. `0.9`   |
| `slo_min`   | decimal(5,4)  | Minimum acceptable threshold (0–1), e.g. `0.8`  |
| `weight`    | decimal(10,4) | Relative weighting for aggregate/category scores |

**Primary key:** `metric_id + datestamp`

---

### `public/summary.csv`

Aggregated compliance counts. One row per **metric × dimension cohort × reporting period**. Joins to `library` on `metric_id + datestamp`.

| Column          | Type    | Description                                     |
| --------------- | ------- | ----------------------------------------------- |
| `datestamp`     | varchar | Reporting period in `YYYY-MM-DD` format         |
| `metric_id`     | varchar | Foreign key → `library.metric_id + datestamp`  |
| `business_unit` | varchar | Business unit dimension; drives the BU filter   |
| `team`          | varchar | Team dimension; drives the Team filter          |
| `location`      | varchar | Location dimension; drives the Location filter  |
| `totalok`       | float   | Sum of compliant scores in this cohort          |
| `total`         | integer | Total number of items evaluated in this cohort  |

Score for a cohort = `totalok / total`. Weighted organisational scores are derived using `library.weight` for the matching `metric_id + datestamp`.

---

### `public/detail.csv`

Per-resource evidence. One row per **individual resource** for a given metric. This table holds only the **latest** snapshot for each `metric_id` — it does not accumulate history.

| Column          | Type         | Description                                                  |
| --------------- | ------------ | ------------------------------------------------------------ |
| `datestamp`     | varchar      | Reporting period in `YYYY-MM-DD` format                     |
| `metric_id`     | varchar      | Foreign key → `library.metric_id + datestamp`               |
| `business_unit` | varchar      | Must match values in `summary.csv` so filters apply         |
| `team`          | varchar      | As above                                                     |
| `location`      | varchar      | As above                                                     |
| `resource`      | varchar      | The specific item evaluated, e.g. a hostname or username     |
| `compliance`    | float        | Compliance score (0–1): `1.0` = compliant, `0.0` = not      |
| `detail`        | text         | Optional free-text note explaining the result                |

The sum of `compliance` values for a given `metric_id + datestamp + cohort` should equal `totalok` in `summary.csv`, and the row count should equal `total`.

---

## Load / Upsert Logic

### Determining the datestamp

When a metric is uploaded, the `datestamp` is resolved as follows:

1. If the incoming data includes a `datestamp` value, use it.
2. If no `datestamp` is provided, default to **today's date** in `YYYY-MM-DD` format.

---

### `library` and `summary` — versioned history

Both tables grow over time. Each `metric_id + datestamp` pair represents a distinct version of that metric for that period.

**On upload for a given `metric_id + datestamp`:**

1. Delete all existing rows where `metric_id` and `datestamp` match the incoming data.
2. Insert the new rows.

This replaces any previously uploaded data for that period while preserving all other periods intact. Metric definitions (SLO, weight, category) and their corresponding aggregates may therefore differ between periods.

---

### `detail` — latest snapshot only

The `detail` table does **not** accumulate history. It always holds the most recent snapshot for each `metric_id`.

**On upload for a given `metric_id`:**

1. Find the current maximum `datestamp` stored in `detail` for that `metric_id`.
2. Compare it to the incoming `datestamp`:
   - If the incoming `datestamp` is **equal to or greater than** the stored maximum → proceed.
   - If the incoming `datestamp` is **older than** the stored maximum → **abort**; do not modify the table.
3. Delete all existing rows for that `metric_id`.
4. Insert the new rows.

This ensures that a late-arriving or re-processed older dataset never overwrites fresher data.
