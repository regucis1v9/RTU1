import React, { useEffect, useState } from 'react';
import "../styles/overviewStyles.scss"; // Custom styles
import logo from "../images/logo2.png";
import { Link } from 'react-router-dom';
import { Input, Button } from '@mantine/core';
const Login = () => {
  const [showLogin, setShowLogin] = useState(false); // To control login form visibility

  useEffect(() => {
    // Set timeout to trigger login form after logo animation completes
    const logoAnimationTimeout = setTimeout(() => {
      setShowLogin(true);
    }, 1000); // 4 seconds for logo animation

    return () => clearTimeout(logoAnimationTimeout);
  }, []);

  return (
    <div className='landingContainer'>
      {/* Logo container that animates from the bottom to the top */}
      <div className={`logoContainer ${showLogin ? 'logoExit' : 'logoEnter'}`}>
        <img className='logo' src={logo} alt="Logo" />
        <div className="text">LIOFILIZĀCIJAS ZINĀTNISKĀ LABORATORIJA</div>
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
