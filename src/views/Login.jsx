import React, { useEffect, useState } from 'react';
import "../styles/overviewStyles.scss"; // Custom styles
import { Link } from 'react-router-dom';
import { Input, Button } from '@mantine/core';

// Use the exposed Electron API
const ipcRenderer = window.electron?.ipcRenderer;

const Login = () => {
  const [showLogin, setShowLogin] = useState(false); // To control login form visibility
  const [config, setConfig] = useState({ title: '', logoPath: '' }); // To store title and logo

  useEffect(() => {
    // Request configuration data from Electron
    ipcRenderer?.send('request-config');

    // Listen for configuration data
    ipcRenderer?.on('config-data', (event, data) => {
      console.log('Received config data:', data); // Debug log
      setConfig(data); // Update state with received data
    });

    // Logo animation: delay the login form appearance
    const logoAnimationTimeout = setTimeout(() => {
      setShowLogin(true);
    }, 1000);

    // Cleanup on component unmount
    return () => {
      clearTimeout(logoAnimationTimeout);
      ipcRenderer?.removeAllListeners('config-data'); // Remove listener
    };
  }, []);

  return (
    <div className="landingContainer">
      {/* Logo section */}
      <div className={`logoContainer ${showLogin ? 'logoExit' : 'logoEnter'}`}>
        {config.logoPath ? (
          <img className="logo" src={config.logoPath} alt="Logo" />
        ) : (
          <div className="placeholderLogo">Logo not available</div>
        )}
        <div className="text">
          {config.title || 'LEOFILIZĀCIJAS ZINĀTNISKĀ LABORATORIJA'}
        </div>
      </div>

      {/* Login section */}
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
