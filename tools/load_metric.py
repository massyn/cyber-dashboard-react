"""Load resource-level compliance evidence for one metric into the dashboard CSVs.

Implements the upsert rules in datamodel.md:
- library and summary keep history: rows for the same metric_id + datestamp are replaced.
- detail keeps only the latest snapshot per metric_id; older loads are skipped.
"""

from __future__ import annotations

import argparse
import csv
import logging
import os
import tempfile
from collections import defaultdict
from datetime import date
from pathlib import Path

from dotenv import load_dotenv

logger = logging.getLogger(__name__)

LIBRARY_COLUMNS = ["datestamp", "metric_id", "category", "title", "slo", "slo_min", "weight"]
SUMMARY_COLUMNS = ["datestamp", "metric_id", "business_unit", "team", "location", "totalok", "total"]
DETAIL_COLUMNS = [
    "datestamp",
    "metric_id",
    "business_unit",
    "team",
    "location",
    "resource",
    "compliance",
    "detail",
]
COHORT_COLUMNS = ["business_unit", "team", "location"]
DEFAULT_DIMENSION = "unknown"
DEFAULT_DATA_DIR = Path(__file__).resolve().parent.parent / "public"


def data_dir() -> Path:
    """Folder holding library.csv, summary.csv and detail.csv (env CYBER_DASHBOARD_DATA_DIR)."""
    return Path(os.getenv("CYBER_DASHBOARD_DATA_DIR", DEFAULT_DATA_DIR))


def read_rows(path: Path) -> list[dict]:
    if not path.exists():
        return []
    with path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def write_rows(path: Path, columns: list[str], rows: list[dict]) -> None:
    """Write atomically so a failed load never leaves a half-written file behind."""
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=path.parent, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore", lineterminator="\n")
            writer.writeheader()
            writer.writerows(rows)
        os.replace(tmp, path)
    except BaseException:
        os.unlink(tmp)
        raise


def normalise_evidence(evidence: list[dict], metric_id: str, default_datestamp: str) -> list[dict]:
    rows = []
    for i, item in enumerate(evidence, start=1):
        resource = (item.get("resource") or "").strip()
        if not resource:
            raise ValueError(f"Evidence row {i} has no resource")
        try:
            compliance = float(item["compliance"])
        except (KeyError, TypeError, ValueError) as e:
            raise ValueError(f"Evidence row {i} ({resource}) has no valid compliance value") from e
        if not 0.0 <= compliance <= 1.0:
            raise ValueError(f"Evidence row {i} ({resource}) compliance {compliance} is outside 0-1")
        row = {
            "datestamp": item.get("datestamp") or default_datestamp,
            "metric_id": metric_id,
            "resource": resource,
            "compliance": compliance,
            "detail": item.get("detail") or "",
        }
        for column in COHORT_COLUMNS:
            row[column] = item.get(column) or DEFAULT_DIMENSION
        rows.append(row)
    return rows


def summarise(evidence: list[dict]) -> list[dict]:
    cohorts: dict[tuple, dict] = defaultdict(lambda: {"totalok": 0.0, "total": 0})
    for row in evidence:
        key = tuple(row[c] for c in ["datestamp", "metric_id", *COHORT_COLUMNS])
        cohorts[key]["totalok"] += row["compliance"]
        cohorts[key]["total"] += 1
    return [
        {**dict(zip(["datestamp", "metric_id", *COHORT_COLUMNS], key)), **totals}
        for key, totals in cohorts.items()
    ]


def upsert(existing: list[dict], incoming: list[dict], keys: set[tuple]) -> list[dict]:
    """Drop existing rows whose metric_id + datestamp is being reloaded, then append incoming."""
    kept = [r for r in existing if (r["metric_id"], r["datestamp"]) not in keys]
    return kept + incoming


def load_data(library: dict, evidence: list[dict], folder: Path | None = None) -> None:
    """Load one metric's evidence; library holds metric_id and its definition."""
    folder = folder or data_dir()
    metric_id = library["metric_id"]
    default_datestamp = library.get("datestamp") or date.today().isoformat()
    rows = normalise_evidence(evidence, metric_id, default_datestamp)
    if not rows:
        raise ValueError(f"No evidence rows supplied for {metric_id}")

    datestamps = sorted({r["datestamp"] for r in rows})
    keys = {(metric_id, d) for d in datestamps}

    library_rows = [{**library, "metric_id": metric_id, "datestamp": d} for d in datestamps]
    library_path = folder / "library.csv"
    write_rows(library_path, LIBRARY_COLUMNS, upsert(read_rows(library_path), library_rows, keys))

    summary_path = folder / "summary.csv"
    write_rows(summary_path, SUMMARY_COLUMNS, upsert(read_rows(summary_path), summarise(rows), keys))

    detail_path = folder / "detail.csv"
    detail = read_rows(detail_path)
    latest_incoming = datestamps[-1]
    stored = [r["datestamp"] for r in detail if r["metric_id"] == metric_id]
    if stored and latest_incoming < max(stored):
        logger.warning(
            "Skipping detail for %s: incoming %s is older than stored %s",
            metric_id,
            latest_incoming,
            max(stored),
        )
    else:
        snapshot = [r for r in rows if r["datestamp"] == latest_incoming]
        kept = [r for r in detail if r["metric_id"] != metric_id]
        write_rows(detail_path, DETAIL_COLUMNS, kept + snapshot)

    logger.info("Loaded %s: %d rows for %s", metric_id, len(rows), ", ".join(datestamps))


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Load metric evidence into the dashboard CSVs.")
    parser.add_argument("-id", required=True, dest="metric_id", help="Unique metric identifier, e.g. CC04")
    parser.add_argument(
        "-csv", required=True, type=Path, help="Input CSV with resource and compliance columns"
    )
    parser.add_argument(
        "-date", default=date.today().isoformat(), help="Datestamp (YYYY-MM-DD), default today"
    )
    parser.add_argument("-title", help="Metric title, default the metric id")
    parser.add_argument("-category", default="Default", help="Category grouping, default Default")
    parser.add_argument("-weight", type=float, default=1.0, help="Weight used in scoring, default 1")
    parser.add_argument("-slo", type=float, default=0.95, help="Target SLO, default 0.95")
    parser.add_argument("-slomin", type=float, default=0.90, help="Minimum SLO, default 0.90")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    load_dotenv()
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    args = parse_args(argv)
    library = {
        "datestamp": date.fromisoformat(args.date).isoformat(),
        "metric_id": args.metric_id,
        "category": args.category,
        "title": args.title or args.metric_id,
        "slo": args.slo,
        "slo_min": args.slomin,
        "weight": args.weight,
    }
    try:
        load_data(library, read_rows(args.csv))
    except (OSError, ValueError):
        logger.exception("Failed to load %s from %s", args.metric_id, args.csv)
        raise SystemExit(1) from None


if __name__ == "__main__":
    main()
