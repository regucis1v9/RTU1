import { useEffect, useRef } from 'react';
import { Button, useMantineColorScheme } from "@mantine/core";
import { IconSun, IconMoon } from '@tabler/icons-react';
import * as d3 from 'd3';

import MainChart from '../components/MainChart';
import SettingsBox from '../components/SettingsBox';
import ChartSettings from '../components/ChartSettings';
import ShelfContainer from '../components/ShelfContainer';

import "../styles/overviewStyles.scss";

const ThemeToggleButton = ({ isDark, toggleColorScheme }) => (
  <Button
    onClick={toggleColorScheme}
    variant="ghost"
    size="icon"
    className="mode-button"
  >
    {isDark ? (
      <IconSun size={20} stroke={1.2} className="light-button" />
    ) : (
      <IconMoon size={20} stroke={1.2} className="dark-button" />
    )}
  </Button>
);

export default function Overview() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <div className={`mainCont ${isDark ? 'dark' : 'light'}`}>
      <ThemeToggleButton 
        isDark={isDark} 
        toggleColorScheme={toggleColorScheme} 
      />
      
      <div className="chartContainer">
        <MainChart />
      </div>

      <div className="settingsContainer">
        <SettingsBox />
        <ChartSettings />
      </div>

      <div className="shelfContainer">
        <ShelfContainer />
      </div>

      <div className="extraContainer" />
    </div>
  );
}