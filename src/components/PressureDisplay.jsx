import React, { useState, useEffect } from 'react';
import { Gauge } from 'lucide-react';
import styled from '@emotion/styled';

const DisplayContainer = styled.div`
  width: 90%;
  height: 90%;
  background-color: #ffffff;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  transition: all 0.3s ease;
  

  .dark & {
    background-color: #1a1a1a;

  }
`;

const IconWrapper = styled.div`
  margin-bottom: 15px;
  transition: transform 0.3s ease;
  
  &.animate {
    transform: scale(1.1);
  }
`;

const ValueContainer = styled.div`
  display: flex;
  align-items: baseline;
  transition: transform 0.3s ease;
  
  &.animate {
    transform: scale(1.1) translateY(-5px);
  }
`;

const Value = styled.span`
  font-size: 2.5rem;
  font-weight: 700;
  font-family: 'Monaco', monospace;
  background: linear-gradient(45deg, #3b82f6, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;

  .dark & {
    background: linear-gradient(45deg, #60a5fa, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Unit = styled.span`
  font-size: 1.2rem;
  margin-left: 5px;
  color: #6b7280;
  font-weight: 500;

  .dark & {
    color: #9ca3af;
  }
`;

const Label = styled.span`
  margin-top: 10px;
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;

  .dark & {
    color: #9ca3af;
  }
`;

const PressureDisplay = () => {
  const [pressure, setPressure] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPressure = Math.random() * (1100 - 900) + 900;
      setIsAnimating(true);
      setPressure(Number(newPressure.toFixed(1)));
      setTimeout(() => setIsAnimating(false), 300);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DisplayContainer>
      <IconWrapper className={isAnimating ? 'animate' : ''}>
        <Gauge 
          size={32}
          color="#3b82f6"
          strokeWidth={1.5}
        />
      </IconWrapper>
      
      <ValueContainer className={isAnimating ? 'animate' : ''}>
        <Value>{pressure.toFixed(1)}</Value>
      </ValueContainer>
      
      <Label>Spiediens</Label>
    </DisplayContainer>
  );
};

export default PressureDisplay;