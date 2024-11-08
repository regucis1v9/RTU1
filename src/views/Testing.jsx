import React from 'react';
import { Switch, Grid, Card, Title, Text } from '@mantine/core';
import { IconSnowflake, IconTemperature, IconAirConditioning, IconBulb, IconCircuitCellPlus } from '@tabler/icons-react';

const TestingPage = () => {
  return (
    <Grid
      sx={{
        height: '100vh',
        padding: '2rem',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Inter, sans-serif',
      }}
      align="center"
      justify="center"
    >
      <Grid.Col span={12}>
        <Title order={1} align="center" mb={40} sx={{ fontWeight: 700 }}>
        
        </Title>
      </Grid.Col>
      <Grid.Col span={6}>
        <Card
          shadow="lg"
          radius="md"
          p="xl"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
            },
          }}
        >
          <IconSnowflake size={48} color="#007bff" />
          <Title order={2} mt={20} sx={{ fontWeight: 600 }}>
            Freeze
          </Title>
          <Switch size="lg" mt={20} />
        </Card>
      </Grid.Col>
      <Grid.Col span={6}>
        <Card
          shadow="lg"
          radius="md"
          p="xl"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
            },
          }}
        >
          <IconTemperature size={48} color="#ff9800" />
          <Title order={2} mt={20} sx={{ fontWeight: 600 }}>
            Heater
          </Title>
          <Switch size="lg" mt={20} />
        </Card>
      </Grid.Col>
      <Grid.Col span={6}>
        <Card
          shadow="lg"
          radius="md"
          p="xl"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
            },
          }}
        >
          <IconAirConditioning size={48} color="#4caf50" />
          <Title order={2} mt={20} sx={{ fontWeight: 600 }}>
            Vacuum
          </Title>
          <Switch size="lg" mt={20} />
        </Card>
      </Grid.Col>
      <Grid.Col span={6}>
        <Card
          shadow="lg"
          radius="md"
          p="xl"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
            },
          }}
        >
          <IconBulb size={48} color="#9b59b6" />
          <Title order={2} mt={20} sx={{ fontWeight: 600 }}>
            Aux Relay
          </Title>
          <Switch size="lg" mt={20} />
        </Card>
      </Grid.Col>
      <Grid.Col span={6}>
        <Card
          shadow="lg"
          radius="md"
          p="xl"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
            },
          }}
        >
          <IconCircuitCellPlus size={48} color="#e74c3c" />
          <Title order={2} mt={20} sx={{ fontWeight: 600 }}>
            SSR Mode
          </Title>
          <Switch size="lg" mt={20} />
        </Card>
      </Grid.Col>
    </Grid>
  );
};

export default TestingPage;