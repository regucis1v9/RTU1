import React from 'react';
import '../../styles/overviewStyles.scss';
const ShelfContainer = () => {
  const shelves = [
    { 
      id: 'T3',
      label: 'Augšējais Plaukts',
      temp: -3,
      color: '#00ff09',
      gradientStart: '#00ff0854',
      gradientEnd: '#00ff09'
    },
    { 
      id: 'T2',
      label: 'Vidējais Plaukts',
      temp: 12,
      color: '#0AF7DD',
      gradientStart: '#0af7db67',
      gradientEnd: '#0AF7DD'
    },
    { 
      id: 'T1',
      label: 'Apakšējais Plaukts',
      temp: 25,
      color: '#ff9f1c',
      gradientStart: '#ffa01c85',
      gradientEnd: '#ff9f1c'
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
