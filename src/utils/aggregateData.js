// utils/aggregateData.js
export const aggregateData = (data, filters = {}) => {
    // Apply filters
    const filteredData = data.filter((item) => {
      return Object.entries(filters).every(([key, value]) => 
        !value || item[key] === value
      );
    });
  
    // Aggregate data: average values for each datestamp
    const grouped = filteredData.reduce((acc, item) => {
      if (!acc[item.datestamp]) {
        acc[item.datestamp] = { total: 0, count: 0 };
      }
      acc[item.datestamp].total += parseFloat(item.value);
      acc[item.datestamp].count += 1;
      return acc;
    }, {});
  
    // Transform grouped data into chart-friendly format
    const labels = Object.keys(grouped).sort();
    const values = labels.map(
      (label) => grouped[label].total / grouped[label].count
    );
  
    return { labels, values };
  };
  