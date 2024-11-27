import React, { createContext, useContext, useState, useEffect } from 'react';

const TemperatureUnitContext = createContext();

export const useTemperatureUnit = () => useContext(TemperatureUnitContext);

export const TemperatureUnitProvider = ({ children }) => {
  const [temperatureUnit, setTemperatureUnit] = useState(localStorage.getItem('temperatureUnit') || 'Celsius'); // Default is 'Celsius'

  // Update localStorage whenever temperature unit changes
  useEffect(() => {
    localStorage.setItem('temperatureUnit', temperatureUnit);
  }, [temperatureUnit]);

  const changeTemperatureUnit = (unit) => {
    setTemperatureUnit(unit);
  };

  return (
    <TemperatureUnitContext.Provider value={{ temperatureUnit, changeTemperatureUnit }}>
      {children}
    </TemperatureUnitContext.Provider>
  );
};
