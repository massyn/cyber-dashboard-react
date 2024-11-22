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
                default:
                    throw new Error(`Unsupported aggregation operation: ${operation}`);
            }
        }
  
        result.push(resultItem);
    }
  
    return result;
  }

  export const prepareChart = (data, labelKey) => {
    if (!Array.isArray(data)) {
        throw new Error("The data parameter must be an array.");
    }
    if (typeof labelKey !== "string") {
        throw new Error("The labelKey parameter must be a string.");
    }
  
    if (data.length === 0) {
        return { labels: [] }; // Return an empty structure if no data
    }
  
    // Extract field names (excluding the labelKey)
    const fieldNames = Object.keys(data[0]).filter(field => field !== labelKey);
  
    // Group data by the labelKey
    const grouped = data.reduce((acc, item) => {
        const label = item[labelKey];
        if (!acc[label]) {
            acc[label] = {};
            fieldNames.forEach(field => {
                acc[label][field] = []; // Initialize an array for each field
            });
        }
        fieldNames.forEach(field => {
            acc[label][field].push(item[field]); // Accumulate values for each field
        });
        return acc;
    }, {});
  
    // Transform grouped data into flat columns
    const labels = Object.keys(grouped).sort();
    const columns = fieldNames.reduce((acc, field) => {
        acc[field] = labels.map(label => {
            // Collapse each list into a single value (if there's only one value)
            const values = grouped[label][field];
            return values.length === 1 ? values[0] : values;
        });
        return acc;
    }, {});
  
    return {
        labels, // Sorted list of unique labels
        ...columns, // Individual columns for each field
    };
  }