// src/views/Overview.jsx

import React, { useEffect, useState } from 'react';
import { Button, useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { 
  IconSun, 
  IconMoon, 
  IconPlayerPause, 
  IconPlayerPlay, 
  IconArrowLeft 
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import MainChart from '../components/chart/MainChart';
import SettingsBox from '../components/chart/SettingsBox';
import ChartSettings from '../components/chart/ChartSettings';
import ShelfContainer from '../components/chart/ShelfContainer';
import PressureDisplay from '../components/chart/PressureDisplay';
import Sidebar from '../components/Sidebar';
import '../styles/overviewStyles.scss';

// Export TIME_RANGES so it can be imported by MainChart
export const TIME_RANGES = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1h': 3600,
  '4h': 14400
};

const ThemeToggleButton = ({ isDark, toggleColorScheme }) => (
  <Button
    onClick={toggleColorScheme}
    variant="ghost"
    size="icon"
    className="mode2-button"
  >
    {isDark ? (
      <IconSun size={20} stroke={1.2} className="light-button" />
    ) : (
      <IconMoon size={20} stroke={1.2} className="dark-button" />
    )}
  </Button>
);

const PauseButton = ({ isPaused, handlePause, handleResume }) => {
  return (
    <Button
      onClick={isPaused ? handleResume : handlePause}
      variant="subtle"
      size="sm"
      className="pauseButton"
    >
      {isPaused ? (
        <IconPlayerPlay size={20} stroke={1.5} />
      ) : (
        <IconPlayerPause size={20} stroke={1.5} />
      )}
    </Button>
  );
};

export default function Overview() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const buttonColor = computedColorScheme === 'dark' ? 'white' : 'black';
  const isDark = colorScheme === 'dark';

  // State hooks must be inside the component
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state
  const [timeRange, setTimeRange] = useState('1m');
  const [isPaused, setIsPaused] = useState(false);
  const [chartType, setChartType] = useState('temperature');

  // Handlers must be inside the component to access state
  const handleChartTypeChange = (type) => {
    console.log('Changing chart type to:', type);
    setChartType(type);
  };

  const handleSidebarOpen = () => {
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handlePause = () => {
    console.log("Pausing...");
    setIsPaused(true);
  };

  const handleResume = () => {
    console.log("Resuming...");
    setIsPaused(false);
  };

  const handleTimeRangeChange = (range) => {
    console.log('Time range changing to:', range);
    setTimeRange(range);
  };

  useEffect(() => {
    console.log('Current timeRange:', timeRange);
    console.log('Current chartType:', chartType);
  }, [timeRange, chartType]);

  return (
    <div className={`mainCont ${isDark ? 'dark' : 'light'}`}>
      <ThemeToggleButton
        className="mode2-button"
        isDark={isDark}
        toggleColorScheme={toggleColorScheme}
      />
      
      <PauseButton
        isPaused={isPaused}
        handlePause={handlePause}
        handleResume={handleResume}
      />

      <Link to="/singleProfile/:fileName">
        <Button className='backButton' variant="transparent" color={buttonColor}>
          <IconArrowLeft stroke={3}></IconArrowLeft>
        </Button>
      </Link>
      
      {isPaused && (
        <div className="pausedScreen">
          <div className="labelBox">
            <div className="pausedLabel">APSTĀDINĀTS</div>
            <button className="resumeButton" onClick={handleResume}>TURPINĀT</button>
          </div>
        </div>
      )}
      
      <div className="chartContainer">
        <MainChart 
          timeRange={timeRange} 
          onTimeRangeChange={handleTimeRangeChange}
          chartType={chartType}
          isPaused={isPaused}
        />
        
        <div className="button-container">
          {Object.keys(TIME_RANGES).map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              className={`px-4 py-2 rounded width13 ${timeRange === range ? 'active' : ''}`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      
      <div className="settingsContainer">
        <SettingsBox />
      </div>
      
      <div className="settingsContainer">
        <ChartSettings
          onChartTypeChange={handleChartTypeChange}
          onExtraButtonClick={handleSidebarOpen} // Pass handler to ChartSettings
        />
      </div>

      {/* Render Sidebar at the top level of Overview */}
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
      
      <div className="shelfContainer">
        <ShelfContainer />
      </div>
      
      <div className="shelfContainer2">
        <PressureDisplay isPaused={isPaused} />
      </div>
    </div>
  );
}
