import React, { useState } from 'react';
import '../styles/overviewStyles.scss';

const ChartSettings = ({ onChartTypeChange, onExtraButtonClick }) => {
  const [selectedOption, setSelectedOption] = useState('PLAUKTU TEMPERATŪRAS');

  const buttons = [
    { id: 'PLAUKTU TEMPERATŪRAS', label: 'PLAUKTU TEMPERATŪRAS', type: 'temperature' },
    { id: 'KAMERAS SPIEDIENS', label: 'KAMERAS SPIEDIENS', type: 'pressure' },
    { id: 'KAMERAS TEMPERATŪRA', label: 'KAMERAS TEMPERATŪRA', type: 'temperature2' },
    { id: 'CITI GRAFIKI', label: 'CITI GRAFIKI', type: 'temperature' },
  ];

  const handleSelectChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div className="chart-settings-box">
      <div className="dropdown-container">
        <select
          value={selectedOption}
          onChange={handleSelectChange}
          className="chart-dropdown"
        >
          {buttons.map((button) => (
            <option key={button.id} value={button.label}>
              {button.label}
            </option>
          ))}
        </select>
      </div>
      <button className="extra-button" onClick={onExtraButtonClick}>
        Extra
      </button>
    </div>
  );
};

export default ChartSettings;
