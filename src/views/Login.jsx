import React, { useEffect, useState } from 'react';
import "../styles/overviewStyles.scss"; 
import logo from "../images/logo2.png"; // Ensure the logo is correctly imported from the images folder
import { Link } from 'react-router-dom';
import { Input, Button, PasswordInput } from '@mantine/core';

const Login = () => {
  const [showLogin, setShowLogin] = useState(false); 

  useEffect(() => {
    const logoAnimationTimeout = setTimeout(() => {
      setShowLogin(true);
    }, 1000); 

    return () => clearTimeout(logoAnimationTimeout);
  }, []);

  return (
    <div className='landingContainer'>
      <div className={`logoContainer ${showLogin ? 'logoExit' : 'logoEnter'}`}>
        <img className="logo" src={logo} alt="Logo" />
        <div className="text">martins123</div>
      </div>

      <div className={`loginContainer ${showLogin ? 'showLogin' : ''}`}>
        <Input.Wrapper>
          <Input
            variant='filled'
            placeholder="Lietotājvārds"
            size='xl'
            mb={20}
            w={300}
          />
        </Input.Wrapper>
        <PasswordInput
          variant='filled'
          placeholder="Parole"
          size='xl'
          mb={20}
          w={300}
        />
        <Link to="/landing">
          <Button size='md'>PIESLĒGTIES</Button>
        </Link>
      </div>
    </div>
  );
};

export default Login;
