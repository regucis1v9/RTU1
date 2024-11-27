import React, { useState } from 'react';
import { Modal, Button, useMantineColorScheme } from '@mantine/core';
import { IconAlertTriangle, IconAlertCircle } from '@tabler/icons-react';

const ShelfStatusCircle = ({ shelves }) => {
  return (
    <div className="shelf-status-circle">
      <svg viewBox="0 0 100 100" className="shelf-diagram">
        <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" />
        {shelves.map((shelf, index) => (
          <line
            key={index}
            x1="15"
            y1={20 + index * 10}
            x2="85"
            y2={20 + index * 10}
            stroke={shelf.hasError ? 'red' : 'currentColor'}
            strokeWidth="2"
          />
        ))}
      </svg>
    </div>
  );
};

const AlertPopupWindow = ({ isOpen, onClose }) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [shelves, setShelves] = useState([
    { id: 1, hasError: true, errorMessage: 'Temperature fluctuation detected' },
    { id: 2, hasError: false },
    { id: 3, hasError: false },
    { id: 4, hasError: true, errorMessage: 'Pressure anomaly on Shelf 4' },
    { id: 5, hasError: false },
    { id: 6, hasError: false },
    { id: 7, hasError: false },
  ]);

  const [alertHistory, setAlertHistory] = useState([
    {
      timestamp: '2024-02-15 10:30',
      message: 'Temperature fluctuation detected on Shelf 1',
      type: 'warning',
    },
    {
      timestamp: '2024-02-14 15:45',
      message: 'Pressure anomaly on Shelf 4',
      type: 'error',
    },
    {
      timestamp: '2024-02-13 09:15',
      message: 'Routine system check completed',
      type: 'info',
    },
  ]);

  const currentEmergency = shelves.find((shelf) => shelf.hasError);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return <IconAlertTriangle color="red" size={20} />;
      case 'warning':
        return <IconAlertCircle color="orange" size={20} />;
      default:
        return <IconAlertCircle color="blue" size={20} />;
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Freeze Dryer Alerts"
      size="md"
      centered
      className={`alert-popup ${isDark ? 'dark-mode' : 'light-mode'}`}
    >
      <div className="alert-popup-content">
        <ShelfStatusCircle shelves={shelves} />

        {currentEmergency && (
          <div className={`current-emergency-box ${isDark ? 'dark-emergency' : 'light-emergency'}`}>
            <IconAlertTriangle color="red" size={24} />
            <span>{currentEmergency.errorMessage}</span>
          </div>
        )}

        <div className={`alert-history ${isDark ? 'dark-history' : 'light-history'}`}>
          <h3>Alert History</h3>
          <div className="alert-list">
            {alertHistory.map((alert, index) => (
              <div key={index} className={`alert-item alert-${alert.type}`}>
                <div className="alert-icon">{getAlertIcon(alert.type)}</div>
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
  );
};

export default AlertPopupWindow;
