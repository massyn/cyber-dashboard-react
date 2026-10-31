import { joinLibrary, loadData } from './loadData';

describe('joinLibrary', () => {
  it('joins library metadata on metric_id + datestamp', () => {
    const library = [
      { datestamp: '2024-01-01', metric_id: 'A', title: 'Old title' },
      { datestamp: '2024-02-01', metric_id: 'A', title: 'New title' },
    ];
    const summary = [{ datestamp: '2024-02-01', metric_id: 'A', total: '1' }];
    expect(joinLibrary(library, summary)).toEqual([
      { datestamp: '2024-02-01', metric_id: 'A', title: 'New title', total: '1' },
    ]);
  });
});

describe('loadData', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('rejects when a file cannot be fetched, and retries on the next call', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404 })));
    await expect(loadData()).rejects.toThrow(/HTTP 404/);

    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, text: async () => 'datestamp,metric_id\n2024-01-01,A\n' })));
    const { summaryData, detailData } = await loadData();
    expect(summaryData).toEqual([{ datestamp: '2024-01-01', metric_id: 'A' }]);
    expect(detailData).toHaveLength(1);
  });
});
