import random
from datetime import date
import load_metric

LIBRARY = [
    { "metric_id": "AA01", "title": "Metric Alpha",   "category": "Bravo", "slo": 0.90, "slo_min": 0.80, "weight": 0.2 },
    { "metric_id": "AA02", "title": "Metric Bravo",   "category": "Bravo", "slo": 0.80, "slo_min": 0.70, "weight": 0.4 },
    { "metric_id": "AA03", "title": "Metric Charlie", "category": "Alpha", "slo": 0.96, "slo_min": 0.95, "weight": 0.9 },
    { "metric_id": "AA04", "title": "Metric Delta",   "category": "Alpha", "slo": 0.90, "slo_min": 0.80, "weight": 0.2 },
    { "metric_id": "BB01", "title": "Metric Echo",    "category": "Bravo", "slo": 0.90, "slo_min": 0.80, "weight": 0.2 },
    { "metric_id": "BB02", "title": "Metric Foxtrot", "category": "Bravo", "slo": 0.80, "slo_min": 0.70, "weight": 0.4 },
    { "metric_id": "BB03", "title": "Metric Golf",    "category": "Alpha", "slo": 0.96, "slo_min": 0.95, "weight": 0.9 },
    { "metric_id": "BB04", "title": "Metric Hotel",   "category": "Alpha", "slo": 0.90, "slo_min": 0.80, "weight": 0.2 },
    { "metric_id": "CC01", "title": "Metric India",   "category": "Bravo", "slo": 0.90, "slo_min": 0.80, "weight": 0.2 },
    { "metric_id": "CC02", "title": "Metric Juliet",  "category": "Bravo", "slo": 0.80, "slo_min": 0.70, "weight": 0.4 },
    { "metric_id": "CC03", "title": "Metric Kilo",    "category": "Alpha", "slo": 0.96, "slo_min": 0.95, "weight": 0.9 },
    { "metric_id": "CC04", "title": "Metric Lima",    "category": "Alpha", "slo": 0.90, "slo_min": 0.80, "weight": 0.2 },
]

DATESTAMPS = [
    date(2024,  1, 1), date(2024,  2, 1), date(2024,  3, 1), date(2024,  4, 1),
    date(2024,  5, 1), date(2024,  6, 1), date(2024,  7, 1), date(2024,  8, 1),
    date(2024,  9, 1), date(2024, 10, 1), date(2024, 11, 1), date(2024, 12, 1),
]

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
]

RESOURCE_PREFIXES = {
    "IT":         ("SRV", "WKS"),
    "Production": ("PLC", "SRV"),
    "Marketing":  ("LPT", "WKS"),
    "Sales":      ("MOB", "LPT"),
}

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

RESOURCES_PER_COHORT = 3

def compliance_value(base_rate):
    r = random.random()
    if r < 0.05:
        return round(random.choice([0.25, 0.5, 0.75]), 2)
    return 1.0 if random.random() < base_rate else 0.0

def resource_name(business_unit, location, idx):
    prefixes = RESOURCE_PREFIXES.get(business_unit, ("DEV", "DEV"))
    prefix = prefixes[idx % 2]
    loc_code = location[:3].upper()
    return f"{loc_code}-{prefix}-{idx + 1:03d}"

def detail_text(compliant):
    if compliant == 1.0:
        return ""
    if compliant == 0.0:
        return random.choice(FAILURE_REASONS)
    return random.choice(PARTIAL_REASONS)

def main():
    for d in DATESTAMPS:
        ds = d.strftime('%Y-%m-%d')
        for m in LIBRARY:
            base = random.uniform(m["slo_min"] - 0.05, min(m["slo"] + 0.1, 1.0))
            library = {
                'datestamp': ds,
                'metric_id': m['metric_id'],
                'category':  m['category'],
                'title':     m['title'],
                'slo':       m['slo'],
                'slo_min':   m['slo_min'],
                'weight':    m['weight'],
            }
            evidence = []

            for h in HIERARCHY:
                for loc in LOCATIONS:
                    for i in range(RESOURCES_PER_COHORT):
                        comp = compliance_value(base)
                        evidence.append({
                            'datestamp'     : ds,
                            'metric_id'     : m['metric_id'],
                            'business_unit' : h[0],
                            'team'          : h[1],
                            'location'      : loc,
                            'resource'      : resource_name(h[0], loc, i),
                            'compliance'    : comp,
                            'detail'        : detail_text(comp),
                        })

            load_metric.load_data(library, evidence)

main()
