import csv
from pathlib import Path

import pytest

import load_metric

LIBRARY = {
    "metric_id": "M1",
    "category": "Alpha",
    "title": "Metric 1",
    "slo": 0.9,
    "slo_min": 0.8,
    "weight": 1,
}


def evidence(datestamp: str, compliance: list[float]) -> list[dict]:
    return [
        {"datestamp": datestamp, "resource": f"R{i}", "compliance": c, "business_unit": "IT"}
        for i, c in enumerate(compliance)
    ]


def rows(folder: Path, name: str) -> list[dict]:
    with (folder / name).open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def test_summary_totals_match_evidence(tmp_path: Path) -> None:
    load_metric.load_data(LIBRARY, evidence("2024-01-01", [1.0, 0.5, 0.0]), tmp_path)

    summary = rows(tmp_path, "summary.csv")
    assert len(summary) == 1
    assert summary[0]["business_unit"] == "IT"
    assert summary[0]["team"] == "unknown"
    assert float(summary[0]["totalok"]) == 1.5
    assert int(summary[0]["total"]) == 3


def test_reload_replaces_same_period_and_keeps_history(tmp_path: Path) -> None:
    load_metric.load_data(LIBRARY, evidence("2024-01-01", [1.0]), tmp_path)
    load_metric.load_data(LIBRARY, evidence("2024-02-01", [0.0]), tmp_path)
    load_metric.load_data(LIBRARY, evidence("2024-02-01", [1.0, 1.0]), tmp_path)

    library = rows(tmp_path, "library.csv")
    summary = rows(tmp_path, "summary.csv")
    assert sorted(r["datestamp"] for r in library) == ["2024-01-01", "2024-02-01"]
    assert {r["datestamp"]: int(r["total"]) for r in summary} == {"2024-01-01": 1, "2024-02-01": 2}


def test_detail_keeps_latest_snapshot_and_ignores_older_loads(tmp_path: Path) -> None:
    load_metric.load_data(LIBRARY, evidence("2024-02-01", [1.0, 0.0]), tmp_path)
    load_metric.load_data(LIBRARY, evidence("2024-01-01", [1.0]), tmp_path)

    detail = rows(tmp_path, "detail.csv")
    assert {r["datestamp"] for r in detail} == {"2024-02-01"}
    assert len(detail) == 2
    # the older load still updates its own history period
    assert "2024-01-01" in {r["datestamp"] for r in rows(tmp_path, "summary.csv")}


def test_detail_of_other_metrics_is_untouched(tmp_path: Path) -> None:
    load_metric.load_data(LIBRARY, evidence("2024-01-01", [1.0]), tmp_path)
    load_metric.load_data({**LIBRARY, "metric_id": "M2"}, evidence("2024-01-01", [0.0]), tmp_path)

    assert sorted(r["metric_id"] for r in rows(tmp_path, "detail.csv")) == ["M1", "M2"]


@pytest.mark.parametrize(
    "bad",
    [{"resource": "R1", "compliance": 1.5}, {"resource": "R1", "compliance": "x"}, {"compliance": 1}],
)
def test_invalid_evidence_is_rejected_without_writing(tmp_path: Path, bad: dict) -> None:
    with pytest.raises(ValueError):
        load_metric.load_data(LIBRARY, [bad], tmp_path)
    assert not (tmp_path / "library.csv").exists()


def test_cli_defaults(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    source = tmp_path / "in.csv"
    source.write_text("resource,compliance\nR1,1\nR2,0\n", encoding="utf-8")
    monkeypatch.setenv("CYBER_DASHBOARD_DATA_DIR", str(tmp_path / "out"))

    load_metric.main(["-id", "CC04", "-csv", str(source), "-date", "2026-04-24"])

    library = rows(tmp_path / "out", "library.csv")
    assert library == [
        {
            "datestamp": "2026-04-24",
            "metric_id": "CC04",
            "category": "Default",
            "title": "CC04",
            "slo": "0.95",
            "slo_min": "0.9",
            "weight": "1.0",
        }
    ]
