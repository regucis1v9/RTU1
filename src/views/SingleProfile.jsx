import { AppShell, Burger, Transition, Paper, Stack, useMantineTheme, rem, Tabs, Modal, Flex, Button, Table, ScrollArea, Group, Text, Input, NumberInput, Select, ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import React, { useState, useEffect } from 'react';
import {
    IconGraph,
    IconList,
    IconPencilPlus,
    IconHelp,
    IconArrowLeft,
    IconCheck,
    IconPlayerPlayFilled,
    IconX,
    IconRowInsertTop,
    IconRowInsertBottom,
    IconTrashXFilled,
    IconChartSankey,
    IconHomeFilled,
    IconLanguage,
    IconSun,
    IconMoon,
    IconAlertOctagonFilled
} from '@tabler/icons-react';
import { useElementSize, useDisclosure, useViewportSize } from '@mantine/hooks';
import translations from '../locales/translations';
import classes from "../styles/Table.module.css";
import dropdown from "../styles/Dropdown.module.css";
import cx from 'clsx';
import { Link, useParams } from 'react-router-dom';

const toFahrenheit = (celsius) => (celsius * 9/5) + 32;
const toKelvin = (celsius) => celsius + 273.15;
const fromFahrenheitToCelsius = (fahrenheit) => (fahrenheit - 32) * 5/9;
const fromKelvinToCelsius = (kelvin) => kelvin - 273.15;

export default function SingleProfile() {
    const { screenHeight, screenWidth } = useViewportSize();
    const [opened, { toggle }] = useDisclosure();
    const [originalData, setOriginalData] = useState([]);
    const { fileName } = useParams();
    const [projectName, setProjectName] = useState('');
    const theme = useMantineTheme();
    const iconStyle = { width: rem(12), height: rem(12) };
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const { ref, width, height } = useElementSize();
    const [scrolled, setScrolled] = useState(false);
    const [data, setData] = useState([{ step: 1, tMin: 0, tMax: 0, time: 1, tMinUnit: 'C', tMaxUnit: 'C',pressure: 1 }]);
    const [temperatureUnit, setTemperatureUnit] = useState('C');
    const [language, setLanguage] = useState(localStorage.getItem('lang') || 'Latviešu');
    const t = translations[language] || translations['Latviešu'];
    const buttonColor = computedColorScheme === 'dark' ? 'white' : 'black';
    const [tutorialOpen, setTutorialOpen] = useState(false);
    const [totalTime, setTotalTime] = useState(data.reduce((total, row) => total + row.time, 0)); // Initialize total time

    const handleLanguageChange = (value) => {
        setLanguage(value);
        localStorage.setItem('lang', value);
    };
    const saveChanges = async () => {
        const updatedData = data.map((row) => ({
            step: row.step,
            tMin: row.tMin,
            tMax: row.tMax,
            time: row.time,
            pressure: row.pressure,
            tMinUnit: row.tMinUnit,
            tMaxUnit: row.tMaxUnit
        }));
        console.log(updatedData)
        try {
            const response = await fetch(`http://localhost:5001/updateFile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName: fileName,
                    data: updatedData
                }),
            });

            if (!response.ok) {
                console.error('Error saving changes');
                return;
            }

            const result = await response.json();
            console.log('Save success:', result);
        } catch (error) {
            console.error('Failed to save changes:', error);
        }
    };

    // Button click handler for saving changes
    const handleSaveChanges = () => {
        saveChanges();
    };
    useEffect(() => {
        const fetchCsvData = async () => {
            try {
                const response = await fetch(`http://localhost:5001/get-csv/${fileName}`);
                if (!response.ok) {
                    console.error('Error fetching CSV data');
                    return;
                }
                const csvData = await response.text();
                console.log('CSV Data:', csvData);

                const rows = csvData.split('\n').map(row => row.split(','));

                // Skip the first row (header) and process the rest
                const dataRows = rows.slice(1).map(row => ({
                    step: parseInt(row[0]),
                    tMin: parseFloat(row[1]),
                    tMax: parseFloat(row[2]),
                    time: parseInt(row[3]),
                    pressure:parseInt(row[4]),
                    tMinUnit: row[5],
                    tMaxUnit: row[6],
                }));

                setData(dataRows);
                setOriginalData(dataRows); // Store the initial fetched data
            } catch (error) {
                console.error('Failed to fetch CSV data:', error);
            }
        };

        if (fileName) {
            fetchCsvData();
        }
    }, [fileName]);

    const addRow = (index, position) => {
        // Create a new row
        const newRow = {
            step: data.length + 1,
            tMin: position === 'below' && index < data.length ? data[index].tMax : 0, // Set TMin to TMax of the previous row if it's 'below'
            tMax: 0,
            time: 1,
            pressure: 1,
            tMinUnit: temperatureUnit,
            tMaxUnit: temperatureUnit
        };

        const newData = [...data];

        if (position === 'above') {
            newData.splice(index, 0, newRow);
        } else if (position === 'below') {
            newData.splice(index + 1, 0, newRow);  // Insert the new row below the current row
        }

        // Recalculate step numbers
        newData.forEach((row, i) => row.step = i + 1);

        // Update the state with the new data
        setData(newData);

        // Update the total time
        setTotalTime(totalTime + newRow.time);
    };


    const removeRow = (index) => {
        if (data.length > 1) {
            const rowTime = data[index].time; // Capture time of row being removed
            const newData = data.filter((_, i) => i !== index);
            newData.forEach((row, i) => (row.step = i + 1));
            setData(newData);
            setTotalTime(totalTime - rowTime); // Update totalTime
        }
    };

    const updateRow = (index, field, value) => {
        const updatedData = [...data];

        if (field === 'time') {
            const previousTime = updatedData[index][field];
            setTotalTime(totalTime - previousTime + value); // Update totalTime
        }

        // Update the current row's field with the new value
        updatedData[index][field] = value;

        // If updating tMax, set the next row's tMin to this tMax
        if (field === 'tMax' && index < updatedData.length - 1) {
            updatedData[index + 1].tMin = value;
        }

        setData(updatedData);
    };


    const convertTemperature = (value, fromUnit, toUnit) => {
        if (fromUnit === toUnit) return value;
        if (fromUnit === 'C' && toUnit === 'F') return toFahrenheit(value);
        if (fromUnit === 'C' && toUnit === 'K') return toKelvin(value);
        if (fromUnit === 'F' && toUnit === 'C') return fromFahrenheitToCelsius(value);
        if (fromUnit === 'F' && toUnit === 'K') return toKelvin(fromFahrenheitToCelsius(value));
        if (fromUnit === 'K' && toUnit === 'C') return fromKelvinToCelsius(value);
        if (fromUnit === 'K' && toUnit === 'F') return toFahrenheit(fromKelvinToCelsius(value));
    };

    const toggleUnitsForAll = () => {
        const newUnit = temperatureUnit === 'C' ? 'F' : temperatureUnit === 'F' ? 'K' : 'C';
        setTemperatureUnit(newUnit);
        const updatedData = data.map(row => {
            const newRow = { ...row };
            newRow.tMinUnit = newUnit;
            newRow.tMaxUnit = newUnit;
            newRow.tMin = convertTemperature(newRow.tMin, row.tMinUnit, newUnit);
            newRow.tMax = convertTemperature(newRow.tMax, row.tMaxUnit, newUnit);
            return newRow;
        });
        setData(updatedData);
    };

    const formatTimeDuration = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return hours > 0 ? `${hours}h ${minutes} min` : `${minutes} min`;
    };

    const totalProgramTime = data.reduce((total, row) => total + row.time, 0);
    const formattedProgramTime = formatTimeDuration(totalProgramTime);

    const cancelChanges = () => {
        setData([...originalData]); // Reset data to the original state
        setTotalTime(originalData.reduce((total, row) => total + row.time, 0)); // Reset totalTime to the original value
    };

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

    const rows = data.map((row, index) => (
        <Table.Tr key={row.step}>
            <Table.Td ta='center'>{row.step}</Table.Td>
            <Table.Td ta='center'>
                <Group align='center' justify='center'>
                    <NumberInput w={90} variant="filled" value={row.tMin} onChange={(val) => updateRow(index, 'tMin', val)} />
                    <Text>{row.tMinUnit}</Text>
                </Group>
            </Table.Td>
            <Table.Td ta='center'>
                <Group align='center' justify='center'>
                    <NumberInput w={90} variant="filled" value={row.tMax} onChange={(val) => updateRow(index, 'tMax', val)} />
                    <Text>{row.tMaxUnit}</Text>
                </Group>
            </Table.Td>
            <Table.Td ta='center'>
                <Group align='center' justify='center'>
                    <NumberInput min={1} w={70} variant="filled" value={row.time} onChange={(val) => updateRow(index, 'time', val)} />
                    min
                </Group>
            </Table.Td>
            <Table.Td ta='center'>
                <Group align='center' justify='center'>
                    <NumberInput w={90} variant="filled" value={row.pressure} onChange={(val) => updateRow(index, 'pressure', val)} />
                    <Text>bar</Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <Group align='center' justify='center' miw={235}>
                    <Button color="blue" size="xs" variant='transparent' onClick={() => addRow(index, 'above')}>
                        <IconRowInsertTop stroke={2} size={40}/>
                    </Button>
                    <Button color="blue" size="xs" variant='transparent' onClick={() => addRow(index, 'below')}>
                        <IconRowInsertBottom stroke={2} size={40}/>
                    </Button>
                    <Button color="red" size="xs" variant='transparent' onClick={() => removeRow(index)}>
                        <IconTrashXFilled stroke={2} size={30}/>
                    </Button>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <AppShell withBorder={false} header={{ height: 60 }}>
            <AppShell.Header p={12}>
                <Flex align="center" justify="space-between" w="100%">
                    <Link to="/allProfiles">
                        <Button variant="transparent" color={buttonColor}>
                            <IconArrowLeft stroke={3}></IconArrowLeft>
                        </Button>
                    </Link>
                    <Group visibleFrom='sm'>
                        <Link to="/landing">
                            <Button color={buttonColor} variant="transparent" leftSection={<IconHomeFilled />}> {t.home} </Button>
                        </Link>
                        <Button color="red" leftSection={<IconAlertOctagonFilled/>} rightSection={<IconAlertOctagonFilled/>}>
                            STOP
                        </Button>
                        <Link to={`/overview/${fileName}`}>
                            <Button color={buttonColor} variant="transparent" leftSection={<IconChartSankey />}> {t.graphs}</Button>
                        </Link>
                    </Group>
                    <Group visibleFrom='sm'>
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
                    </Group>
                    <Burger hiddenFrom='sm' opened={opened} onClick={toggle} aria-label="Toggle navigation" style={{ zIndex: 11 }}></Burger>
                </Flex>
                <Transition
                    mounted={opened}
                    transition="slide-left"
                    duration={400}
                    timingFunction="ease"
                    hiddenFrom="sm"
                >
                    {(transitionStyle) => (
                        <Paper
                            hiddenFrom="sm"
                            shadow="md"
                            p="xl"
                            pos="absolute"
                            top={0}
                            left={0}
                            right={0}
                            h={screenHeight}
                            w={screenWidth}
                            style={{ ...transitionStyle, zIndex: 10, height: '100vh' }}
                        >
                            <Stack
                                gap={20}
                                align='center'
                            >
                                <Link to="/landing">
                                    <Button color={buttonColor} variant="transparent" leftSection={<IconHomeFilled />}> {t.home} </Button>
                                </Link>
                                <Link to={`/overview/${fileName}`}>
                                    <Button color={buttonColor} variant="transparent" leftSection={<IconChartSankey />}> {t.graphs}</Button>
                                </Link>
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
                            </Stack>
                        </Paper>
                    )}
                </Transition>
            </AppShell.Header>
            <AppShell.Main ref={ref}>
                <Flex w={width} h={height} gap="md" justify="center" align="center" direction="column">
                    <Group w={width * 0.8} justify='space-between'>
                        <Input.Wrapper label={t.programName} withAsterisk>
                            <Input placeholder="..." variant='filled' value={fileName} onChange={(e) => setProjectName(e.target.value)}/>
                        </Input.Wrapper>
                        <Group>
                            <Button onClick={cancelChanges} rightSection={<IconX size={16} />} color='red'>{t.cancelChanges}</Button>
                            <Button onClick={handleSaveChanges} rightSection={<IconCheck size={16} />}>{t.saveChanges}</Button>
                        </Group>
                    </Group>
                    <ScrollArea h={height * 0.7} w={width * 0.8} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
                        <Table miw={700}>
                            <Table.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
                                <Table.Tr>
                                    <Table.Th ta="center">{t.step}</Table.Th>
                                    <Table.Th ta="center" onClick={toggleUnitsForAll}>{t.tMin}</Table.Th>
                                    <Table.Th ta="center" onClick={toggleUnitsForAll}>{t.tMax}</Table.Th>
                                    <Table.Th ta="center">{t.time}</Table.Th>
                                    <Table.Th ta="center">{t.pressure}</Table.Th>
                                    <Table.Th ta="center">{t.rowActions}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>{rows}</Table.Tbody>
                        </Table>
                    </ScrollArea>
                    <Group w={width * 0.8} justify='space-between'>
                        <Text>{t.totalProgramTime} {formattedProgramTime}</Text>
                        <Button rightSection={<IconPlayerPlayFilled size={20} />} >{t.startProgram}</Button>
                    </Group>
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
                            Pārksats
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
        </AppShell>
    );
}
