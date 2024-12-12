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
    const [originalData, setOriginalData] = useState([]);
    const { fileName } = useParams();
    const [projectName, setProjectName] = useState('');
    const theme = useMantineTheme();
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const { ref, width, height } = useElementSize();
    const [scrolled, setScrolled] = useState(false);
    const [data, setData] = useState([{ step: 1, tMin: 0, tMax: 0, time: 1, tMinUnit: 'C', tMaxUnit: 'C',pressure: 1 }]);
    const { language, changeLanguage } = useLanguage(); // Access language from context
    const { pressureUnit, togglePressureUnit } = usePressureUnit(); // Access pressure unit from context
    const { temperatureUnit, changeTemperatureUnit } = useTemperatureUnit();
    const t = translations[language] || translations['Latviešu'];
    const buttonColor = computedColorScheme === 'dark' ? 'white' : 'black';
    const [totalTime, setTotalTime] = useState(data.reduce((total, row) => total + row.time, 0)); // Initialize total time
    const [editedFileName, setEditedFileName] = useState(fileName); // Local state for file name

    const renameFile = async () => {
        try {
            const response = await fetch(`http://localhost:5001/renameFile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldFileName: fileName,
                    newFileName: editedFileName,
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error renaming file:', errorData);
                showNotification({
                    title: t.renameFailed,
                    message: t.fileNotRenamed,
                    color: 'red',
                });
                return false;
            }
    
            const result = await response.json();
            console.log('Rename success:', result);
            
            // Update the local state and URL
            const newFileName = result.newFileName;
            setProjectName(editedFileName);
            
            // Update the URL without reloading the page
            window.history.replaceState(null, '', `/profile/${newFileName}`);
    
            showNotification({
                title: t.renameSuccess,
                message: t.fileRenamed,
                color: 'green',
            });
    
            // Return the new filename
            return newFileName;
        } catch (error) {
            console.error('Failed to rename file:', error);
            showNotification({
                title: t.error,
                message: t.fileRenameError,
                color: 'red',
            });
            return false;
        }
    };
    
    const saveChanges = async (fileNameToUse) => {
        const updatedData = data.map((row) => ({
            step: row.step,
            tMin: row.tMin,
            tMax: row.tMax,
            time: row.time,
            pressure: row.pressure,
            tMinUnit: row.tMinUnit,
            tMaxUnit: row.tMaxUnit
        }));
    
        try {
            const response = await fetch(`http://localhost:5001/updateFile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName: fileNameToUse || fileName,
                    data: updatedData
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error saving changes:', errorData);
                showNotification({
                    title: t.saveFailed,
                    message: t.fileNotSaved,
                    color: 'red',
                });
                return;
            }
    
            const result = await response.json();
            console.log('Save success:', result);
            showNotification({
                title: t.saveSuccess,
                message: t.fileSaved,
                color: 'green',
            });
        } catch (error) {
            console.error('Failed to save changes:', error);
            showNotification({
                title: t.error,
                message: t.saveError,
                color: 'red',
            });
        }
    };
    
    const handleSaveChanges = async () => {
        // Check if the filename is being changed
        const sanitizedCurrentFileName = fileName.replace(/-\d{4}-\d{2}-\d{2}.*/, '');
        const sanitizedEditedFileName = editedFileName.replace(/-\d{4}-\d{2}-\d{2}.*/, '');
    
        let newFileName = fileName;
    
        // Rename if the filename is different
        if (sanitizedCurrentFileName !== sanitizedEditedFileName) {
            const renamedFile = await renameFile();
            if (!renamedFile) {
                return; // Exit if renaming fails
            }
            newFileName = renamedFile;
        }
    
        // Save changes with the potentially new filename
        await saveChanges(newFileName);
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
        if (fromUnit === toUnit) return value;
        if (fromUnit === 'C' && toUnit === 'F') return toFahrenheit(value);
        if (fromUnit === 'C' && toUnit === 'K') return toKelvin(value);
        if (fromUnit === 'F' && toUnit === 'C') return fromFahrenheitToCelsius(value);
        if (fromUnit === 'F' && toUnit === 'K') return toKelvin(fromFahrenheitToCelsius(value));
        if (fromUnit === 'K' && toUnit === 'C') return fromKelvinToCelsius(value);
        if (fromUnit === 'K' && toUnit === 'F') return toFahrenheit(fromKelvinToCelsius(value));
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
        setData([...originalData]); // Reset data to the original state
        setTotalTime(originalData.reduce((total, row) => total + row.time, 0)); // Reset totalTime to the original value
        showNotification({
            title: "Izmaiņas atceltas",
            message: "Izmaniņas atceltas veiksmīgi",
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
                <Group align='center' justify='center'>
                    <NumberInput
                        w={90}
                        variant="filled"
                        value={convertTemperature(row.tMin, row.tMinUnit, temperatureUnit)}  // Convert the value to the selected unit
                        onChange={(val) => updateRow(index, 'tMin', val)}
                    />
                    <Text>{temperatureUnit}</Text> {/* Use the current temperature unit for display */}
                </Group>
            </Table.Td>
            <Table.Td ta='center'>
                <Group align='center' justify='center'>
                    <NumberInput
                        w={90}
                        variant="filled"
                        value={convertTemperature(row.tMax, row.tMaxUnit, temperatureUnit)}  // Convert the value to the selected unit
                        onChange={(val) => updateRow(index, 'tMax', val)}
                    />
                    <Text>{temperatureUnit}</Text> {/* Use the current temperature unit for display */}

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
                                <Input.Wrapper label={t.programName} withAsterisk>
                                    <Input placeholder="..." variant='filled' value={editedFileName} onChange={(e) => setEditedFileName(e.target.value)} />
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
                </AppShell>
    );
}
