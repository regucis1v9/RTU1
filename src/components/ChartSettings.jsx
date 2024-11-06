import React, { useState } from 'react';
import '../styles/overviewStyles.scss';

const ChartSettings = () => {
  const [activeButton, setActiveButton] = useState('PLAUTU TEMPERATŪRAS');

  const buttons = [
    { id: 'PLAUTU TEMPERATŪRAS', label: 'PLAUTU TEMPERATŪRAS' },
    { id: 'KAMERAS SPIEDIENS', label: 'KAMERAS SPIEDIENS' },
    { id: 'KAMERAS TEMPERATŪRA', label: 'KAMERAS TEMPERATŪRA' },
    { id: 'CITI GRAFIKI', label: 'CITI GRAFIKI' },
  ];

  return (
    <div className="chart-settings-box">
      <div className="button-grid">
        {buttons.map((button) => (
          <button
            key={button.id}
            onClick={() => setActiveButton(button.id)}
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
