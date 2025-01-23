import React, { useEffect, useState } from 'react';
import { Button, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import Overview from './Overview';
import Overview2 from './Overview2';

export default function OverviewMain() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <div className="o-container">
      <div className="theme-toggle-wrapper">
        <ThemeToggleButton isDark={isDark} toggleColorScheme={toggleColorScheme} />
      </div>
      <Overview colorScheme={colorScheme} toggleColorScheme={toggleColorScheme} />
      <Overview2 colorScheme={colorScheme} toggleColorScheme={toggleColorScheme} />
    </div>
  );
}

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
