import React, { useEffect, useState } from 'react';
import "../styles/overviewStyles.scss"; // Custom styles
import { Link } from 'react-router-dom';
import { Input, Button } from '@mantine/core';

// Use the exposed API
const ipcRenderer = window.electron?.ipcRenderer;

const Login = () => {
  const [showLogin, setShowLogin] = useState(false); // To control login form visibility
  const [config, setConfig] = useState({ title: '', logoPath: '' }); // To store title and logo

  useEffect(() => {
    // Request the config data
    ipcRenderer?.send('request-config');
  
    // Listen for the config-data event
    ipcRenderer?.on('config-data', (event, data) => {
      console.log('Received config data:', data); // Debug log
      setConfig(data); // Update the config state
    });
  
    const logoAnimationTimeout = setTimeout(() => {
      setShowLogin(true);
    }, 1000);
  
    return () => {
      clearTimeout(logoAnimationTimeout);
      ipcRenderer?.removeAllListeners('config-data'); // Cleanup listener
    };
  }, []);
  
  return (
    <div className="landingContainer">
      <div className={`logoContainer ${showLogin ? 'logoExit' : 'logoEnter'}`}>
        <img className="logo" src={config.logoPath} alt="Logo" />
        <div className="text">
          {config.title || 'LEOFILIZĀCIJAS ZINĀTNISKĀ LABORATORIJA'}
        </div>
      </div>
      <div className={`loginContainer ${showLogin ? 'showLogin' : ''}`}>
        <Input.Wrapper>
          <Input variant="filled" placeholder="Lietotājvārds" size="xl" mb={20} />
        </Input.Wrapper>
        <Input.Wrapper>
          <Input variant="filled" placeholder="Parole" size="xl" mb={20} />
        </Input.Wrapper>
        <Link to="/landing">
          <Button size="md">PIESLĒGTIES</Button>
        </Link>
      </div>
    </div>
  );
};

export default Login;
