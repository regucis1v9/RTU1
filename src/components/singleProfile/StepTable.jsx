import React from 'react';
import {
    Table,
    Group,
    NumberInput,
    Button,
    Text,
    Stack
} from '@mantine/core';
import {
    IconRowInsertTop,
    IconRowInsertBottom,
    IconTrashXFilled
} from '@tabler/icons-react';
import cx from 'clsx';
import classes from "../../styles/Table.module.css";

export default function StepTable ({
                          data,
                          startFromRoomTemp,
                          temperatureUnit,
                          totalTime,
                          setTotalTime,
                          addRow,
                          removeRow,
                          updateRow,
                          convertTemperature,
                          toggleUnitsForAll,
                          scrolled,
                          t,
                      }) {
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
                        value={convertTemperature(row.tMax, row.tMaxUnit, temperatureUnit)}
                        onChange={(val) => updateRow(index, 'tMax', val)}
                    />
                    <Text>{temperatureUnit}</Text>
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
                        value={row.pressure}
                        onChange={(val) => updateRow(index, 'pressure', val)}
                    />
                    <Text>bar</Text>
                </Group>
            </Table.Td>
            <Table.Td ta='center'>
                <Group align='center' justify='center'>
                    <NumberInput
                        step={1}
                        w={90}
                        decimalScale={0}
                        variant="filled"
                        value={row.shellTemp}
                        onChange={(val) => updateRow(index, 'shellTemp', val)}
                    />
                    <Text>{temperatureUnit}</Text>
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
        <Stack spacing="md">
            <Table miw={700}>
                <Table.Thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
                    <Table.Tr>
                        <Table.Th ta="center">{t.step}</Table.Th>
                        <Table.Th ta="center" onClick={toggleUnitsForAll}>{t.tMin}</Table.Th>
                        <Table.Th ta="center" onClick={toggleUnitsForAll}>{t.tMax}</Table.Th>
                        <Table.Th ta="center">{t.time}</Table.Th>
                        <Table.Th ta="center">{t.pressure}</Table.Th>
                        <Table.Th ta="center">Kondensatora temp.</Table.Th>
                        <Table.Th ta="center">{t.rowActions}</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
            
        </Stack>
    );
};
