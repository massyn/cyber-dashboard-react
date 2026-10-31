// Reshapes rows into chart labels (x) and one numeric series per field in y.
// With z, rows are pivoted so each distinct z value becomes its own series of y[0].
export const processChartData = (data, x, y, z) => {
    if (!data || data.length === 0) {
        return { labels: [], values: {} };
    }

    let data_clean;

    if (!z) {
        data_clean = data.map((item) =>
            [...new Set([x, ...y])].reduce((acc, key) => {
                if (key in item) {
                    acc[key] = item[key];
                }
                return acc;
            }, {})
        );
    } else {
        data_clean = data.reduce((acc, item) => {
            const existing = acc.find(record => record[x] === item[x]);
            if (existing) {
                existing[item[z]] = item[y[0]];
            } else {
                acc.push({
                    [x]: item[x],
                    [item[z]]: item[y[0]],
                });
            }
            return acc;
        }, []);
    }

    const fieldNames = [...new Set(data_clean.flatMap(record => Object.keys(record)))].filter(field => field !== x);

    const sortedData = [...data_clean].sort((a, b) => (a[x] > b[x] ? 1 : -1));

    const labels = sortedData.map((item) => item[x]);

    const values = fieldNames.reduce((acc, field) => {
        acc[field] = sortedData.map((item) => {
            const value = Number(item[field]);
            return Number.isFinite(value) ? value : 0;
        });
        return acc;
    }, {});

    return { labels, values };
};
