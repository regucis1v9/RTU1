import { useState } from 'react';
import { Switch, Text } from "@mantine/core";
import "../styles/overviewStyles.scss"; // Ensure this file has necessary custom styling if required.

export default function SettingsBox() {
  const [ventilation, setVentilation] = useState(false);
  const [vacuumPump, setVacuumPump] = useState(true);
  const [cooling, setCooling] = useState(false);

  return (
    <div className="settings-box">

      <div className="setting-item">
        <Text color="white">VENTILĀCIJA</Text>
        <Switch
          checked={ventilation}
          onChange={(event) => setVentilation(event.currentTarget.checked)}
          size="md"
          onLabel=""
          offLabel=""
          color="blue"
        />
      </div>

      <div className="setting-item">
        <Text color="white">V.SŪKNIS</Text>
        <Switch
          checked={vacuumPump}
          onChange={(event) => setVacuumPump(event.currentTarget.checked)}
          size="md"
          onLabel=""
          offLabel=""
          color="blue"
        />
      </div>

      <div className="setting-item">
        <Text color="white">SALDĒŠANA</Text>
        <Switch
          checked={cooling}
          onChange={(event) => setCooling(event.currentTarget.checked)}
          size="md"
          onLabel=""
          offLabel=""
          color="blue"
        />
      </div>
    </div>
  );
}
