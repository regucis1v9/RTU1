import React from 'react';
import "../styles/overviewStyles.scss"

const ShelfContainer = () => {
  const shelves = [
    { 
      id: 'T3',
      label: 'Upper Shelf',
      temp: -3,
      color: '#93C5FD',
      gradientStart: '#93C5FD33',
      gradientEnd: '#93C5FD'
    },
    { 
      id: 'T2',
      label: 'Middle Shelf',
      temp: 12,
      color: '#FBCFE8',
      gradientStart: '#FBCFE833',
      gradientEnd: '#FBCFE8'
    },
    { 
      id: 'T1',
      label: 'Lower Shelf',
      temp: 25,
      color: '#FB7185',
      gradientStart: '#FB718533',
      gradientEnd: '#FB7185'
    }
  ];

  return (
    <div className="temp-monitor">
      {shelves.map(({ id, label, temp, color, gradientStart, gradientEnd }) => (
        <div key={id} className="shelf-card">
          <div className="shelf-info">
            <div className="shelf-header">
              <span className="shelf-id">{id}</span>
              <span className="shelf-label">{label}</span>
            </div>
            <div className="temp-display">
              <span className="temp-value" style={{ color }}>
                {temp}°C
              </span>
            </div>
          </div>
          
          <div className="visual-indicators">
            <div 
              className="temp-waves"
              style={{
                background: `linear-gradient(90deg, ${gradientStart} 0%, ${gradientEnd} 100%)`
              }}
            >
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="wave"
                  style={{ 
                    animationDelay: `${i * 0.2}s`,
                    backgroundColor: color,
                    opacity: 1 - (i * 0.2)
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShelfContainer;