import React, { useEffect, useState } from 'react';
import {Button, useMantineColorScheme, useComputedColorScheme, ActionIcon} from "@mantine/core";
import {
    IconAlertOctagonFilled,
  IconSun, 
  IconMoon,
  IconArrowLeft 
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import MainChart from '../components/chart/MainChart';
import SettingsBox from '../components/chart/SettingsBox';
import ChartSettings from '../components/chart/ChartSettings';
import Sidebar from '../components/Sidebar';
import PauseButton from '../components/PauseButton';
import styles from '../styles/overviewStyles2.scss';
import Overview from './Overview';
import Overview2 from './Overview2';

import Terminal from '../components/chart/Terminal';
import {usePause} from "../context/PauseContext";

export default function OverviewMain() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const buttonColor = computedColorScheme === 'dark' ? 'white' : 'black';
  const isDark = colorScheme === 'dark';

  

  return (
    <div className="o-container">
        <Overview/>
        <Overview2/>
    </div>
  );
}
