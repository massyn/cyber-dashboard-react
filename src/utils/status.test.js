import { complianceStatus, formatPercent, formatPeriod } from './status';

describe('complianceStatus', () => {
  it.each([
    [0.95, 'good'],
    [0.9, 'good'],
    [0.85, 'warning'],
    [0.8, 'warning'],
    [0.79, 'critical'],
  ])('score %s against target 0.9 / minimum 0.8 is %s', (score, expected) => {
    expect(complianceStatus(score, 0.9, 0.8)).toBe(expected);
  });
});

describe('formatting', () => {
  it('formats scores as percentages and missing values as a dash', () => {
    expect(formatPercent(0.8567)).toBe('85.7%');
    expect(formatPercent(0.9, 0)).toBe('90%');
    expect(formatPercent(NaN)).toBe('–');
  });

  it('formats ISO datestamps as month and year', () => {
    expect(formatPeriod('2024-03-01')).toBe('Mar 2024');
    expect(formatPeriod('Q1')).toBe('Q1');
  });
});
