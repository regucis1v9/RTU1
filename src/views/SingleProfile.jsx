import {
    AppShell,
    useMantineTheme,
    rem,
    Flex,
    Button,
    Table,
    ScrollArea,
    Group,
    Text,
    Input,
    NumberInput,
    Checkbox,
    Stack,
    useMantineColorScheme,
    useComputedColorScheme,
} from '@mantine/core';
import React, { useState, useEffect } from 'react';
import {
    IconCheck,
    IconPlayerPlayFilled,
    IconX,
    IconRowInsertTop,
    IconRowInsertBottom,
    IconTrashXFilled,
} from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { useElementSize, useDisclosure, useViewportSize } from '@mantine/hooks';
import translations from '../locales/translations';
import classes from "../styles/Table.module.css";
import cx from 'clsx';
import { Link, useParams } from 'react-router-dom';
import Header from "../components/Header"
import { useLanguage } from '../context/LanguageContext'; // Importing Language context
import { usePressureUnit } from '../context/PressureUnitContext'; // Importing PressureUnit context
import { useTemperatureUnit } from '../context/TemperatureUnitContext';

const toFahrenheit = (celsius) => (celsius * 9/5) + 32;
const toKelvin = (celsius) => celsius + 273.15;
const fromFahrenheitToCelsius = (fahrenheit) => (fahrenheit - 32) * 5/9;
const fromKelvinToCelsius = (kelvin) => kelvin - 273.15;

