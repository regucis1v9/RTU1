import React, { useEffect, useState } from 'react';
import "../styles/overviewStyles.scss";
import { Link } from 'react-router-dom';
import { Input, Button } from '@mantine/core';

// Create a safe electron import
const electron = window?.require ? window.require('electron') : null;
const ipcRenderer = electron?.ipcRenderer;

const Login = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [config, setConfig] = useState({
    title: 'Default Title', // Fallback title
    logoPath: '/default-logo.png' // Fallback logo path
  });

  useEffect(() => {
    // Only set up electron listeners if we're in electron environment
    if (ipcRenderer) {
      // Listen for config updates from main process
      ipcRenderer.on('config-data', (event, data) => {
        if (data && (data.title || data.logoPath)) {
          setConfig(prevConfig => ({
            ...prevConfig,
            ...data
          }));
        }
      });

      // Request initial config
      ipcRenderer.send('request-config');
    }

    // Handle logo animation timing
    const logoAnimationTimeout = setTimeout(() => {
      setShowLogin(true);
    }, 1000);

    // Cleanup function
    return () => {
      clearTimeout(logoAnimationTimeout);
      if (ipcRenderer) {
        ipcRenderer.removeAllListeners('config-data');
      }
    };
  }, []);

  // Handle login submission
  const handleLogin = (event) => {
    event.preventDefault();
    // Add your login logic here
    console.log('Login attempted');
  };

  return (
    <div className='landingContainer'>
      <div className={`logoContainer ${showLogin ? 'logoExit' : 'logoEnter'}`}>
        <img 
          className='logo' 
          src={config.logoPath} 
          alt="Logo"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/default-logo.png'; // Fallback if logo fails to load
          }}
        />
        <div className="text">{config.title}</div>
      </div>

      <div className={`loginContainer ${showLogin ? 'showLogin' : ''}`}>
        <form onSubmit={handleLogin}>
          <Input.Wrapper>
            <Input
              variant='filled'
              placeholder="Lietotājvārds"
              size='xl'
              mb={20}
              required
            />
          </Input.Wrapper>
          <Input.Wrapper>
            <Input
              variant='filled'
              placeholder="Parole"
              type="password"
              size='xl'
              mb={20}
              required
            />
          </Input.Wrapper>
          <Link to="/landing">
            <Button size='md' type="submit">PIESLĒGTIES</Button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Login;
