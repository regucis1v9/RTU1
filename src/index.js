import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AllProfiles from './views/AllProfiles';
import Overview from './views/Overview';
import Landing from './views/Landing';
import SingleProfile from './views/SingleProfile';
import Login from './views/Login';
import TestingPage from './views/Testing';
import { Notifications } from '@mantine/notifications';
import { LanguageProvider } from './context/LanguageContext';
import { PressureUnitProvider } from './context/PressureUnitContext';
import { TemperatureUnitProvider } from './context/TemperatureUnitContext';
import { PauseProvider } from './context/PauseContext';
import { AlertPopup } from './views/AlertPopup';
import PauseScreen from "./components/PauseScreen";
import OverviewMain from './views/OverviewMain';

// Import the sound file
import alertSound from './sounds/mixkit-industry-alarm-tone-2979.wav';

const root = ReactDOM.createRoot(document.getElementById('root'));

function App() {
  const [alerts, setAlerts] = useState([]);
  const alertTimeoutRef = useRef(null);
  const audioRef = useRef(new Audio(alertSound));

  // Expanded list of possible alerts with more variety
  const alertTypes = [
    {
      type: 'warning',
      messages: [
        'High Temperature Alert in Machine 3: 85°C',
        'Low Pressure Alert in Machine 7: 10 bar',
        'Overheating Warning in Machine 2: 120°C',
        'Vibration Detected in Machine 5',
        'Unexpected Noise Level in Production Line'
      ]
    },
    {
      type: 'critical',
      messages: [
        'Critical System Failure in Machine 1',
        'Emergency Shutdown Required',
        'Data Backup Interruption',
        'Network Connectivity Lost',
        'Security Breach Detected'
      ]
    },
    {
      type: 'info',
      messages: [
        'Maintenance Scheduled for Next Week',
        'Software Update Available',
        'Performance Optimization in Progress',
        'Resource Utilization Report',
        'New Safety Protocol Implemented'
      ]
    }
  ];

  // Function to generate a random alert
  const generateRandomAlert = () => {
    const randomTypeIndex = Math.floor(Math.random() * alertTypes.length);
    const selectedType = alertTypes[randomTypeIndex];
    const randomMessageIndex = Math.floor(Math.random() * selectedType.messages.length);

    return {
      title: selectedType.type.charAt(0).toUpperCase() + selectedType.type.slice(1) + ' Alert',
      message: selectedType.messages[randomMessageIndex],
      type: selectedType.type
    };
  };

  // Simulate random alert generation
  const simulateRandomAlerts = () => {
    // Random interval between 5 to 30 seconds
    const randomInterval = Math.random() * (3000000 - 500000) + 500000;

    alertTimeoutRef.current = setTimeout(() => {
      const newAlert = generateRandomAlert();

      // Add the new alert
      setAlerts(prevAlerts => {
        // Limit to 5 most recent alerts
        const updatedAlerts = [...prevAlerts, newAlert].slice(-5);
        return updatedAlerts;
      });

      // Play alert sound
      audioRef.current.currentTime = 0; // Reset to start
      audioRef.current.play().catch(error => {
        console.error('Error playing alert sound:', error);
      });

      // Continue generating alerts
      simulateRandomAlerts();
    }, randomInterval);
  };

  // Close a specific alert
  const closeAlert = (indexToRemove) => {
    setAlerts(prevAlerts =>
      prevAlerts.filter((_, index) => index !== indexToRemove)
    );
  };

  // Start alert simulation when component mounts
  useEffect(() => {
    simulateRandomAlerts();

    // Cleanup timeout on unmount
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  return (
    <MantineProvider>
      <Notifications />
      <LanguageProvider>
        <PressureUnitProvider>
          <TemperatureUnitProvider>
            <PauseProvider>
              <PauseScreen />
              <Router>
                <Routes>
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/allProfiles" element={<AllProfiles />} />
                  <Route path="/OverviewMain/:fileName" element={<OverviewMain />} />
                  <Route path="/singleProfile/:fileName" element={<SingleProfile />} />
                  <Route path="/" element={<Login />} />
                  <Route path="/testing" element={<TestingPage />} />
                </Routes>

                {alerts.length > 0 && (
                  <AlertPopup
                    alerts={alerts}
                    onClose={(index) => closeAlert(index)}
                  />
                )}
              </Router>
            </PauseProvider>
          </TemperatureUnitProvider>
        </PressureUnitProvider>
      </LanguageProvider>
    </MantineProvider>
  );
}

root.render(<App />);
