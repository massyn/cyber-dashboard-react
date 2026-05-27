import Papa from 'papaparse';

const parseCSV = async (filePath) => {
  const response = await fetch(filePath);
  const text = await response.text();
  return Papa.parse(text, { header: true, skipEmptyLines: true }).data;
};

export const fetchAndExtractJSON = async (filePath) => {
  try {
    const response = await fetch(filePath);
    const data = await response.json();
    return { rawData: data };
  } catch (error) {
    console.error(`Error fetching JSON from ${filePath}:`, error);
    throw error;
  }
};

export const fetchAndExtractCSV = async (filePath) => {
  try {
    return { rawData: await parseCSV(filePath) };
  } catch (error) {
    console.error(`Error fetching CSV from ${filePath}:`, error);
    throw error;
  }
};

// Loads library, summary, and detail; joins library metadata into summary rows.
// Returns { summaryData, detailData } where summaryData rows include all library columns.
export const loadData = async () => {
  const [library, summary, detail] = await Promise.all([
    parseCSV('/library.csv'),
    parseCSV('/summary.csv'),
    parseCSV('/detail.csv'),
  ]);

  const libMap = {};
  for (const row of library) {
    libMap[`${row.metric_id}|${row.datestamp}`] = row;
  }

  const summaryData = summary.map(row => {
    const meta = libMap[`${row.metric_id}|${row.datestamp}`] ?? {};
    return { ...meta, ...row };
  });

  return { summaryData, detailData: detail };
};
