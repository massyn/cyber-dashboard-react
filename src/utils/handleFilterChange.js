// utils/handleFilterChange.js
import { aggregateData } from './aggregateData';

export const handleFilterChange = ({ event, filters, setFilters, data, setFilteredData }) => {
  const { name, value } = event.target;
  const updatedFilters = { ...filters, [name]: value };
  setFilters(updatedFilters);

  // Aggregate data with updated filters
  const aggregatedData = aggregateData(data, {
    business_unit: updatedFilters.businessUnit,
    team: updatedFilters.team,
    location: updatedFilters.location,
  });
  setFilteredData(aggregatedData);
};
