import React from 'react';
import ReactDOM from 'react-dom/client';
import '@mantine/core/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AllProfiles from './views/AllProfiles';
import Overview from './views/Overview';
import SingleProfile from './views/SingleProfile';
import AlertsTest from './views/AlertsTest';
import LandingPage from './views/LandingPage';

const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <MantineProvider 
    theme={theme}
    defaultColorScheme="dark"
    withGlobalStyles
    withNormalizeCSS
  >
    <Router>
      <Routes>
        <Route path="/" element={<AllProfiles />} />
        <Route path="/overView" element={<Overview />} />
        <Route path="/SingleProfile" element={<SingleProfile />} />
        <Route path="/Test" element={<AlertsTest />} />
        <Route path="/Landing" element={<LandingPage />} />

      </Routes>
    </Router>
  </MantineProvider>
);