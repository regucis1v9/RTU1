import React, { createContext, useContext, useState, useEffect } from 'react';

const PressureUnitContext = createContext();

export const usePressureUnit = () => useContext(PressureUnitContext);

export const PressureUnitProvider = ({ children }) => {
  const [pressureUnit, setPressureUnit] = useState(localStorage.getItem('pressureUnit') || 'Torr'); // Default is 'Torr'

  // Update localStorage whenever pressure unit changes
  useEffect(() => {
    localStorage.setItem('pressureUnit', pressureUnit);
  }, [pressureUnit]);

  const togglePressureUnit = () => {
    setPressureUnit((prev) => (prev === 'Torr' ? 'Bar' : 'Torr'));
  };

  return (
    <PressureUnitContext.Provider value={{ pressureUnit, togglePressureUnit }}>
      {children}
    </PressureUnitContext.Provider>
  );
};
