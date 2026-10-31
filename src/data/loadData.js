import Papa from 'papaparse';

const parseCSV = async (filePath) => {
  const response = await fetch(filePath);
  if (!response.ok) {
    throw new Error(`Failed to load ${filePath}: HTTP ${response.status}`);
  }
  const text = await response.text();
  const { data, errors } = Papa.parse(text, { header: true, skipEmptyLines: true });
  if (errors.length > 0) {
    console.warn(`CSV parse warnings in ${filePath}:`, errors);
  }
  return data;
};

// Joins library metadata into each summary row on metric_id + datestamp.
export const joinLibrary = (library, summary) => {
  const libMap = new Map(library.map(row => [`${row.metric_id}|${row.datestamp}`, row]));
  return summary.map(row => ({ ...libMap.get(`${row.metric_id}|${row.datestamp}`), ...row }));
};

let cached = null;

// Loads library, summary and detail once per session; every page shares the same promise.
// A failed load is not cached, so the next call retries.
export const loadData = () => {
  if (!cached) {
    cached = Promise.all([
      parseCSV('/library.csv'),
      parseCSV('/summary.csv'),
      parseCSV('/detail.csv'),
    ])
      .then(([library, summary, detail]) => ({
        summaryData: joinLibrary(library, summary),
        detailData: detail,
      }))
      .catch(error => {
        cached = null;
        throw error;
      });
  }
  return cached;
};
