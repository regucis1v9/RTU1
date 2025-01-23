import React, { useEffect, useState } from 'react';
import "../styles/overviewStyles.scss";
import { Link } from 'react-router-dom';
import { TextInput, Button, PasswordInput, Input } from '@mantine/core'; // Import TextInput instead of Input
import configData from '../config.json';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';

const Login = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [config, setConfig] = useState({ title: '', logoPath: '' });
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passworError, setPassworError] = useState('');
    const navigate = useNavigate();

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
    
    let logoSrc = null;
    if (config.logoPath) {
        logoSrc = require(`../images/${config.logoPath}`);
    }
    const executeProgramStart = async () => {
        try {
            const response = await fetch('http://localhost:5001/run-script', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error(`Failed to start program: ${response.statusText}`);
            }

            const result = await response.json();
            showNotification({
                title: 'Paziņojums no programmas',
                message: `Programma palaista veiksmīgi`,
                color: 'green',
            });
            navigate("/overviewMain/asd");
        } catch (error) {
            console.error('Error starting program:', error);
            showNotification({
                title: 'Failed to Start Program',
                message: 'Unable to execute the script. Please check the server.',
                color: 'red',
            });
        }
    };
    const handleLogin = async () => {
        // Construct the body object for the POST request
        const body = JSON.stringify({
            username: username,
            password: password,
        });
        setUsernameError(false)
        setPassworError(false)
        try {
            const response = await fetch('http://localhost:5001/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body,
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Login successful:', data);
                await executeProgramStart()
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
                navigate("/allProfiles")
            } else {
                console.error('Login failed:', data.message);
                if(data.message === "Incorrect password"){
                    setPassworError(data.message);
                }
                if(data.message === "User not found"){
                    setUsernameError(data.message);
                }
            }
        } catch (error) {
            console.error('Error during login request:', error);
        }
    };

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
                    <TextInput
                        variant='filled'
                        placeholder="Lietotājvārds"
                        size='xl'
                        pb={30}
                        w={300}
                        error={usernameError}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} // Capture username input
                    />
                <Input.Wrapper w={300}>
                    <PasswordInput
                        variant='filled'
                        placeholder="Parole"
                        size='xl'
                        mb={20}
                        value={password}
                        error={passworError}
                        onChange={(e) => setPassword(e.target.value)} // Capture password input
                    />
                </Input.Wrapper>
                <Button size='md' onClick={handleLogin}>PIESLĒGTIES</Button>
            </div>
        </div>
    );
};

export default Login;
