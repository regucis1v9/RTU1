import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faTemperatureHalf, faWind } from '@fortawesome/free-solid-svg-icons';
import '../styles/modernSidebarStyles.scss'; // Pārliecinieties, ka šī importa ceļš ir pareizs

const Sidebar = ({ isOpen, onClose }) => {
  const [temperatures, setTemperatures] = useState([]);
  const [minTemp, setMinTemp] = useState(null);
  const [maxTemp, setMaxTemp] = useState(null);
  const [timeLeft, setTimeLeft] = useState(90);
  const [roomTemp, setRoomTemp] = useState(22);
  const [chamberPressure, setChamberPressure] = useState(1013);

  const generateTemperatures = () => {
    let baseTemp = Math.floor(Math.random() * 41) - 10;
    let newTemps = Array.from({ length: 7 }, (_, i) =>
      baseTemp + Math.floor(Math.random() * 7) - 3
    );

    let minTemperature = Math.min(...newTemps);
    let maxTemperature = Math.max(...newTemps);

    setTemperatures(newTemps);
    setMinTemp(minTemperature);
    setMaxTemp(maxTemperature);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    generateTemperatures();
    const interval = setInterval(generateTemperatures, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tempVariation = setInterval(() => {
      setRoomTemp(prev => prev + (Math.random() * 2 - 1));
      setChamberPressure(prev => prev + (Math.random() * 10 - 5));
    }, 3000);

    return () => clearInterval(tempVariation);
  }, []);

  return (
    <div className={`sidebarContainer ${isOpen ? 'open' : ''}`}>
      <button className="close-button" onClick={onClose}>
        ✕
      </button>
      <div className="sidebar-content">
        <div className="sidebarHeading">Informācija</div>
        
        <div className="tempContainer">
          {temperatures.map((temp, index) => (
            <div className="tempBox" key={index}>
              <div className="tempTitle">Temp-{index + 1}</div>
              <div className={`tempDisplay ${temp > 25 ? 'hot' : temp < 10 ? 'cold' : ''}`}>
                {temp}°C
              </div>
            </div>
          ))}
          <div className="tempBox max-temp">
            <div className="tempTitle">Maksimālā Temperatūra</div>
            <div className="tempDisplay">{maxTemp}°C</div>
          </div>
          <div className="tempBox min-temp">
            <div className="tempTitle">Minimālā Temperatūra</div>
            <div className="tempDisplay">{minTemp}°C</div>
          </div>
        </div>
        
        <div className="extraContainer2">
          <div className="countdown-box">
            <FontAwesomeIcon icon={faClock} className="countdown-icon" />
            <div className="countdown-time">{timeLeft}s</div>
          </div>
        </div>
        
        <div className="roomData">
          <div className="room-temp-box">
            <FontAwesomeIcon icon={faTemperatureHalf} className="room-icon" />
            <div className="room-temp-circle">
              <span>{roomTemp.toFixed(1)}°C</span>
            </div>
            <div className="room-temp-label">Telpas Temperatūra</div>
          </div>
          <div className="chamber-pressure-box">
            <FontAwesomeIcon icon={faWind} className="pressure-icon" />
            <div className="pressure-circle">
              <span>{chamberPressure.toFixed(0)} hPa</span>
            </div>
            <div className="pressure-label">Kameras Spiediens</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
