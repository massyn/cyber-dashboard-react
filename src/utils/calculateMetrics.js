import { filterData, pivotData } from './processData';

// Scores each metric at its own latest datestamp and groups the results by category.
export const calculateMetrics = (data, filters = {}) => {
    const filteredData = filterData(data, filters);

    const latestByMetricId = filteredData.reduce((acc, { metric_id, datestamp }) => {
        if (!acc[metric_id] || datestamp > acc[metric_id]) {
            acc[metric_id] = datestamp;
        }
        return acc;
    }, {});

    const pivoted = pivotData(filteredData, ['datestamp', 'category', 'title', 'metric_id'], {
        sum_total:   ['sum', 'total'],
        sum_totalok: ['sum', 'totalok'],
        weight:      ['avg', 'weight'],
        slo:         ['avg', 'slo'],
        slo_min:     ['avg', 'slo_min'],
    });

    return pivoted
        .filter(item => item.datestamp === latestByMetricId[item.metric_id])
        .map(item => ({
            ...item,
            score: item.sum_total ? item.sum_totalok / item.sum_total : 0,
        }))
        .reduce((acc, item) => {
            (acc[item.category] ??= []).push(item);
            return acc;
        }, {});
};
