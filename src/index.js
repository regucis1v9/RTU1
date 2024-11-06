import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SingleProfile from './views/SingleProfile';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <MantineProvider>
    <Router>
      <Routes>
        <Route path="/" element={<SingleProfile />} />
      </Routes>
    </Router>
  </MantineProvider>
);

