import { AppShell, Flex, Button, Table, ScrollArea, Group, Text, Input, NumberInput } from '@mantine/core';
import { useState } from 'react';
import { IconArrowLeft, IconCheck, IconPlayerPlayFilled, IconX, IconRowInsertTop, IconRowInsertBottom, IconTrashXFilled, IconChartSankey, IconHomeFilled } from '@tabler/icons-react';
import { useElementSize } from '@mantine/hooks';
import classes from "../styles/Table.module.css";
import cx from 'clsx';

// Conversion functions
const toFahrenheit = (celsius) => (celsius * 9/5) + 32;
const toKelvin = (celsius) => celsius + 273.15;
const fromFahrenheitToCelsius = (fahrenheit) => (fahrenheit - 32) * 5/9;
const fromKelvinToCelsius = (kelvin) => kelvin - 273.15;

export default function SingleProfile() {
  const { ref, width, height } = useElementSize();
  const [scrolled, setScrolled] = useState(false);
  const [data, setData] = useState([{
    step: 1, tMin: 0, tMax: 0, time: 1, tMinUnit: 'C', tMaxUnit: 'C'
  }]);
  const [temperatureUnit, setTemperatureUnit] = useState('C'); // Global state for temperature unit

  // Function to add a new row with the current unit state
  const addRow = (index, position) => {
    const newRow = { 
      step: data.length + 1, 
      tMin: 0, 
      tMax: 0, 
      time: 1, 
      tMinUnit: temperatureUnit, // Use global temperature unit
      tMaxUnit: temperatureUnit  // Use global temperature unit
    };
  
    const newData = [...data];
    if (position === 'above') {
      newData.splice(index, 0, newRow);
    } else if (position === 'below') {
      newData.splice(index + 1, 0, newRow);
    }
  
    // Update step numbers after inserting
    newData.forEach((row, i) => (row.step = i + 1));
    setData(newData); // Update the state with the new row
  };
  
  const removeRow = (index) => {
    if (data.length > 1) {
      const newData = data.filter((_, i) => i !== index);
      newData.forEach((row, i) => (row.step = i + 1));
      setData(newData);
    }
  };

  // Function to update a specific row value
  const updateRow = (index, field, value) => {
    const updatedData = [...data];
    updatedData[index][field] = value;
    setData(updatedData);
  };

  // Function to convert temperatures based on the global unit
  const convertTemperature = (value, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return value;
    if (fromUnit === 'C' && toUnit === 'F') return toFahrenheit(value);
    if (fromUnit === 'C' && toUnit === 'K') return toKelvin(value);
    if (fromUnit === 'F' && toUnit === 'C') return fromFahrenheitToCelsius(value);
    if (fromUnit === 'F' && toUnit === 'K') return toKelvin(fromFahrenheitToCelsius(value));
    if (fromUnit === 'K' && toUnit === 'C') return fromKelvinToCelsius(value);
    if (fromUnit === 'K' && toUnit === 'F') return toFahrenheit(fromKelvinToCelsius(value));
  };

  // Function to toggle the temperature unit globally
  const toggleUnitsForAll = () => {
    const newUnit = temperatureUnit === 'C' ? 'F' : temperatureUnit === 'F' ? 'K' : 'C'; // Toggle through C -> F -> K -> C
    setTemperatureUnit(newUnit);

    const updatedData = data.map(row => {
      const newRow = { ...row };
      // Apply unit conversion for both tMin and tMax
      newRow.tMinUnit = newUnit;
      newRow.tMaxUnit = newUnit;
      newRow.tMin = convertTemperature(newRow.tMin, row.tMinUnit, newUnit);
      newRow.tMax = convertTemperature(newRow.tMax, row.tMaxUnit, newUnit);

      return newRow;
    });

    setData(updatedData); // Update the data with new units
  };

  // Format total program time
  const formatTimeDuration = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes} min` : `${minutes} min`;
  };

  // Calculate total program time
  const totalProgramTime = data.reduce((total, row) => total + row.time, 0);
  const formattedProgramTime = formatTimeDuration(totalProgramTime);

  // Generate rows based on data
  const rows = data.map((row, index) => (
    <Table.Tr key={row.step}>
      <Table.Td ta='center'>{row.step}</Table.Td>
      <Table.Td ta='center'>
        <Group align='center' justify='center'>
          <NumberInput
            w={70}
            variant="filled"
            value={row.tMin}
            onChange={(val) => updateRow(index, 'tMin', val)}
          />
          <Text>{row.tMinUnit}</Text>
        </Group>
      </Table.Td>
      <Table.Td ta='center'>
        <Group align='center' justify='center'>
          <NumberInput
            w={70}
            variant="filled"
            value={row.tMax}
            onChange={(val) => updateRow(index, 'tMax', val)}
          />
          <Text>{row.tMaxUnit}</Text>
        </Group>
      </Table.Td>
      <Table.Td ta='center'>
        <Group align='center' justify='center'>
          <NumberInput min={1} w={70} variant="filled" value={row.time} onChange={(val) => updateRow(index, 'time', val)} />
          min
        </Group>
      </Table.Td>
      <Table.Td>
        <Group align='center' justify='center'>
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
          <Button variant="transparent" color='black'>
            <IconArrowLeft stroke={3}></IconArrowLeft>
          </Button>
          <Group>
            <Button color="black" variant="transparent" leftSection={<IconHomeFilled/>} >SĀKUMS</Button>
            <Button color="black" variant="transparent" leftSection={<IconChartSankey/>}>GRAFIKI</Button>
          </Group>
          <Button variant="transparent" color='black'>
            <IconX size={0} />
          </Button>
        </Flex>
      </AppShell.Header>
      <AppShell.Main ref={ref}>
        <Flex
          w={width}
          h={height}
          gap="md"
          justify="center"
          align="center"
          direction="column"
        >
        <Group w={width*0.8} justify='space-between'> 
            <Input.Wrapper label="Programmas nosaukums" withAsterisk >
                <Input placeholder="..." variant='filled'/>
            </Input.Wrapper>
            <Group>
                <Button rightSection={ <IconX size={16}/> } color='red'>ATCELT IZMAIŅAS</Button>
                <Button rightSection={ <IconCheck size={16}/> }>SAGLABĀT IZMAIŅAS</Button>
            </Group>
        </Group>
        <ScrollArea h={height*0.7} w={width*0.8} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
            <Table miw={700}>
                <Table.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
                  <Table.Tr>
                    <Table.Th ta="center">Solis</Table.Th>
                    <Table.Th ta="center" onClick={toggleUnitsForAll}>T-min</Table.Th>
                    <Table.Th ta="center" onClick={toggleUnitsForAll}>T-max</Table.Th>
                    <Table.Th ta="center">Laiks</Table.Th>
                    <Table.Th ta="center">Rindu darbības</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </ScrollArea>
        <Group w={width*0.8} justify='space-between'> 
            <Text pl={20}>Paredzamais programmas laiks: {formattedProgramTime}</Text>
            <Button rightSection={ <IconPlayerPlayFilled size={16}/> }>SĀKT PROGRAMMU</Button>
        </Group>
        </Flex>
      </AppShell.Main>
    </AppShell>
  );
} 
