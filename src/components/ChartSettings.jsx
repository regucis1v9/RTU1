// ChartSettings.jsx
import React, { useState } from 'react';
import '../styles/overviewStyles.scss';

const ChartSettings = ({ onChartTypeChange }) => {
  const [activeButton, setActiveButton] = useState('PLAUKTU TEMPERATŪRAS');

  const buttons = [
    { id: 'PLAUKTU TEMPERATŪRAS', label: 'PLAUKTU TEMPERATŪRAS', type: 'temperature' },
    { id: 'KAMERAS SPIEDIENS', label: 'KAMERAS SPIEDIENS', type: 'pressure' },
    { id: 'KAMERAS TEMPERATŪRA', label: 'KAMERAS TEMPERATŪRA', type: 'temperature2' },
    { id: 'CITI GRAFIKI', label: 'CITI GRAFIKI', type: 'temperature' },
  ];

  const handleButtonClick = (buttonId, chartType) => {
    setActiveButton(buttonId);
    onChartTypeChange(chartType);
  };

  return (
    <div className="chart-settings-box">
      <div className="button-grid">
        {buttons.map((button) => (
          <button
            key={button.id}
            onClick={() => handleButtonClick(button.id, button.type)}
            className={`chart-button ${activeButton === button.id ? 'active' : ''}`}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChartSettings;