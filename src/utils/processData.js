// processData.js

export const filterData = (data, criteria) => {
    if (!Array.isArray(data)) {
        throw new Error("The data parameter must be an array.");
    }
    if (typeof criteria !== "object" || criteria === null) {
        throw new Error("The criteria parameter must be a non-null object.");
    }
    return data.filter(item =>
        Object.entries(criteria).every(([key, value]) => !value || item[key] === value)
    );
  };

export const pivotData = (data, dimensions, aggregations) => {
    if (!Array.isArray(data)) {
        throw new Error("The data parameter must be an array.");
    }
    if (!Array.isArray(dimensions)) {
        throw new Error("The dimensions parameter must be an array.");
    }
    if (typeof aggregations !== "object" || aggregations === null) {
        throw new Error("The aggregations parameter must be a non-null object.");
    }
  
    // Group data by dimensions
    const groupedData = data.reduce((groups, item) => {
        // Create a composite key based on dimension values
        const key = dimensions.map(dim => item[dim]).join("|");
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
  
    // Perform aggregations
    const result = [];
    for (const [key, group] of Object.entries(groupedData)) {
        const resultItem = {};
  
        // Assign dimension values back to the result object
        const dimensionValues = key.split("|");
        dimensions.forEach((dim, index) => {
            resultItem[dim] = dimensionValues[index];
        });
  
        // Perform each aggregation
        for (const [aggName, [operation, field]] of Object.entries(aggregations)) {
            switch (operation) {
                case "avg":
                    resultItem[aggName] = group.reduce((sum, item) => sum + parseFloat(item[field] || 0), 0) / group.length;
                    break;
                case "sum":
                    resultItem[aggName] = group.reduce((sum, item) => sum + parseFloat(item[field] || 0), 0);
                    break;
                case "count":
                    resultItem[aggName] = group.length;
                    break;
                case "last":
                    resultItem[aggName] = group.reduce((sum, item) => parseFloat(item[field] || 0), 0);
                    break;
                default:
                    throw new Error(`Unsupported aggregation operation: ${operation}`);
            }
        }
  
        result.push(resultItem);
    }
  
    return result;
  }

export const processChartData = (data, x, y, z) => {
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
                const newRecord = {
                    [x]: item[x],
                    [item[z]]: item[y[0]],
                };
                acc.push(newRecord);
            }
            return acc;
        }, []);
    }

    const fieldNames = Object.keys(data_clean[0]).filter(field => field !== x);
    const labels = data_clean.map((item) => item[x]);
    const values = fieldNames.reduce((acc, field) => {
        acc[field] = data_clean.map((item) => item[field]);
        return acc;
    }, {});

    return { labels, values };
};