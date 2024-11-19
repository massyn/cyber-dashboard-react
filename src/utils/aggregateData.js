// aggregateData.js

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
      acc[item.datestamp] = { totalValue: 0, totalSLO: 0, totalSLOMin: 0, count: 0 };
    }
    acc[item.datestamp].totalValue += parseFloat(item.value);
    acc[item.datestamp].totalSLO += parseFloat(item.slo || 0);
    acc[item.datestamp].totalSLOMin += parseFloat(item.slo_min || 0);
    acc[item.datestamp].count += 1;
    return acc;
  }, {});

  // Transform grouped data into chart-friendly format
  const labels = Object.keys(grouped).sort();
  const values = labels.map(
    (label) => grouped[label].totalValue / grouped[label].count
  );
  const sloAverages = labels.map(
    (label) => grouped[label].totalSLO / grouped[label].count
  );
  const sloMinAverages = labels.map(
    (label) => grouped[label].totalSLOMin / grouped[label].count
  );

  return { labels, values, sloAverages, sloMinAverages };
};

export const aggregateDataByBusinessUnit = (data) => {
  const businessUnitData = {};

  // Iterate through the raw data and aggregate by business_unit
  data.forEach(item => {
    const { business_unit, value, sloAverage, sloMinAverage } = item;

    if (!businessUnitData[business_unit]) {
      businessUnitData[business_unit] = {
        businessUnit: business_unit,
        values: [],
        sloAverages: [],
        sloMinAverages: [],
      };
    }

    businessUnitData[business_unit].values.push(value);
    businessUnitData[business_unit].sloAverages.push(sloAverage);
    businessUnitData[business_unit].sloMinAverages.push(sloMinAverage);
  });

  // Prepare the data for plotting
  const aggregatedData = {
    labels: [...new Set(data.map(item => item.datestamp))],
    series: Object.values(businessUnitData).map(unit => ({
      businessUnit: unit.businessUnit,
      values: unit.values, // This can be aggregated (e.g., average, sum, etc.)
      sloAverages: unit.sloAverages,
      sloMinAverages: unit.sloMinAverages,
    })),
  };

  return aggregatedData;
};
