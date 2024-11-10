import { useEffect, useRef, useState } from 'react';
import { Button, useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { IconSun, IconMoon, IconPlayerPause, IconPlayerPlay, IconArrowLeft, IconCheck, IconPlayerPlayFilled, IconX, IconRowInsertTop, IconRowInsertBottom, IconTrashXFilled, IconChartSankey, IconHomeFilled, IconLanguage } from '@tabler/icons-react';
import * as d3 from 'd3';
import MainChart from '../components/MainChart';
import SettingsBox from '../components/SettingsBox';
import ChartSettings from '../components/ChartSettings';
import ShelfContainer from '../components/ShelfContainer';
import "../styles/overviewStyles.scss"; // Assuming this contains your styles
import { Link } from 'react-router-dom';
import PressureDisplay from '../components/PressureDisplay';

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
  
  // Set the default time range to '1m'
  const [timeRange, setTimeRange] = useState('1m');
  
  // State to manage the pause state
  const [isPaused, setIsPaused] = useState(false);

  // Function to toggle pause state
  const handlePause = () => {
    console.log("Pausing...");
    setIsPaused(true);
  };

  const handleResume = () => {
    console.log("Resuming...");
    setIsPaused(false);
  };

  // Handle time range change with debug logging
  const handleTimeRangeChange = (range) => {
    console.log('Time range changing to:', range);
    setTimeRange(range);
  };

  // Debug effect to monitor timeRange changes
  useEffect(() => {
    console.log('Current timeRange:', timeRange);
  }, [timeRange]);

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

      <Link to="/SingleProfile">
        <Button className='backButton' variant="transparent" color={buttonColor}>
          <IconArrowLeft stroke={3}></IconArrowLeft>
        </Button>
      </Link>
      
      {isPaused && (
        <div className="pausedScreen">
          <div className="labelBox">
            <div className="pausedLabel">PAUSED</div>
            <button className="resumeButton" onClick={handleResume}>RESUME</button>
          </div>
        </div>
      )}
      
      <div className="chartContainer">
        {/* Debug prop passing */}
        <MainChart 
          timeRange={timeRange} 
          onTimeRangeChange={handleTimeRangeChange}
        />
        
        <div className="button-container">
          {Object.keys(TIME_RANGES).map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              className={`px-4 py-2 rounded width13 ${timeRange === range ? 'active' : ''}`} // Use active class for the selected button
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
        <ChartSettings />
      </div>

      <div className="shelfContainer">
        <ShelfContainer />
      </div>
      
      <div className="shelfContainer2">
        <PressureDisplay/>
      </div>
    </div>
  );
}
