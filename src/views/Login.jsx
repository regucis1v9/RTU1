import React, { useEffect, useState } from 'react';
import "../styles/overviewStyles.scss"; // Custom styles
import { Link } from 'react-router-dom';
import { Input, Button } from '@mantine/core';

// Using the safe Electron API exposed by preload.js
const Login = () => {
  const [showLogin, setShowLogin] = useState(false); // To control login form visibility
  const [config, setConfig] = useState({ title: '', logoPath: '' }); // To store title and logo

  // Load config data from Electron
  useEffect(() => {
    // Listen for the config update from Electron's main process
    window.electron.onConfigData((event, data) => {
      setConfig(data); // Update the config state
    });

    // Set timeout to trigger login form after logo animation completes
    const logoAnimationTimeout = setTimeout(() => {
      setShowLogin(true);
    }, 1000); // 1 second for logo animation

    return () => {
      clearTimeout(logoAnimationTimeout);
    };
  }, []);

  return (
    <div className='landingContainer'>
      {/* Logo container that animates from the bottom to the top */}
      <div className={`logoContainer ${showLogin ? 'logoExit' : 'logoEnter'}`}>
        {/* Dynamically set the src and text from config */}
        <img className='logo' src={config.logoPath} alt="Logo" />
        <div className="text">{config.title || 'LEOFILIZĀCIJAS ZINĀTNISKĀ LABORATORIJA'}</div>
      </div>

      {/* Login form that appears after 4 seconds */}
      <div className={`loginContainer ${showLogin ? 'showLogin' : ''}`}>
        <Input.Wrapper>
          <Input
            variant='filled'
            placeholder="Lietotājvārds"
            size='xl'
            mb={20}
          />
        </Input.Wrapper>
        <Input.Wrapper>
          <Input
            variant='filled'
            placeholder="Parole"
            size='xl'
            mb={20}
          />
        </Input.Wrapper>
        <Link to="/landing">
          <Button size='md'>PIESLĒGTIES</Button>
        </Link>
      </div>
    </div>
  );
};

export default Login;
