import React, {useEffect, useState} from 'react';
import '../styles/overviewStyles.scss';

export default function PauseScreen() {
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        setIsPaused(localStorage.getItem("isPaused"));
    }, []);
    
    const handleResume = () => {
        localStorage.setItem("isPaused", false)

        console.log("Resuming...");
        setIsPaused(false);
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
