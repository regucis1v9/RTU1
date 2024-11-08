import { AppShell, Flex, Stack, Button, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { useState } from 'react';
import { IconTestPipe, IconPlayerPlayFilled, IconList, IconRowInsertTop, IconRowInsertBottom, IconTrashXFilled, IconChartSankey, IconHomeFilled, IconLanguage, IconSun, IconMoon } from '@tabler/icons-react';
import { useElementSize } from '@mantine/hooks';
import translations from '../locales/translations';
import { Link } from 'react-router-dom';

export default function Landing() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const { ref, width, height } = useElementSize();
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'Latviešu');
  const t = translations[language] || translations['Latviešu']; 


  return (
    <AppShell withBorder={false} header={{ height: 60 }}>
      <AppShell.Main ref={ref}>
        <Flex w={width} h={height} gap="md" justify="center" align="center" direction="row">
            <Link to="/testing">
                <Button color='dark' w={200} h={400} fz={20}>
                    <Stack
                        align="center"
                        justify="center"
                        gap="md">
                        <IconTestPipe size={50}/>
                        Testēšana
                    </Stack>
                </Button>
            </Link>
            <Link to="/allProfiles">
                <Button color='dark' w={300} h={500} fz={40}>
                <Stack
                        align="center"
                        justify="center"
                        gap="md">
                        <IconPlayerPlayFilled size={70}/>
                        Sākt
                    </Stack>
                </Button>
            </Link>
            <Link to="/allProfiles">
                <Button color='dark' w={200} h={400} fz={20}>
                <Stack
                        align="center"
                        justify="center"
                        gap="md">
                        <IconList size={50}/>
                        Profilu saraksts
                    </Stack>
                </Button>
            </Link>
        </Flex>
      </AppShell.Main>
    </AppShell>
  );
}
