import {Button} from "@mantine/core";
import {IconPlayerPause, IconPlayerPlay} from "@tabler/icons-react";
import React from "react";

export default function PauseButton ({ isPaused, handlePause, handleResume }) {
    return (
        <Button
            onClick={isPaused ? handleResume : handlePause}
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
};
