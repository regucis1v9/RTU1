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
import alertSound from './sounds/mixkit-industry-alarm-tone-2979.wav';

const root = ReactDOM.createRoot(document.getElementById('root'));

function App() {
  const [alerts, setAlerts] = useState([]);
  const audioRef = useRef(new Audio(alertSound));

  // Fetch alerts from the backend API
  useEffect(() => {
    const checkForAlerts = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/check-alerts');
        console.log(response);  // Log the response
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        setAlerts(data.alerts || []);
      } catch (error) {
        console.error('Error checking for alerts:', error);
      }
    };

    const intervalId = setInterval(checkForAlerts, 5000);
    checkForAlerts();

    return () => clearInterval(intervalId);
  }, []);

  // Function to close and delete alert
  const closeAlert = async (index) => {
    const alertToClose = alerts[index];
    if (!alertToClose) return;
  
    console.log('Attempting to delete alert:', alertToClose);  // Check what's passed
  
    try {
      await fetch('/api/delete-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: alertToClose.id }) // Ensure `alertToClose.id` has the correct value
      });
  
      setAlerts((prevAlerts) => prevAlerts.filter((_, idx) => idx !== index));
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

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
                  <AlertPopup alerts={alerts} onClose={(index) => closeAlert(index)} />
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
