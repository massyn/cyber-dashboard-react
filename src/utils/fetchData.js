// utils/fetchData.js
import Papa from 'papaparse'; // Import papaparse for CSV parsing

// Fetch and extract data from a JSON file
export const fetchAndExtractJSON = async (filePath, fields) => {
  try {
    const response = await fetch(filePath);
    const data = await response.json();

    // Extract unique values for specified fields
    const extractedFields = fields.reduce((acc, field) => {
      acc[field] = [...new Set(data.map((item) => item[field]))];
      return acc;
    }, {});

    return { rawData: data, ...extractedFields };
  } catch (error) {
    console.error(`Error fetching or processing data from ${filePath}:`, error);
    throw error; // Re-throw error for caller to handle
  }
};

// Fetch and extract data from a CSV file
export const fetchAndExtractCSV = async (filePath, fields) => {
  try {
    const response = await fetch(filePath);
    const text = await response.text();

    // Parse CSV data using PapaParse
    const parsedData = Papa.parse(text, { header: true, skipEmptyLines: true });

    // Extract unique values for specified fields
    const extractedFields = fields.reduce((acc, field) => {
      const fieldValues = [...new Set(parsedData.data.map((item) => item[field]))];
      acc[field] = fieldValues;
      return acc;
    }, {});

    return { rawData: parsedData.data, ...extractedFields };
  } catch (error) {
    console.error(`Error fetching or processing CSV data from ${filePath}:`, error);
    throw error; // Re-throw error for caller to handle
  }
};