export default function SingleProfile() {
    const [startFromRoomTemp, setStartFromRoomTemp] = useState(false);
    const [originalData, setOriginalData] = useState([]);
    const { fileName } = useParams();
    const [projectName, setProjectName] = useState('');
    const theme = useMantineTheme();
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const { ref, width, height } = useElementSize();
    const [scrolled, setScrolled] = useState(false);
    const [data, setData] = useState([
        { step: 1, tMin: 0, tMax: 0, time: 1, tMinUnit: 'C', tMaxUnit: 'C', pressure: 1, shellTemp: 0 }
    ]);
    const { language, changeLanguage } = useLanguage(); // Access language from context
    const { pressureUnit, togglePressureUnit } = usePressureUnit(); // Access pressure unit from context
    const { temperatureUnit, changeTemperatureUnit } = useTemperatureUnit();
    const t = translations[language] || translations['Latviešu'];
    const buttonColor = computedColorScheme === 'dark' ? 'white' : 'black';
    const [totalTime, setTotalTime] = useState(data.reduce((total, row) => total + row.time, 0)); // Initialize total time

    const saveChanges = async () => {
        const updatedData = data.map((row, index) => ({
            step: row.step,
            tMin: index === 0 && startFromRoomTemp ? "istabas" : row.tMin,
            tMax: row.tMax,
            time: row.time,
            pressure: row.pressure,
            tMinUnit: row.tMinUnit,
            tMaxUnit: row.tMaxUnit,
            shellTemp: row.shellTemp,
        }));
        console.log(updatedData);
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
                showNotification({
                    title: "Neveiksmīgi saglabāts profils",
                    message: "Profils netika saglabāts",
                    color: 'red',
                });
                return;
            }

            const result = await response.json();
            showNotification({
                title: "Veiksmīgi saglabāts profils",
                message: "Profils tika saglabāts",
                color: 'green',
            });
        } catch (error) {
            console.error('Failed to save changes:', error);
        }
    };


    // Button click handler for saving changes
    const handleSaveChanges = () => {
        if (!validateData()) {
            showNotification({
                title: "Nepieciešamie lauki",
                message: "Lūdzu, aizpildiet visus laukus pirms saglabāšanas.",
                color: 'red',
            });
            return;
        }
        saveChanges();
    };

    useEffect(() => {
        const fetchCsvData = async () => {
            try {
                const response = await fetch(`http://localhost:5001/get-csv/${fileName}`);
                if (!response.ok) {
                    console.error('Error fetching CSV data');
                    showNotification({
                        autoClose: false,
                        title: "Nevarēja atrast failu" + "  " + fileName+ ".csv",
                        message: "Dodieties atpakaļ un pārliecinaties, ka fails eksistē.",
                        color: 'red',
                    });
                    return;
                }
                const csvData = await response.text();
                const rows = csvData.split('\n').map(row => row.split(','));
                console.log(rows);

                const dataRows = rows.slice(1).map(row => ({
                    step: parseInt(row[0]),
                    tMin: row[1] === 'istabas' ? 'istabas' : parseFloat(row[1]),
                    tMax: parseFloat(row[2]),
                    time: parseInt(row[3]),
                    pressure: parseFloat(row[4]),
                    tMinUnit: row[5],
                    tMaxUnit: row[6],
                    shellTemp: row[7] ? parseFloat(row[7]) : 0, // Add shellTemp with default 0
                }));


                setData(dataRows);
                setOriginalData(JSON.parse(JSON.stringify(dataRows))); // Ensure a deep copy

                // Set StartFromRoomTemp if the first row's tMin is 'istabas'
                if (dataRows.length > 0 && dataRows[0].tMin === 'istabas') {
                    setStartFromRoomTemp(true);
                } else {
                    setStartFromRoomTemp(false);
                }
            } catch (error) {
                console.error('Failed to fetch CSV data:', error);
            }
        };

        if (fileName) {
            fetchCsvData();
        }
    }, [fileName]);

    const validateData = () => {
        for (const row of data) {
            if (
                row.tMin === '' || row.tMax === '' || row.time === '' || row.pressure === '' ||
                row.tMin === null || row.tMax === null || row.time === null || row.pressure === null
            ) {
                return false;
            }
        }
        return true;
    };

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
        showNotification({
            title: "Veiksmīgi pievienots solis",
            message: "Solis tika izveidots",
            color: 'green',
        });
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

        // Update temperature units if they are changed
        if (field === 'tMin' || field === 'tMax') {
            // Convert to the selected temperature unit
            updatedData[index][field] = convertTemperature(value, updatedData[index][`${field}Unit`], temperatureUnit);
        }
        if (field === 'pressure') {
            updatedData[index][field] = convertPressure(value, updatedData[index].pressureUnit, pressureUnit);
        }
        setData(updatedData);
    };



    const convertTemperature = (value, fromUnit, toUnit) => {
        const roundTo = (num) => Math.round(num); 

        if (fromUnit === toUnit) return roundTo(value);

        if (fromUnit === 'C' && toUnit === 'F') return roundTo(toFahrenheit(value));
        if (fromUnit === 'C' && toUnit === 'K') return roundTo(toKelvin(value));
        if (fromUnit === 'F' && toUnit === 'C') return roundTo(fromFahrenheitToCelsius(value));
        if (fromUnit === 'F' && toUnit === 'K') return roundTo(toKelvin(fromFahrenheitToCelsius(value)));
        if (fromUnit === 'K' && toUnit === 'C') return roundTo(fromKelvinToCelsius(value));
        if (fromUnit === 'K' && toUnit === 'F') return roundTo(toFahrenheit(fromKelvinToCelsius(value)));
    };

    const convertPressure = (value, fromUnit, toUnit) => {
        if (fromUnit === toUnit) return value;
        if (fromUnit === 'Torr' && toUnit === 'Bar') return value * 0.00131579;  // Example conversion rate
        if (fromUnit === 'Bar' && toUnit === 'Torr') return value * 760;  // Example conversion rate
        return value;
    };


    const toggleUnitsForAll = () => {
        const newUnit = temperatureUnit === 'C' ? 'F' : temperatureUnit === 'F' ? 'K' : 'C';
        changeTemperatureUnit(newUnit);
        const updatedData = data.map(row => {
            const newRow = { ...row };
            newRow.tMinUnit = newUnit;
            newRow.tMaxUnit = newUnit;
            newRow.tMin = convertTemperature(newRow.tMin, row.tMinUnit, newUnit);
            newRow.tMax = convertTemperature(newRow.tMax, row.tMaxUnit, newUnit);
            newRow.pressure  = 1;
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
        setData(JSON.parse(JSON.stringify(originalData))); // Deep clone to avoid reference issues
        setTotalTime(originalData.reduce((total, row) => total + row.time, 0)); // Reset totalTime
        showNotification({
            title: "Izmaiņas atceltas",
            message: "Izmaiņas atceltas veiksmīgi",
            color: 'green',
        });
    };

    const handleLanguageChange = (newLang) => {
        changeLanguage(newLang); // This will trigger a re-render and change language in all components
    }

    const rows = data.map((row, index) => (
        <Table.Tr key={row.step}>
            <Table.Td ta='center'>{row.step}</Table.Td>
            <Table.Td ta='center'>
                <Group align='center' justify='center' miw={117}>
                    {index === 0 && startFromRoomTemp ? (
                        <Text>Istabas Temp.</Text>
                    ) : (
                        <NumberInput
                            decimalScale={0}
                            w={90}
                            variant="filled"
                            value={convertTemperature(row.tMin, row.tMinUnit, temperatureUnit)}
                            disabled={index === 0 && startFromRoomTemp}
                            onChange={(val) => updateRow(index, 'tMin', val)}
                        />
                    )}
                    {!startFromRoomTemp && <Text>{temperatureUnit}</Text>}
                </Group>
            </Table.Td>
            <Table.Td ta='center'>
                <Group align='center' justify='center' miw={117}>
                    <NumberInput
                        decimalScale={0}
                        w={90}
                        variant="filled"
                        value={convertTemperature(row.tMax, row.tMaxUnit, temperatureUnit)}  // Convert the value to the selected unit
                        onChange={(val) => updateRow(index, 'tMax', val)}
                    />
                    <Text>{temperatureUnit}</Text> {/* Use the current temperature unit for display */}

                </Group>
            </Table.Td>
            <Table.Td ta='center'>
                <Group align='center' justify='center' miw={117}>
                    <NumberInput
                        decimalScale={0}
                        min={1}
                        w={70}
                        clampBehavior="strict"
                        variant="filled" 
                        value={row.time} 
                        onChange={(val) => updateRow(index, 'time', val)}
                    />
                    min
                </Group>
            </Table.Td>
            <Table.Td ta='center'>
                <Group align='center' justify='center' miw={132}>
                    <NumberInput
                        step={0.1}
                        min={0.5}
                        max={100}
                        clampBehavior="strict"
                        w={90}
                        decimalScale={1}
                        variant="filled"
                        value={row.pressure} // Directly use raw state value
                        onChange={(val) => updateRow(index, 'pressure', val)} // Update state directly
                    />
                    <Text>bar</Text>
                </Group>
            </Table.Td>
            <Table.Td ta='center'>
                <Group align='center' justify='center' >
                    <Table.Td ta='center'>
                        <Group align='center' justify='center' miw={117}>
                            <NumberInput
                                step={1}
                                w={90}
                                decimalScale={0}
                                variant="filled"
                                value={row.shellTemp} // Use state value
                                onChange={(val) => updateRow(index, 'shellTemp', val)} // Update state
                            />
                            <Text>{temperatureUnit}</Text> {/* Use the current temperature unit */}
                        </Group>
                    </Table.Td>
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
                    <Header
                        language={language}
                        changeLanguage={changeLanguage}
                        pressureUnit={pressureUnit}
                        togglePressureUnit={togglePressureUnit}
                        temperatureUnit={temperatureUnit}
                        changeTemperatureUnit={changeTemperatureUnit}
                    />
                    <AppShell.Main ref={ref}>
                        <Flex w={width} h={height} gap="md" justify="center" align="center" direction="column">
                            <Group w={width * 0.8} justify='space-between'>
                                <Stack>
                                    <Input.Wrapper label={t.programName} withAsterisk>
                                        <Input
                                            placeholder="..."
                                            variant='filled'
                                            value={fileName} 
                                            onChange={(e) => setProjectName(e.target.value)}
                                        />
                                    </Input.Wrapper>
                                    <Checkbox
                                        checked={startFromRoomTemp}
                                        onChange={(event) => setStartFromRoomTemp(event.currentTarget.checked)}
                                        label="Sākt no istabas temperatūras"
                                    />
                                </Stack>
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
                                            <Table.Th ta="center" >Kondensatora temp.</Table.Th>
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
                </AppShell>
    );
}
