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

export default function ConfigScreen() {
    const { ref, width, height } = useElementSize();

    // State management for each switch
    const [isColdStartEnabled, setColdStartEnabled] = useState(false);
    const [isFanEnabled, setFanEnabled] = useState(false);
    const [isGroup1Active, setGroup1Active] = useState(false);
    const [isGroup2Active, setGroup2Active] = useState(false);
    const [isGroup3Active, setGroup3Active] = useState(false);

    return (
        <Group justify={"space-evenly"} h={250} ref={ref}>
            {/* Cold Start Option */}
            <Stack justify={"flex-start"} align={"center"} h={height} w={width * 0.3}>
                <Group>
                    <Switch
                        checked={isColdStartEnabled}
                        onChange={(event) => setColdStartEnabled(event.currentTarget.checked)}
                    />
                    <Text size={'xl'} fw={"600"} ta={"center"}>
                        Aukstais starts
                    </Text>
                    {isColdStartEnabled ? (
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
                        checked={isFanEnabled}
                        onChange={(event) => setFanEnabled(event.currentTarget.checked)}
                    />
                    <Text size={'xl'} fw={"600"} ta={"center"}>
                        Ventilators
                    </Text>
                    {isFanEnabled ? (
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
                    <Paper style={{ opacity: isGroup1Active ? 1 : 0.5 }}>
                        <Title order={5}>1. Grupa</Title>
                        <Text>1. un 2. plaukts</Text>
                    </Paper>
                    <Switch
                        checked={isGroup1Active}
                        onChange={(event) => setGroup1Active(event.currentTarget.checked)}
                    />
                </Group>

                <Group w={width * 0.3} justify={"space-between"} maw={200}>
                    <Paper style={{ opacity: isGroup2Active ? 1 : 0.5 }}>
                        <Title order={5}>2. Grupa</Title>
                        <Text>3. un 4. plaukts</Text>
                    </Paper>
                    <Switch
                        checked={isGroup2Active}
                        onChange={(event) => setGroup2Active(event.currentTarget.checked)}
                    />
                </Group>

                <Group w={width * 0.3} justify={"space-between"} maw={200}>
                    <Paper style={{ opacity: isGroup3Active ? 1 : 0.5 }}>
                        <Title order={5}>3. Grupa</Title>
                        <Text>5. - 7. plaukts</Text>
                    </Paper>
                    <Switch
                        checked={isGroup3Active}
                        onChange={(event) => setGroup3Active(event.currentTarget.checked)}
                    />
                </Group>
            </Stack>
        </Group>
    );
}
