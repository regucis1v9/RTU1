import React, { createContext, useContext, useState } from 'react';

// Create the context
const PauseContext = createContext();

// Create a provider
export function PauseProvider({ children }) {
    const [isPaused, setIsPaused] = useState(() => {
        return JSON.parse(localStorage.getItem("isPaused")) || false;
    });

    const togglePause = (pauseState) => {
        localStorage.setItem("isPaused", pauseState);
        setIsPaused(pauseState);
    };

    return (
        <PauseContext.Provider value={{ isPaused, togglePause }}>
            {children}
        </PauseContext.Provider>
    );
}

// Custom hook for consuming the context
export function usePause() {
    return useContext(PauseContext);
}
