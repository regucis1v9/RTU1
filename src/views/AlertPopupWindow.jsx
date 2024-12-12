import React, { useState } from 'react';
import { Modal, useMantineColorScheme } from '@mantine/core';
import { IconAlertTriangle, IconAlertCircle, IconInfoCircle, IconCircleCheck } from '@tabler/icons-react';

const ALERT_TYPES = {
  urgent: {
    color: 'red',
    icon: (size) => <IconAlertTriangle color="red" size={size} />,
    label: 'Urgent'
  },
  minor: {
    color: 'orange',
    icon: (size) => <IconAlertCircle color="orange" size={size} />,
    label: 'Minor'
  },
  recommendation: {
    color: 'green',
    icon: (size) => <IconCircleCheck color="green" size={size} />,
    label: 'Recommendation'
  }
};

const getShelfColor = (hasError, errorType) => {
  if (!hasError) return 'currentColor'; // Default color for non-error
  return ALERT_TYPES[errorType]?.color || ALERT_TYPES.urgent.color;
};

const ShelfStatusCircle = ({ shelves, systemAlert, onShelfClick, onSystemAlertClick }) => {
  return (
    <div className="shelf-status-container">
      <svg viewBox="0 0 100 100" className="shelf-diagram">
        <rect 
          x="10" 
          y="10" 
          width="80" 
          height="80" 
          fill="none" 
          stroke={getShelfColor(shelves[0]?.hasError, shelves[0]?.alertType)}
          strokeWidth="2" 
          onClick={systemAlert?.hasError ? () => onSystemAlertClick(systemAlert) : null}
          cursor={systemAlert?.hasError ? 'pointer' : 'default'}
        />
        
        {shelves
          .filter((shelf) => shelf.id !== 0) // Skip the outer box (id: 0)
          .map((shelf, index) => (
            <g key={shelf.id}>
            <line
              x1="20"
              y1={80 - index * 12}
              x2="80"
              y2={80 - index * 12}
              stroke={getShelfColor(shelf.hasError, shelf.alertType)}
              strokeWidth="2"
              className={`shelf-line ${shelf.hasError ? 'error-line' : ''}`}
              onClick={() => onShelfClick(shelf)}
              cursor="pointer"
            />
            <text 
              x="50" // Centered horizontally
              y={78 - index * 12} // Moved slightly above the line
              fontSize="5" 
              textAnchor="middle" // Centered alignment
              fill="currentColor"
            >
              {shelf.id}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const ShelfAlertModal = ({ shelf, isOpen, onClose, colorScheme }) => {
  if (!shelf) return null;
  const isDark = colorScheme === 'dark';

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={`Alert for ${shelf.id === 0 ? 'Outer Box' : `Shelf ${shelf.id}`}`}
      size="sm"
      centered
      className={`shelf-alert-modal ${isDark ? 'dark-mode' : 'light-mode'}`}
    >
      <div className="shelf-alert-content">
        {shelf.hasError ? (
          <div 
            className="shelf-error-box"
            style={{ 
              borderColor: ALERT_TYPES[shelf.alertType].color,
              backgroundColor: `${ALERT_TYPES[shelf.alertType].color}10`,
            }}
          >
            {ALERT_TYPES[shelf.alertType].icon(24)}
            <div>
              <h4 style={{ color: ALERT_TYPES[shelf.alertType].color }}>
                {ALERT_TYPES[shelf.alertType].label} Alert
              </h4>
              <span>{shelf.errorMessage}</span>
            </div>
          </div>
        ) : (
          <div className="no-alerts-box">
            <h4>No alerts found for this shelf.</h4>
          </div>
        )}
      </div>
    </Modal>
  );
};


const SystemAlertModal = ({ systemAlert, isOpen, onClose, colorScheme }) => {
  if (!systemAlert) return null;
  const isDark = colorScheme === 'dark';
  const alertType = ALERT_TYPES[systemAlert.type];

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="System Alert"
      size="sm"
      centered
      className={`system-alert-modal ${isDark ? 'dark-mode' : 'light-mode'}`}
    >
      <div className="system-alert-content">
        {systemAlert.hasError ? (
          <div 
            className={`system-error-box alert-${systemAlert.type}`}
            style={{ 
              borderColor: alertType.color, 
              backgroundColor: `${alertType.color}10` 
            }}
          >
            {alertType.icon(24)}
            <div>
              <h4 style={{ color: alertType.color }}>{alertType.label} Alert</h4>
              <span>{systemAlert.errorMessage}</span>
            </div>
          </div>
        ) : (
          <div className="no-alerts-box">
            <h4>No alerts found for the system.</h4>
          </div>
        )}
      </div>
    </Modal>
  );
};

const AlertPopupWindow = ({ isOpen, onClose }) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [shelves, setShelves] = useState([
    {
      id: 0,
      hasError: true,
      alertType: 'minor',
      errorMessage: 'Outer box alert: Minor issue detected',
    },
    { id: 1, hasError: false, alertType: null },
    { id: 2, hasError: false, alertType: null },
    {
      id: 3,
      hasError: true,
      alertType: 'urgent',
      errorMessage: 'Shelf 3 pressure anomaly',
    },
    {
      id: 4,
      hasError: true,
      alertType: 'recommendation',
      errorMessage: 'Shelf 4 maintenance required',
    },
    { id: 5, hasError: false, alertType: null },
    {
      id: 6,
      hasError: true,
      alertType: 'minor',
      errorMessage: 'Shelf 6 minor alert',
    },
  ]);


  const [systemAlert, setSystemAlert] = useState({
    hasError: true,
    type: 'urgent',
    errorMessage: 'Critical system temperature outside safe range',
  });

  const [alertHistory, setAlertHistory] = useState([
    {
      timestamp: '2024-02-15 10:30',
      message: 'Temperature fluctuation detected on Shelf 1',
      type: 'minor',
    },
    {
      timestamp: '2024-02-14 15:45',
      message: 'Pressure anomaly on Shelf 4',
      type: 'urgent',
    },
    {
      timestamp: '2024-02-13 09:15',
      message: 'Routine system check completed',
      type: 'recommendation',
    },
    {
      timestamp: '2024-02-16 11:20',
      message: 'System temperature exceeded maximum threshold',
      type: 'urgent',
    }
  ]);

  const [selectedShelf, setSelectedShelf] = useState(null);
  const [isShelfModalOpen, setIsShelfModalOpen] = useState(false);
  const [isSystemAlertModalOpen, setIsSystemAlertModalOpen] = useState(false);

  const handleShelfClick = (shelf) => {
    setSelectedShelf(shelf);
    setIsShelfModalOpen(true);
  };

  const handleSystemAlertClick = (alert) => {
    setIsSystemAlertModalOpen(true);
  };

  const currentEmergency = shelves.find((shelf) => shelf.hasError);

  return (
    <>
      <Modal
        opened={isOpen}
        onClose={onClose}
        title="Freeze Dryer Alerts"
        size="md"
        centered
        className={`alert-popup ${isDark ? 'dark-mode' : 'light-mode'}`}
      >
        <div className="alert-popup-content">
          <ShelfStatusCircle 
            shelves={shelves} 
            systemAlert={systemAlert}
            onShelfClick={handleShelfClick}
            onSystemAlertClick={handleSystemAlertClick}
          />

          {systemAlert.hasError && (
            <div 
              className={`current-emergency-box alert-${systemAlert.type}`}
              style={{ 
                backgroundColor: `${ALERT_TYPES[systemAlert.type].color}10`,
                borderColor: ALERT_TYPES[systemAlert.type].color,
                cursor: 'pointer'
              }}
              onClick={handleSystemAlertClick}
            >
              {ALERT_TYPES[systemAlert.type].icon(24)}
              <span>{systemAlert.errorMessage}</span>
            </div>
          )}

          <div className={`alert-history ${isDark ? 'dark-history' : 'light-history'}`}>
            <h3>Global Alert History</h3>
            <div className="alert-list">
              {alertHistory.map((alert, index) => (
                <div key={index} className={`alert-item alert-${alert.type}`}>
                  <div className="alert-icon">{ALERT_TYPES[alert.type].icon(20)}</div>
                  <div className="alert-details">
                    <span className="timestamp">{alert.timestamp}</span>
                    <span className="message">{alert.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ShelfAlertModal 
        shelf={selectedShelf} 
        isOpen={isShelfModalOpen} 
        onClose={() => setIsShelfModalOpen(false)}
        colorScheme={colorScheme}
      />

      <SystemAlertModal
        systemAlert={systemAlert}
        isOpen={isSystemAlertModalOpen}
        onClose={() => setIsSystemAlertModalOpen(false)}
        colorScheme={colorScheme}
      />
    </>
  );
};

export default AlertPopupWindow;
