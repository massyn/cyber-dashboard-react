import random

def main(file):
    library = [
        { "metric_id" : "AA01", "title" : "Metric Alpha"   , "category" : "Bravo", "slo" : 0.90, "slo_min" : 0.8 , "weight" : 0.2 },
        { "metric_id" : "AA02", "title" : "Metric Bravo"   , "category" : "Bravo", "slo" : 0.80, "slo_min" : 0.7 , "weight" : 0.4 },
        { "metric_id" : "AA03", "title" : "Metric Charlie" , "category" : "Alpha", "slo" : 0.96, "slo_min" : 0.95, "weight" : 0.9 },
        { "metric_id" : "AA04", "title" : "Metric Delta"   , "category" : "Alpha", "slo" : 0.90, "slo_min" : 0.8 , "weight" : 0.2 },
        { "metric_id" : "BB01", "title" : "Metric Echo"    , "category" : "Bravo", "slo" : 0.90, "slo_min" : 0.8 , "weight" : 0.2 },
        { "metric_id" : "BB02", "title" : "Metric Foxtrot" , "category" : "Bravo", "slo" : 0.80, "slo_min" : 0.7 , "weight" : 0.4 },
        { "metric_id" : "BB03", "title" : "Metric Golf"    , "category" : "Alpha", "slo" : 0.96, "slo_min" : 0.95, "weight" : 0.9 },
        { "metric_id" : "BB04", "title" : "Metric Hotel"   , "category" : "Alpha", "slo" : 0.90, "slo_min" : 0.8 , "weight" : 0.2 },
        { "metric_id" : "CC01", "title" : "Metric India"   , "category" : "Bravo", "slo" : 0.90, "slo_min" : 0.8 , "weight" : 0.2 },
        { "metric_id" : "CC02", "title" : "Metric Juliet"  , "category" : "Bravo", "slo" : 0.80, "slo_min" : 0.7 , "weight" : 0.4 },
        { "metric_id" : "CC03", "title" : "Metric Kilo"    , "category" : "Alpha", "slo" : 0.96, "slo_min" : 0.95, "weight" : 0.9 },
        { "metric_id" : "CC04", "title" : "Metric Lima"    , "category" : "Alpha", "slo" : 0.90, "slo_min" : 0.8 , "weight" : 0.2 },
    ]

    datestamp = [
        '2023-01',
        '2023-02',
        '2023-03',
        '2023-04',
        '2023-05',
        '2023-06',
        '2023-07',
        '2023-08',
        '2023-09',
        '2023-10',
        '2023-11',
        '2023-12',
        '2024-01',
        '2024-02',
        '2024-03',
        '2024-04',
        '2024-05',
        '2024-06',
        '2024-07',
        '2024-08',
        '2024-09',
        '2024-10',
        '2024-11',
        '2024-12'
    ]

    hierarchy = [
        [ "Marketing"  , "Advertising"    ],
        [ "Marketing"  , "Design"         ],
        [ "Production" , "Technical"      ],
        [ "Production" , "Operations"     ],
        [ "Sales"      , "Call center"    ],
        [ "Sales"      , "Field officers" ],
        [ "IT"         , "Operations"     ],
        [ "IT"         , "Service Desk"   ],
        [ "IT"         , "Applications"   ],
        [ "IT"         , "Cyber"          ],
        
    ]

    location = [
        "Sydney",
        "Brisbane",
        "Melbourne",
        "Perth",
        "Darwin",
        "Newcastle",
        "Coffs Harbour",
        "Port Macquarie",
        "Hervey Bay",
        "Cairns",
        "Wyong",
        "Gladstone",
        "Maryborough",
        "Gympie",
        "Cape York",
        "Kyama",
        "Woolongong",
        "Blacktown"
    ]

    total = 100
    with open(file,"wt",encoding='utf-8') as q:
        q.write("datestamp,metric_id,category,title,slo,slo_min,weight,business_unit,team,location,totalok,total\n")
        cnt = 0

        for d in datestamp:
            for m in library:
                for h in hierarchy:
                    for l in location:
                        totalok = total * random.randint(0,95) / 100

                        q.write(f"{d},{m['metric_id']},{m['category']},{m['title']},{m['slo']},{m['slo_min']},{m['weight']},{h[0]},{h[1]},{l},{totalok},{total}\n")
                        cnt += 1

        print(f"\n\nWrote {cnt} lines...")


main('summary.csv')