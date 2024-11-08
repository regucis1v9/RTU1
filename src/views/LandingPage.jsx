import React, { useEffect, useState } from 'react';
import "../styles/overviewStyles.scss"; // Custom styles
import logo from "../images/logo2.png";

const LandingPage = () => {
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
        <div className="text">LEOTECH</div>
      </div>

      {/* Login form that appears after 4 seconds */}
      <div className={`loginContainer ${showLogin ? 'showLogin' : ''}`}>
        <input type="text" placeholder="LIETOTĀJVĀRDS" className="loginInput" />
        <input type="password" placeholder="PAROLE" className="loginInput" />
        <button className="loginButton">IELOGOTIES</button>
      </div>
    </div>
  );
};

export default LandingPage;
