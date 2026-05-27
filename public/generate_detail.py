import random
import csv

LIBRARY = [
    { "metric_id": "AA01", "slo": 0.90, "slo_min": 0.80 },
    { "metric_id": "AA02", "slo": 0.80, "slo_min": 0.70 },
    { "metric_id": "AA03", "slo": 0.96, "slo_min": 0.95 },
    { "metric_id": "AA04", "slo": 0.90, "slo_min": 0.80 },
    { "metric_id": "BB01", "slo": 0.90, "slo_min": 0.80 },
    { "metric_id": "BB02", "slo": 0.80, "slo_min": 0.70 },
    { "metric_id": "BB03", "slo": 0.96, "slo_min": 0.95 },
    { "metric_id": "BB04", "slo": 0.90, "slo_min": 0.80 },
    { "metric_id": "CC01", "slo": 0.90, "slo_min": 0.80 },
    { "metric_id": "CC02", "slo": 0.80, "slo_min": 0.70 },
    { "metric_id": "CC03", "slo": 0.96, "slo_min": 0.95 },
    { "metric_id": "CC04", "slo": 0.90, "slo_min": 0.80 },
]

DATESTAMPS = ["2024-10", "2024-11", "2024-12"]

HIERARCHY = [
    ["Marketing",  "Advertising"],
    ["Marketing",  "Design"],
    ["Production", "Technical"],
    ["Production", "Operations"],
    ["Sales",      "Call center"],
    ["Sales",      "Field officers"],
    ["IT",         "Operations"],
    ["IT",         "Service Desk"],
    ["IT",         "Applications"],
    ["IT",         "Cyber"],
]

LOCATIONS = [
    "Sydney", "Brisbane", "Melbourne", "Perth", "Darwin",
    "Newcastle", "Coffs Harbour", "Port Macquarie", "Hervey Bay",
    "Cairns", "Wyong", "Gladstone", "Maryborough", "Gympie",
    "Cape York", "Kyama", "Woolongong", "Blacktown",
]

FAILURE_REASONS = [
    "Patch not applied - pending maintenance window",
    "Control not configured - awaiting change request",
    "User exemption granted until next review",
    "Legacy system - remediation in backlog",
    "Configuration drift detected",
    "Dependency on third-party vendor",
    "Decommission scheduled - not prioritised",
    "Awaiting approval from change advisory board",
]

PARTIAL_REASONS = [
    "Partial - 3 of 4 sub-controls met",
    "Partial - configuration applied to primary zone only",
    "Partial - monitoring enabled, enforcement pending",
    "Partial - exceptions applied for 1 sub-requirement",
]

RESOURCE_PREFIXES = {
    "IT":         ("SRV", "WKS"),
    "Production": ("PLC", "SRV"),
    "Marketing":  ("LPT", "WKS"),
    "Sales":      ("MOB", "LPT"),
}

RESOURCES_PER_COHORT = 10


def resource_name(business_unit, location, idx):
    prefixes = RESOURCE_PREFIXES.get(business_unit, ("DEV", "DEV"))
    prefix = prefixes[idx % 2]
    loc_code = location[:3].upper()
    return f"{loc_code}-{prefix}-{idx + 1:03d}"


def compliance_value(base_rate):
    r = random.random()
    if r < 0.05:
        return round(random.choice([0.25, 0.5, 0.75]), 2)
    return 1.0 if random.random() < base_rate else 0.0


def detail_text(compliant):
    if compliant == 1.0:
        return ""
    if compliant == 0.0:
        return random.choice(FAILURE_REASONS)
    return random.choice(PARTIAL_REASONS)


def main(outfile):
    rows = 0
    with open(outfile, "wt", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["datestamp", "metric_id", "business_unit", "team", "location",
                          "resource", "compliant", "detail"])

        for d in DATESTAMPS:
            for m in LIBRARY:
                base = random.uniform(m["slo_min"] - 0.05, min(m["slo"] + 0.1, 1.0))
                for bu, team in HIERARCHY:
                    for loc in LOCATIONS:
                        for i in range(RESOURCES_PER_COHORT):
                            res = resource_name(bu, loc, i)
                            comp = compliance_value(base)
                            detail = detail_text(comp)
                            writer.writerow([d, m["metric_id"], bu, team, loc,
                                             res, comp, detail])
                            rows += 1

    print(f"Wrote {rows} rows to {outfile}")


main("detail.csv")
