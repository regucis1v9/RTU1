import React from 'react';
import ReactDOM from 'react-dom/client';
import '@mantine/core/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AllProfiles from './views/AllProfiles';
import Overview from './views/Overview';
import Landing from './views/Landing';
import SingleProfile from './views/SingleProfile';
import AlertsTest from './views/AlertsTest';
import Login from './views/Login';
import TestingPage from './views/Testing';
import { Notifications } from '@mantine/notifications';
import LanguageContext, {LanguageProvider} from './context/LanguageContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <MantineProvider>
    <Notifications />
    <LanguageProvider >
      <Router>
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route path="/allProfiles" element={<AllProfiles />} />
          <Route path="/overView/:fileName" element={<Overview />} />
          <Route path="/singleProfile/:fileName" element={<SingleProfile />} />
          <Route path="/" element={<Login />} />
          <Route path="/testing" element={<TestingPage />} />
          
        </Routes>
      </Router>
    </LanguageProvider>
  </MantineProvider>
);
