import { weightedCalculation } from './weightedCalculations';
import { filterData, pivotData } from './processData';
import { processChartData } from './processChartData';
import { calculateMetrics } from './calculateMetrics';

const row = (overrides) => ({
  datestamp: '2024-01-01', metric_id: 'A', category: 'Alpha', title: 'Metric A',
  business_unit: 'IT', team: 'Cyber', location: 'Sydney',
  total: '10', totalok: '5', weight: '1', slo: '0.9', slo_min: '0.8',
  ...overrides,
});

describe('filterData', () => {
  const data = [row({ business_unit: 'IT' }), row({ business_unit: 'Sales' })];

  it('treats an empty filter value ("All") as no filter', () => {
    expect(filterData(data, { business_unit: '' })).toHaveLength(2);
  });

  it('keeps only matching rows', () => {
    expect(filterData(data, { business_unit: 'Sales' })).toEqual([data[1]]);
  });
});

describe('weightedCalculation', () => {
  it('returns all rows when a filter is reset to "All"', () => {
    const result = weightedCalculation([row()], { business_unit: '' });
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(0.5);
  });

  it('weights metric scores by their weight', () => {
    const data = [
      row({ metric_id: 'A', total: '10', totalok: '10', weight: '3' }), // score 1.0
      row({ metric_id: 'B', total: '10', totalok: '0',  weight: '1' }), // score 0.0
    ];
    expect(weightedCalculation(data)[0].value).toBe(0.75);
  });

  it('sums cohorts of the same metric before scoring', () => {
    const data = [
      row({ location: 'Sydney', total: '10', totalok: '10' }),
      row({ location: 'Perth',  total: '30', totalok: '0' }),
    ];
    expect(weightedCalculation(data)[0].value).toBe(0.25);
  });

  it('splits results by dimension', () => {
    const data = [row({ category: 'Alpha', totalok: '10' }), row({ category: 'Bravo', metric_id: 'B', totalok: '0' })];
    const result = weightedCalculation(data, {}, 'category');
    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({ category: 'Alpha', value: 1 }),
      expect.objectContaining({ category: 'Bravo', value: 0 }),
    ]));
  });
});

describe('pivotData', () => {
  const data = [
    { d: 'x', v: '1' },
    { d: 'x', v: '3' },
    { d: 'y', v: '5' },
  ];

  it('aggregates by dimension', () => {
    const result = pivotData(data, ['d'], {
      sum: ['sum', 'v'], avg: ['avg', 'v'], count: ['count', 'v'], last: ['last', 'v'],
    });
    expect(result).toEqual([
      { d: 'x', sum: 4, avg: 2, count: 2, last: 3 },
      { d: 'y', sum: 5, avg: 5, count: 1, last: 5 },
    ]);
  });

  it('rejects unknown operations', () => {
    expect(() => pivotData(data, ['d'], { bad: ['median', 'v'] })).toThrow(/Unsupported/);
  });
});

describe('processChartData', () => {
  it('returns empty labels and values for empty data instead of throwing', () => {
    expect(processChartData([], 'datestamp', ['value'])).toEqual({ labels: [], values: {} });
  });

  it('sorts by x and returns numbers', () => {
    const { labels, values } = processChartData(
      [{ datestamp: '2024-02-01', value: '0.5' }, { datestamp: '2024-01-01', value: 0.25 }],
      'datestamp', ['value']
    );
    expect(labels).toEqual(['2024-01-01', '2024-02-01']);
    expect(values).toEqual({ value: [0.25, 0.5] });
  });

  it('pivots on z and fills gaps with 0, including series missing from the first row', () => {
    const { values } = processChartData([
      { datestamp: '2024-01-01', category: 'Alpha', value: 0.5 },
      { datestamp: '2024-02-01', category: 'Alpha', value: 0.6 },
      { datestamp: '2024-02-01', category: 'Bravo', value: 0.7 },
    ], 'datestamp', ['value'], 'category');
    expect(values).toEqual({ Alpha: [0.5, 0.6], Bravo: [0, 0.7] });
  });
});

describe('calculateMetrics', () => {
  it('scores each metric at its own latest datestamp, grouped by category', () => {
    const data = [
      row({ metric_id: 'A', datestamp: '2024-01-01', totalok: '1' }),
      row({ metric_id: 'A', datestamp: '2024-02-01', totalok: '9' }),
      row({ metric_id: 'B', title: 'Metric A', datestamp: '2024-01-01', totalok: '4' }),
    ];
    const result = calculateMetrics(data);
    expect(result.Alpha).toHaveLength(2);
    expect(result.Alpha.find(m => m.metric_id === 'A')).toMatchObject({ datestamp: '2024-02-01', score: 0.9 });
    expect(result.Alpha.find(m => m.metric_id === 'B')).toMatchObject({ datestamp: '2024-01-01', score: 0.4 });
  });
});
