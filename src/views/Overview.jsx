import React, { useState } from 'react';
import {
  Button,
  useMantineColorScheme,
  useComputedColorScheme,
  ActionIcon,
  Switch,
  Select,
  Slider,
  Group,
  Stack,
  Text,
  Drawer
} from "@mantine/core";
import {
  IconAlertOctagonFilled,
  IconSun,
  IconMoon,
  IconArrowLeft,
  IconSettings,
  IconBell,
  IconChartLine,
  IconPalette,
  IconCheck,
  IconTablePlus,
  IconX
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import MainChart from '../components/chart/MainChart';
import Sidebar from '../components/Sidebar';
import PauseButton from '../components/PauseButton';
import '../styles/overviewStyles.scss';
import { usePause } from "../context/PauseContext";

export const TIME_RANGES = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1h': 3600,
  '4h': 14400
};



const SettingsDrawer = ({ opened, onClose, colorScheme, timeRange, onTimeRangeChange }) => {
  const isDark = colorScheme === 'dark';
  const [controls, setControls] = useState({
    spiediens: false,
    ventilators: false,
    saldetajs: false
  });

  const handleControlChange = (control) => {
    setControls(prev => ({
      ...prev,
      [control]: !prev[control]
    }));
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      withCloseButton={false}
      styles={{
        root: { zIndex: 999999 },
        content: {
          backgroundColor: isDark ? '#1A1B1E' : 'white',
          color: isDark ? 'white' : 'black',
          borderRadius: '16px 0 0 16px',
          boxShadow: '-4px 0 15px rgba(0,0,0,0.1)'
        },
        inner: { right: '50%', transform: 'translateX(50%)' },
        body: { height: '100%', display: 'flex', flexDirection: 'column' }
      }}
      transitionProps={{
        transition: 'slide-left',
        duration: 300,
        timingFunction: 'ease'
      }}
    >
      <Stack spacing="lg" p="md" style={{ height: '100%' }}>
        
        <Stack spacing="md" mt="xl">
          <Text size="lg" fw={500} mb="xs">Kontroles</Text>
          
          <Group justify="space-between" align="center">
            <Text>Spiediens</Text>
            <Switch
              checked={controls.spiediens}
              onChange={() => handleControlChange('spiediens')}
              size="lg"
              color="blue"
              thumbIcon={
                controls.spiediens ? (
                  <IconCheck size={12} color={isDark ? '#1A1B1E' : 'white'} stroke={3} />
                ) : (
                  <IconX size={12} color={isDark ? '#1A1B1E' : 'white'} stroke={3} />
                )
              }
            />
          </Group>

          <Group justify="space-between" align="center">
            <Text>Ventilators</Text>
            <Switch
              checked={controls.ventilators}
              onChange={() => handleControlChange('ventilators')}
              size="lg"
              color="blue"
              thumbIcon={
                controls.ventilators ? (
                  <IconCheck size={12} color={isDark ? '#1A1B1E' : 'white'} stroke={3} />
                ) : (
                  <IconX size={12} color={isDark ? '#1A1B1E' : 'white'} stroke={3} />
                )
              }
            />
          </Group>

          <Group justify="space-between" align="center">
            <Text>Saldētājs</Text>
            <Switch
              checked={controls.saldetajs}
              onChange={() => handleControlChange('saldetajs')}
              size="lg"
              color="blue"
              thumbIcon={
                controls.saldetajs ? (
                  <IconCheck size={12} color={isDark ? '#1A1B1E' : 'white'} stroke={3} />
                ) : (
                  <IconX size={12} color={isDark ? '#1A1B1E' : 'white'} stroke={3} />
                )
              }
            />
          </Group>
        </Stack>
      </Stack>
    </Drawer>
  );
};

export default function Overview() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const buttonColor = computedColorScheme === 'dark' ? 'white' : 'black';
  const isDark = colorScheme === 'dark';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('1m'); // Default time range
  const { isPaused, togglePause } = usePause();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleClick = () => togglePause(!isPaused);
  const handleSidebarOpen = () => setIsSidebarOpen(true);
  const handleSidebarClose = () => setIsSidebarOpen(false);
  const handleTimeRangeChange = (range) => {
    if (range !== timeRange) {
      setTimeRange(range);
    }
  };
  const handleSettingsClick = () => setIsSettingsOpen(true);
  const handleSettingsClose = () => setIsSettingsOpen(false);

  return (
    <div className={`mainCont ${isDark ? 'dark' : 'light'}`}>
      <SettingsDrawer
        opened={isSettingsOpen}
        onClose={handleSettingsClose}
        colorScheme={colorScheme}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
      />



      <ActionIcon className="mode3-button" color={"red"} onClick={handleClick}>
        <IconAlertOctagonFilled />
      </ActionIcon>

      <PauseButton />

      <ActionIcon
        className="mode4-button"
        color={"blue"}
        onClick={handleSettingsClick}
        title="Settings"
      >
        <IconSettings />
      </ActionIcon>

      <ActionIcon
        className="mode5-button"
        color={"blue"}
        onClick={handleSidebarOpen}
        title="Sidebar"
      >
        <IconTablePlus />
      </ActionIcon>

      <Link to="/singleProfile/:fileName">
        <Button className='backButton' variant="transparent" color={buttonColor}>
          <IconArrowLeft stroke={3}></IconArrowLeft>
        </Button>
      </Link>

      <div className="chartContainer">
        <MainChart
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
          chartType={'temperature'}
          isPaused={isPaused}
        />
      </div>

      <div className="chartContainerBot">
        <MainChart
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
          chartType={'pressure'}
          isPaused={isPaused}
        />
      </div>

      <div className="chartContainerBot">
        <MainChart
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
          chartType={'temperature2'}
          isPaused={isPaused}
        />
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
    </div>
  );
}
