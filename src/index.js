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
import TestingPage from './views/Testing';
import { Notifications } from '@mantine/notifications';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <MantineProvider>
    <Notifications />
    <Router>
      <Routes>
        <Route path="/" element={<AllProfiles />} />
        <Route path="/overView" element={<Overview />} />
        <Route path="/SingleProfile" element={<SingleProfile />} />
        <Route path="/Test" element={<AlertsTest />} />
        <Route path="/Landing" element={<LandingPage />} />
        <Route path="/Testing" element={<TestingPage />} />

      </Routes>
    </Router>
  </MantineProvider>
);