import React from 'react';
import ReactDOM from 'react-dom/client';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AllProfiles from './views/AllProfiles';
import Overview from './views/Overview';
import SingleProfile from './views/SingleProfile';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <MantineProvider>
    <Router>
      <Routes>
        <Route path="/" element={<AllProfiles />} />
        <Route path="/overView" element={<Overview />} />
        <Route path="/SingleProfile" element={<SingleProfile />} />
      </Routes>
    </Router>
  </MantineProvider>
);

