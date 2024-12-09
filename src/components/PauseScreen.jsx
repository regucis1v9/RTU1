import React from 'react';
import '../styles/overviewStyles.scss';
import { usePause } from '../context/PauseContext';

export default function PauseScreen() {
    const { isPaused, togglePause } = usePause();

    const handleResume = () => {
        console.log("Resuming...");
        togglePause(false);
    };

    return (
        <>
            {isPaused && (
                <div className="pausedScreen">
                    <div className="labelBox">
                        <div className="pausedLabel">APSTĀDINĀTS</div>
                        <button className="resumeButton" onClick={handleResume}>TURPINĀT</button>
                    </div>
                </div>
            )}
        </>
    );
}
