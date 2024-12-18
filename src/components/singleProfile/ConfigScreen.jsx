import { useState } from 'react';
import {
    Switch,
    rem,
    Stack,
    Group,
    useMantineTheme,
    Text,
    Paper,
    Title,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconCheck, IconX } from '@tabler/icons-react';

export default function ConfigScreen({ data, updateRow }) {
    const { ref, width, height } = useElementSize();
    const parsedData = data.map(row => ({
        ...row,
        activeShelf1: row.activeShelf1 === 1 ? true : row.activeShelf1 === 0 ? false : row.activeShelf1,
        activeShelf2: row.activeShelf2 === 1 ? true : row.activeShelf2 === 0 ? false : row.activeShelf2,
        activeShelf3: row.activeShelf3 === 1 ? true : row.activeShelf3 === 0 ? false : row.activeShelf3,
        coldStart: row.coldStart === 1 ? true : row.coldStart === 0 ? false : row.coldStart,
        fan: row.fan === 1 ? true : row.fan === 0 ? false : row.fan,
    }));
    
    const [isColdStartEnabled, setColdStartEnabled] = useState(parsedData[0].coldStart || false);
    const [isFanEnabled, setFanEnabled] = useState(parsedData[0].fan || false);
    const [isGroup1Active, setGroup1Active] = useState(parsedData[0].activeShelf1 || false);
    const [isGroup2Active, setGroup2Active] = useState(parsedData[0].activeShelf2 || false);
    const [isGroup3Active, setGroup3Active] = useState(parsedData[0].activeShelf3 || false);
    
    
    return (
        <Group justify={"space-evenly"} h={250} ref={ref}>
            {/* Cold Start Option */}
            <Stack justify={"flex-start"} align={"center"} h={height} w={width * 0.3}>
                <Group>
                    <Switch
                        checked={parsedData[0].coldStart}
                        onChange={(event) => {
                            const isChecked = event.currentTarget.checked;
                            setColdStartEnabled(isChecked);
                            updateRow(0, 'coldStart', isChecked ? 1 : 0);
                        }}
                    />
                    <Text size={'xl'} fw={"600"} ta={"center"}>
                        Aukstais starts
                    </Text>
                    {parsedData[0].coldStart ? (
                        <IconCheck color={"green"} />
                    ) : (
                        <IconX color={"red"} />
                    )}
                </Group>
                <Text>
                    Izvēlaties šo opciju, kad produkts ir iepriekš sasaldēts līdz -20°C.
                </Text>
                <Text>
                    Šajā gadījumā tiks pievienots papildus atdzesēšanas solid, lai sasaldētais
                    produktu var ievietot jau atdzesētā vidē.
                </Text>
            </Stack>

            {/* Fan Option */}
            <Stack justify={"flex-start"} align={"center"} h={height} w={width * 0.3}>
                <Group>
                    <Switch
                        checked={parsedData[0].fan}
                        onChange={(event) => {
                            const isChecked = event.currentTarget.checked;
                            setFanEnabled(isChecked);
                            updateRow(0, 'fan', isChecked ? 1 : 0);
                        }}
                    />
                    <Text size={'xl'} fw={"600"} ta={"center"}>
                        Ventilators
                    </Text>
                    {parsedData[0].fan ? (
                        <IconCheck color={"green"} />
                    ) : (
                        <IconX color={"red"} />
                    )}
                </Group>
                <Text>
                    Izslēgt ventilatoru saldējot vieglus produktus, piemēram, puķes vai lapas, lai
                    tās neaizpūstu.
                </Text>
                <Text>
                    Ieslēgt ventilatoru, lai palīdzētu ar kondensatora atdzesēšanas procesu.
                </Text>
            </Stack>

            {/* Active Shelves Option */}
            <Stack justify={"flex-start"} align={"center"} h={height} w={width * 0.3}>
                <Text size={'xl'} fw={"600"} ta={"center"}>
                    Aktīvie plaukti
                </Text>

                <Group w={width * 0.3} justify={"space-between"} maw={200}>
                    <Paper style={{ opacity: parsedData[0].activeShelf1 ? 1 : 0.5 }}>
                        <Title order={5}>1. Grupa</Title>
                        <Text>1. un 2. plaukts</Text>
                    </Paper>
                    <Switch
                        checked={parsedData[0].activeShelf1}
                        onChange={(event) => {
                            const isChecked = event.currentTarget.checked;
                            setGroup1Active(isChecked);
                            updateRow(0, 'activeShelf1', isChecked ? 1 : 0);
                        }}
                    />
                </Group>
                <Group w={width * 0.3} justify={"space-between"} maw={200}>
                    <Paper style={{ opacity: parsedData[0].activeShelf2 ? 1 : 0.5 }}>
                        <Title order={5}>2. Grupa</Title>
                        <Text>3. un 4. plaukts</Text>
                    </Paper>
                    <Switch
                        checked={parsedData[0].activeShelf2}
                        onChange={(event) => {
                            const isChecked = event.currentTarget.checked;
                            setGroup2Active(isChecked);
                            updateRow(0, 'activeShelf2', isChecked ? 1 : 0);
                        }}
                    />
                </Group>

                <Group w={width * 0.3} justify={"space-between"} maw={200}>
                    <Paper style={{ opacity: parsedData[0].activeShelf3 ? 1 : 0.5 }}>
                        <Title order={5}>3. Grupa</Title>
                        <Text>5. - 7. plaukts</Text>
                    </Paper>
                    <Switch
                        checked={parsedData[0].activeShelf3}
                        onChange={(event) => {
                            const isChecked = event.currentTarget.checked;
                            setGroup3Active(isChecked);
                            updateRow(0, 'activeShelf3', isChecked ? 1 : 0);
                        }}
                    />
                </Group>
            </Stack>
        </Group>
    );
}
