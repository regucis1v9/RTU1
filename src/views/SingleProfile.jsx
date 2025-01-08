import {
    AppShell,
    useMantineTheme,
    Modal,
    Flex,
    Button,
    Tabs,
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
import {Link, useNavigate, useParams} from 'react-router-dom';
import Header from "../components/Header"
import { useLanguage } from '../context/LanguageContext'; // Importing Language context
import { usePressureUnit } from '../context/PressureUnitContext'; // Importing PressureUnit context
import { useTemperatureUnit } from '../context/TemperatureUnitContext';
import StepTable from "../components/singleProfile/StepTable";
import ConfigScreen from "../components/singleProfile/ConfigScreen";
const toFahrenheit = (celsius) => (celsius * 9/5) + 32;
const toKelvin = (celsius) => celsius + 273.15;
const fromFahrenheitToCelsius = (fahrenheit) => (fahrenheit - 32) * 5/9;
const fromKelvinToCelsius = (kelvin) => kelvin - 273.15;

export default function SingleProfile() {
    const navigate = useNavigate();
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
        { step: 1, tMin: 0, tMax: 0, time: 1, tUnit: 'C', pressureUnit: 'mbar', pressure: 1, shellTemp: 0 }
    ]);
    const { language, changeLanguage } = useLanguage(); // Access language from context
    const { pressureUnit, togglePressureUnit } = usePressureUnit(); // Access pressure unit from context
    const { temperatureUnit, changeTemperatureUnit } = useTemperatureUnit();
    const t = translations[language] || translations['Latviešu'];
    const buttonColor = computedColorScheme === 'dark' ? 'white' : 'black';
    const [totalTime, setTotalTime] = useState(data.reduce((total, row) => total + row.time, 0)); // Initialize total time
    const [editedFileName, setEditedFileName] = useState(fileName);
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [unsavedChanges, setUnsavedChanges] = useState(false);

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
            const dataRows = rows.slice(1).map(row => ({
                step: parseInt(row[0]),
                tMin: row[1] === 'istabas' ? 'istabas' : parseFloat(row[1]),
                tMax: parseFloat(row[2]),
                time: parseInt(row[3]),
                pressure: parseFloat(row[4]),
                tUnit: row[5],
                pressureUnit: row[6],
                shellTemp: row[7] ? parseFloat(row[7]) : 0,
                coldStart: parseInt(row[8]),
                fan: parseInt(row[9]),
                activeShelf1: parseInt(row[10]),
                activeShelf2: parseInt(row[11]),
                activeShelf3: parseInt(row[12]),
            }));


            setData(dataRows);
            setOriginalData(JSON.parse(JSON.stringify(dataRows)));

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
        console.log(data)
        const updatedData = data.map((row, index) => ({
            step: row.step,
            tMin: index === 0 && startFromRoomTemp ? "istabas" : row.tMin,
            tMax: row.tMax,
            time: row.time,
            pressure: row.pressure,
            tUnit: row.tUnit,
            pressureUnit: pressureUnit,
            shellTemp: row.shellTemp,
            fan: row.fan,
            coldStart: row.coldStart,
            activeShelf1: row.activeShelf1,
            activeShelf2: row.activeShelf2,
            activeShelf3: row.activeShelf3,
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
            fetchCsvData()
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
        if (!validateData()) {
            showNotification({
                title: "Nepieciešamie lauki",
                message: "Lūdzu, aizpildiet visus laukus pirms saglabāšanas.",
                color: 'red',
            });
            return;
        }
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

        await saveChanges(newFileName);
    };

    useEffect(() => {
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
            tUnit: temperatureUnit,
            pressureUnit: pressureUnit,
            shellTemp: 0
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
        setData((prevData) => {
            const updatedData = [...prevData];

            // Handle time adjustment
            if (field === 'time') {
                const previousTime = updatedData[index][field];
                setTotalTime((totalTime) => totalTime - previousTime + value);
            }

            // Update booleans
            if (['coldStart', 'fan', 'activeShelf1', 'activeShelf2', 'activeShelf3'].includes(field)) {
                updatedData[index][field] = value ? 1 : 0;
            } else {
                updatedData[index][field] = value;
            }

            // Synchronize tMax and tMin between rows
            if (field === 'tMax') {
                updatedData[index][field] = value; // Update tMax directly
                if (index < updatedData.length - 1) {
                    updatedData[index + 1].tMin = value; // Sync with next row's tMin
                }
            }

            // Temperature conversion
            if (field === 'tMin' || field === 'tMax') {
                updatedData[index][field] = convertTemperature(
                    value,
                    updatedData[index].tUnit, // Assuming tUnit is shared
                    temperatureUnit
                );
            }

            // Pressure conversion
            if (field === 'pressure') {
                updatedData[index][field] = convertPressure(
                    value,
                    updatedData[index].pressureUnit,
                    pressureUnit
                );
            }

            return updatedData;
        });
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
            newRow.tUnit = newUnit;
            newRow.pressureUnit = newUnit;
            newRow.tMin = convertTemperature(newRow.tMin, row.tUnit, newUnit);
            newRow.tMax = convertTemperature(newRow.tMax, row.tUnit, newUnit);
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
    const startProgram = async () => {
        console.log(data);
        console.log(originalData);

        const hasUnsavedChanges = JSON.stringify(data) !== JSON.stringify(originalData);
        console.log(hasUnsavedChanges);

        if (hasUnsavedChanges) {
            setUnsavedChanges(true);
            openModal();
            return;
        }

        try {
            // Call the endpoint to move the file
            const response = await fetch('http://localhost:5001/copy-to-sister-folder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fileName }),
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('Error moving file:', result.message);
                alert(`Failed to move the file: ${result.message}`);
                return;
            }

            console.log('File moved successfully:', result.message);

            // Proceed with starting the program
            await executeProgramStart();
        } catch (error) {
            console.error('Error during startProgram:', error);
            alert('An unexpected error occurred while starting the program.');
        }
    };

    const getDifferences = () => {
        const differences = [];

        // Check if data and originalData are both valid arrays
        if (!Array.isArray(data) || !Array.isArray(originalData)) {
            console.error('Data or originalData is not an array');
            return differences;
        }

        // First, compare rows in both originalData and data
        data.forEach((row) => {
            const originalRow = originalData.find(r => r.step === row.step);

            // Check if the row exists in originalData
            if (!originalRow) {
                // This row is new, add it as a difference
                differences.push({
                    step: row.step,
                    differences: { newStep: true, details: row },
                });
                return;  // Skip the rest of the loop for this row
            }

            const rowDiffs = {};

            // Compare the individual fields of each row
            for (let key in row) {
                if (row[key] !== originalRow[key]) {
                    rowDiffs[key] = {
                        original: originalRow[key],
                        modified: row[key],
                    };
                }
            }

            // If there are any differences, add them to the list
            if (Object.keys(rowDiffs).length > 0) {
                differences.push({ step: row.step, differences: rowDiffs });
            }
        });

        return differences;
    };



    const differences = getDifferences();
    console.log(differences);  // Add this line for debugging

    const executeProgramStart = async () => {
        try {
            const response = await fetch('http://localhost:5001/run-script', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error(`Failed to start program: ${response.statusText}`);
            }

            const result = await response.json();
            showNotification({
                title: 'Paziņojums no programmas',
                message: `Programma palaista veiksmīgi`,
                color: 'green',
            });
            navigate("/overviewMain/asd");
        } catch (error) {
            console.error('Error starting program:', error);
            showNotification({
                title: 'Failed to Start Program',
                message: 'Unable to execute the script. Please check the server.',
                color: 'red',
            });
        }
    };

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
                                <Input placeholder="..." variant='filled' value={editedFileName} onChange={(e) => setEditedFileName(e.target.value)} />

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
                    <Tabs w={width * 0.8} h={height * 0.7} defaultValue="gallery">
                        <Tabs.List>
                            <Tabs.Tab value="gallery" >
                                Konfigurācija
                            </Tabs.Tab>
                            <Tabs.Tab value="messages" >
                                Soļi
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="gallery" p={20}>
                            <ConfigScreen
                                data={data}
                                updateRow={updateRow}
                            />
                        </Tabs.Panel>
                        <Tabs.Panel value="messages" pt={10}>
                            <ScrollArea h={height * 0.7} w={width * 0.8} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
                                <StepTable
                                    data={data}
                                    startFromRoomTemp={startFromRoomTemp}
                                    temperatureUnit={temperatureUnit}
                                    totalTime={totalTime}
                                    setTotalTime={setTotalTime}
                                    addRow={addRow}
                                    removeRow={removeRow}
                                    updateRow={updateRow}
                                    convertTemperature={convertTemperature}
                                    toggleUnitsForAll={toggleUnitsForAll}
                                    scrolled={false}
                                    t={t}
                                    onSave={handleSaveChanges}
                                    onCancel={cancelChanges}
                                    pressureUnit={pressureUnit}
                                />
                            </ScrollArea>
                        </Tabs.Panel>
                    </Tabs>
                    <Group w={width * 0.8} justify='space-between'>
                        <Text>{t.totalProgramTime} {formattedProgramTime}</Text>
                        <Button
                            onClick={startProgram}
                            rightSection={<IconPlayerPlayFilled size={20} />}
                        >
                            {t.startProgram}
                        </Button>
                    </Group>
                </Flex>
                <Modal
                    opened={modalOpened}
                    onClose={closeModal}
                    title="Nesaglabātas izmaiņas"
                    centered
                >
                    <Text>Jums ir nesaglabātas izmaiņas. Šeit ir atšķirības:</Text>
                    <Stack>
                        {differences.length === 0 ? (
                            <Text>Nav izmaiņu.</Text>
                        ) : (
                            differences.map((diff, index) => (
                                <div key={index}>
                                    <Text ><strong>Solis</strong>  {diff.step}:</Text>
                                    <div>
                                        {Object.entries(diff.differences).map(([key, { original, modified }], diffIndex) => (
                                            <span key={diffIndex}>
                                                        <Text pl={12}>
                                                            {key}: {original} → {modified}
                                                        </Text>
                                                    </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </Stack>
                    <Group mt="md" position="right">
                        <Button onClick={async () => {
                            await handleSaveChanges();
                            closeModal();
                            await executeProgramStart();
                        }}>
                            Saglabāt un palaist
                        </Button>
                        <Button onClick={async () => {
                            closeModal();
                            await executeProgramStart();
                        }} color="red">
                            Palaist bez saglabāšanas
                        </Button>
                    </Group>
                </Modal>
            </AppShell.Main>
        </AppShell>
    );
}
