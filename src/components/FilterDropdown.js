// FilterDropdown.js
import React from 'react';

const FilterDropdown = ({ label, options, value, onChange, name }) => (
  <div style={{ marginBottom: '20px' }}>
    <label htmlFor={`${name}-filter`}>{label}: </label>
    <select
      id={`${name}-filter`}
      name={name}
      value={value}
      onChange={onChange}
    >
      <option value="">All</option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default FilterDropdown;
