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

export default function Landing() {
    const { screenHeight, screenWidth } = useViewportSize();
    const [opened, { toggle }] = useDisclosure();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const { ref, width, height } = useElementSize();
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'Latviešu');
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const t = translations[language] || translations['Latviešu'];
  const theme = useMantineTheme();
    const buttonColor = computedColorScheme === 'dark' ? 'white' : 'black';

  const handleLanguageChange = (value) => {
    setLanguage(value);
    localStorage.setItem('lang', value);
  };

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
      <AppShell.Header p={12}>
        <Flex align="center" justify="space-between" w="100%">
          <Link to="/">
              <Button variant="transparent" color={buttonColor}>
                  <IconArrowLeft stroke={3}></IconArrowLeft>
              </Button>
          </Link>
            <Button color="red" leftSection={<IconAlertOctagonFilled/>} rightSection={<IconAlertOctagonFilled/>}>
                STOP
            </Button>
            <Burger opened={opened} variant="transparent" aria-label="Settings" onClick={toggle} aria-label="Toggle navigation" style={{ zIndex: 11 }}>
            </Burger>
            <Transition
                mounted={opened}
                transition="slide-left"
                duration={400}
                timingFunction="ease"
            >
                {(transitionStyle) => (
                    <Box
                        shadow="md"
                        p="xl"
                        pos="absolute"
                        top={0}
                        right={0}
                        style={{
                            ...transitionStyle,
                            backgroundColor: computedColorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[1],
                            zIndex: 10,
                            height: '100vh',
                        }}
                        w={320}
                        h={screenHeight}
                    >
                        <Stack
                            gap={20}
                            align='center'
                        >
                            <Select
                                leftSection={<IconLanguage size={26} />}
                                variant='unstyled'
                                allowDeselect={false}
                                value={language}
                                onChange={handleLanguageChange}
                                data={['Latviešu', 'English']}
                                classNames={dropdown}
                                comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 }, position: 'bottom', middlewares: { flip: false, shift: false }, offset: 0 } }
                            />
                            <Group>
                                <ActionIcon
                                    onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
                                    variant="default"
                                    size="xl"
                                    aria-label="Toggle color scheme"
                                >
                                    {computedColorScheme === 'light' ? (
                                        <IconMoon  stroke={1.5} />
                                    ) : (
                                        <IconSun stroke={1.5} />
                                    )}
                                </ActionIcon>
                                <ActionIcon
                                    onClick={() => setTutorialOpen(true)}
                                    variant="default"
                                    size="xl"
                                    aria-label="Show Tutorial"
                                >
                                    <IconHelp stroke={1.5} />
                                </ActionIcon>
                            </Group>
                        </Stack>
                    </Box>
                )}
            </Transition>
            
        </Flex>
      </AppShell.Header>

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
