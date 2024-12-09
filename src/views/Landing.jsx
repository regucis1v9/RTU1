import {
    AppShell,
    Flex,
    Stack,
    Button,
    ActionIcon,
    Select,
    Group,
    Modal,
    Tabs,
    Text,
    useMantineColorScheme,
    useComputedColorScheme,
    useMantineTheme, Box, Transition, Burger,
} from '@mantine/core';
import React, { useState } from 'react';
import {
    IconTestPipe,
    IconPlayerPlayFilled,
    IconList,
    IconArrowLeft,
    IconChartSankey,
    IconHomeFilled,
    IconLanguage,
    IconSun,
    IconMoon,
    IconHelp,
    IconPencilPlus,
    IconGraph, IconAlertOctagonFilled,
} from '@tabler/icons-react';
import {useDisclosure, useElementSize, useViewportSize} from '@mantine/hooks';
import translations from '../locales/translations';
import { Link } from 'react-router-dom';
import dropdown from "../styles/Dropdown.module.css";
import {useLanguage} from "../context/LanguageContext";
import {usePressureUnit} from "../context/PressureUnitContext";
import {useTemperatureUnit} from "../context/TemperatureUnitContext";
import Header from "../components/Header";

export default function Landing() {
    const { screenHeight, screenWidth } = useViewportSize();
    const [opened, { toggle }] = useDisclosure();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const { ref, width, height } = useElementSize();
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const theme = useMantineTheme();
    const buttonColor = computedColorScheme === 'dark' ? 'white' : 'black';
    const { language, changeLanguage } = useLanguage();
    const { pressureUnit, togglePressureUnit } = usePressureUnit();
    const { temperatureUnit, changeTemperatureUnit } = useTemperatureUnit();
    const t = translations[language] || translations['Latviešu'];
  const iconStyle = { width: 20, height: 20 };

  // Tutorial content for the modal
  const tutorialContent = (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: theme.colors.gray[0], fontSize: '24px' }}>{t.tutorialTitle}</h2>
      
      <Text style={{ color: theme.colors.gray[7], fontSize: '18px' }}>
        {t.tutorialDescription}
      </Text>

      <Text style={{ color: theme.colors.gray[0], fontSize: '21px', fontWeight: 'bold', marginTop: '20px' }}>
        1. {t.tutorialStep1}
      </Text>
      <Text style={{ color: theme.colors.blue[7], fontSize: '16px' }}>
        {t.tutorialStep1Description}
      </Text>

      <Text style={{ color: theme.colors.gray[0], fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>
        2. {t.tutorialStep2}
      </Text>
      <Text style={{ color: theme.colors.blue[7], fontSize: '16px' }}>
        {t.tutorialStep2Description}
      </Text>

      <Text style={{ color: theme.colors.gray[0], fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>
        3. {t.tutorialStep3}
      </Text>
      <Text style={{ color: theme.colors.blue[7], fontSize: '16px' }}>
        {t.tutorialStep3Description}
      </Text>
    </div>
  );

  return (
    <AppShell withBorder={false} header={{ height: 60 }}>
        <Header
            language={language}
            changeLanguage={changeLanguage}
            pressureUnit={pressureUnit}
            togglePressureUnit={togglePressureUnit}
            temperatureUnit={temperatureUnit}
            changeTemperatureUnit={changeTemperatureUnit}
        />
      <AppShell.Main ref={ref}>
        <Flex w={width} h={height} gap="md" justify="center" align="center" direction="row">
          <Link to="/testing">
            <Button color="blue" w={200} h={400} fz={20}>
              <Stack align="center" justify="center" gap="md">
                <IconTestPipe size={50} />
                Testēšana
              </Stack>
            </Button>
          </Link>
          <Link to="/allProfiles">
            <Button color="blue" w={300} h={500} fz={40}>
              <Stack align="center" justify="center" gap="md">
                <IconPlayerPlayFilled size={70} />
                Sākt
              </Stack>
            </Button>
          </Link>
          <Link to="/allProfiles">
            <Button color="blue" w={200} h={400} fz={20}>
              <Stack align="center" justify="center" gap="md">
                <IconList size={50} />
                Profilu saraksts
              </Stack>
            </Button>
          </Link>
        </Flex>
      </AppShell.Main>
      <Modal
        opened={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        title={t.tutorialTitle}
        centered
        size="lg"
      >
        <Tabs variant="outline" defaultValue="gallery">
          <Tabs.List>
            <Tabs.Tab value="gallery" leftSection={<IconPencilPlus style={iconStyle} />}>
              Projekta izveide
            </Tabs.Tab>
            <Tabs.Tab value="messages" leftSection={<IconList style={iconStyle} />}>
              Soļu izveide
            </Tabs.Tab>
            <Tabs.Tab value="settings" leftSection={<IconGraph style={iconStyle} />}>
              Pārskats
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="gallery">{tutorialContent}</Tabs.Panel>
          <Tabs.Panel value="messages">{tutorialContent}</Tabs.Panel>
          <Tabs.Panel value="settings">{tutorialContent}</Tabs.Panel>
        </Tabs>
      </Modal>
    </AppShell>
  );
}
