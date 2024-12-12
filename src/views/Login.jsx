import React, { useEffect, useState } from 'react';
import "../styles/overviewStyles.scss"; 
import { Link } from 'react-router-dom';
import { Input, Button } from '@mantine/core';

import configData from '../config.json'; 

const Login = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [config, setConfig] = useState({ title: '', logoPath: '' });

    useEffect(() => {
        // Set the config state directly from the imported JSON
        setConfig(configData);

        const logoAnimationTimeout = setTimeout(() => {
            setShowLogin(true);
        }, 1000);

        return () => {
            clearTimeout(logoAnimationTimeout);
        };
    }, []);

    // Dynamically load the logo image from src/images
    let logoSrc = null;
    if (config.logoPath) {
        // Using `require()` to dynamically load images from `src/images/`
        logoSrc = require(`../images/${config.logoPath}`);
    }

    return (
        <div className='landingContainer'>
            <div className={`logoContainer ${showLogin ? 'logoExit' : 'logoEnter'}`}>
                {/* Dynamically display the title */}
                <div className="text">{config.title || 'LEOFILIZĀCIJAS ZINĀTNISKĀ LABORATORIJA'}</div>

                {/* Dynamically load the logo */}
                {logoSrc && (
                    <img className="logo" src={logoSrc} alt="Logo" />
                )}
            </div>

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
