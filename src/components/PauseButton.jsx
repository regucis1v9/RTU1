import { Button } from "@mantine/core";
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import React from "react";
import { usePause } from '../context/PauseContext';

export default function PauseButton() {
    const { isPaused, togglePause } = usePause();

    const handleClick = () => {
        togglePause(!isPaused);
    };

    return (
        <Button
            onClick={handleClick}
            variant="subtle"
            size="sm"
            className="pauseButton"
        >
            {isPaused ? (
                <IconPlayerPlay size={20} stroke={1.5} />
            ) : (
                <IconPlayerPause size={20} stroke={1.5} />
            )}
        </Button>
    );
}
