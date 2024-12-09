import {
    ActionIcon,
    AppShell,
    Box,
    Burger,
    Button,
    Flex,
    Group,
    Modal,
    rem,
    Select,
    Stack,
    Tabs,
    Text,
    Transition,
    useComputedColorScheme,
    useMantineColorScheme,
    useMantineTheme
} from "@mantine/core";
import { Link } from "react-router-dom";
import {
    IconTemperature,
    IconEaseIn,
    IconAlertOctagonFilled,
    IconArrowLeft,
    IconChartSankey,
    IconHomeFilled,
    IconLanguage,
    IconMoon,
    IconPencilPlus,
    IconSun,
    IconHelp,
    IconList,
    IconGraph,
} from "@tabler/icons-react";
import dropdown from "../styles/Dropdown.module.css";
import React, { useState } from "react";
import { useDisclosure, useViewportSize } from "@mantine/hooks";
import translations from "../locales/translations";
import { usePressureUnit } from "../context/PressureUnitContext"; // Import context
import { useTemperatureUnit } from "../context/TemperatureUnitContext"; // Import context

export default function Header({
                                   language,
                                   changeLanguage,
                                   fileName,
                                   pressureUnit,
                                   togglePressureUnit,
                                   temperatureUnit,
                                   changeTemperatureUnit
                               }) {
    const iconStyle = { width: rem(12), height: rem(12) };
    const { screenHeight } = useViewportSize();
    const [opened, { toggle }] = useDisclosure();
    const theme = useMantineTheme();
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const t = translations[language] || translations['Latviešu'];
    const buttonColor = computedColorScheme === 'dark' ? 'white' : 'black';
    const [tutorialOpen, setTutorialOpen] = useState(false);


    // Context values for pressure and temperature units
    const { pressureUnit: contextPressureUnit, togglePressureUnit: contextTogglePressureUnit } = usePressureUnit();
    const { temperatureUnit: contextTemperatureUnit, changeTemperatureUnit: contextChangeTemperatureUnit } = useTemperatureUnit();

    // If the component props are passed, use them, otherwise fallback to context values
    const currentPressureUnit = pressureUnit || contextPressureUnit;
    const currentTemperatureUnit = temperatureUnit || contextTemperatureUnit;
    const currentTogglePressureUnit = togglePressureUnit || contextTogglePressureUnit;
    const currentChangeTemperatureUnit = changeTemperatureUnit || contextChangeTemperatureUnit;

    const tutorialSteps = [
        {
            title: t.tutorialStep1,
            description: t.tutorialStep1Description,
        },
        {
            title: t.tutorialStep2,
            description: t.tutorialStep2Description,
        },
        {
            title: t.tutorialStep3,
            description: t.tutorialStep3Description,
        },
    ];

    const handleLanguageChange = (value) => {
        changeLanguage(value); // Call the passed function to update the language
    };

    const tutorialContent = tutorialSteps.map((step, index) => (
        <div key={index} style={{ marginBottom: 20 }}>
            <Text style={{ color: theme.colors.gray[0], fontSize: '21px', fontWeight: 'bold' }}>
                {step.title}
            </Text>
            <Text style={{ color: theme.colors.blue[7], fontSize: '16px' }}>
                {step.description}
            </Text>
        </div>
    ));

    return (
        <AppShell.Header p={12}>
            <Flex align="center" justify="space-between" w="100%">
                <Link to="/allProfiles">
                    <Button variant="transparent" color={buttonColor}>
                        <IconArrowLeft stroke={3} />
                    </Button>
                </Link>
                <Button color="red" leftSection={<IconAlertOctagonFilled />} rightSection={<IconAlertOctagonFilled />}>
                    STOP
                </Button>
                <Burger opened={opened} variant="transparent" aria-label="Settings" onClick={toggle} style={{ zIndex: 11 }} />
            </Flex>
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
                        <Stack gap={20} align='center'>
                            <Link to="/landing">
                                <Button color={buttonColor} variant="transparent" leftSection={<IconHomeFilled />}>{t.home}</Button>
                            </Link>
                            <Link to={`/overview/${fileName}`}>
                                <Button color={buttonColor} variant="transparent" leftSection={<IconChartSankey />}>{t.graphs}</Button>
                            </Link>
                            <Select
                                leftSection={<IconLanguage size={26} />}
                                variant="filled"
                                label={t.languageLabel}
                                allowDeselect={false}
                                value={language}
                                onChange={handleLanguageChange}
                                data={['Latviešu', 'English']}
                                classNames={dropdown}
                                comboboxProps={{
                                    transitionProps: { transition: 'pop', duration: 200 },
                                    position: 'bottom',
                                    middlewares: { flip: false, shift: false },
                                    offset: 0
                                }}
                            />
                            <Select
                                leftSection={<IconEaseIn size={26} />}
                                variant="filled"
                                label={t.pressureUnitLabel}
                                value={currentPressureUnit}
                                allowDeselect={false}
                                onChange={currentTogglePressureUnit}
                                data={["Torr", "Bar"]}
                                classNames={dropdown}
                                comboboxProps={{
                                    transitionProps: { transition: 'pop', duration: 200 },
                                    position: 'bottom',
                                    middlewares: { flip: false, shift: false },
                                    offset: 0
                                }}
                            />
                            <Select
                                leftSection={<IconTemperature size={26} />}
                                variant="filled"
                                label={t.temperatureUnitLabel}
                                value={currentTemperatureUnit}
                                allowDeselect={false}
                                onChange={currentChangeTemperatureUnit}
                                data={["C", "F", "K"]}
                                classNames={dropdown}
                                comboboxProps={{
                                    transitionProps: { transition: 'pop', duration: 200 },
                                    position: 'bottom',
                                    middlewares: { flip: false, shift: false },
                                    offset: 0
                                }}
                            />
                            <Group>
                                <ActionIcon
                                    onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
                                    variant="default"
                                    size="xl"
                                    aria-label="Toggle color scheme"
                                >
                                    {computedColorScheme === 'light' ? (
                                        <IconMoon stroke={1.5} />
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
                            {t.tutorialTab1}
                        </Tabs.Tab>
                        <Tabs.Tab value="messages" leftSection={<IconList style={iconStyle} />}>
                            {t.tutorialTab2}
                        </Tabs.Tab>
                        <Tabs.Tab value="settings" leftSection={<IconGraph style={iconStyle} />}>
                            {t.tutorialTab3}
                        </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="gallery">
                        {tutorialContent}
                    </Tabs.Panel>
                    <Tabs.Panel value="messages">
                        {tutorialContent}
                    </Tabs.Panel>
                    <Tabs.Panel value="settings">
                        {tutorialContent}
                    </Tabs.Panel>
                </Tabs>
            </Modal>
        </AppShell.Header>
    );
}
