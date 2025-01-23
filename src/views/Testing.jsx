import React from 'react';
import { Snowflake, Thermometer, Fan, Lightbulb, Power } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IconSun, IconMoon, IconPlayerPause, IconPlayerPlay, IconArrowLeft, IconCheck, IconPlayerPlayFilled, IconX, IconRowInsertTop, IconRowInsertBottom, IconTrashXFilled, IconChartSankey, IconHomeFilled, IconLanguage } from '@tabler/icons-react';
import { Button, useMantineColorScheme, useComputedColorScheme } from "@mantine/core";


const Switch = ({ id }) => (
  <label className="switch">
    <input type="checkbox" id={id} />
    <span className="slider round"></span>
  </label>
);

const TestingPage = () => {
  const buttonColor = useComputedColorScheme === 'dark' ? 'white' : 'white';
  const controls = [
    { icon: Snowflake, title: 'Saldēšana', color: '#60a5fa' },
    { icon: Thermometer, title: 'Sildīšana', color: '#fb923c' },
    { icon: Fan, title: 'Vakuums', color: '#4ade80' },
    { icon: Lightbulb, title: 'Aux Relay', color: '#c084fc' },
    { icon: Power, title: 'SSR Režīms', color: '#f87171' }
  ];

  return (
    <div className="testing-page">
      <Link to="/landing">
        <Button className='backButton' variant="transparent" color={buttonColor}>
          <IconArrowLeft stroke={3}></IconArrowLeft>
        </Button>
      </Link>
      <h1>Testēšana</h1>
      <div className="controls-grid">
        {controls.map((control, index) => (
          <div key={index} className="control-card">
            <div className="icon-wrapper" style={{ backgroundColor: `${control.color}15` }}>
              <control.icon size={32} color={control.color} />
            </div>
            <h2>{control.title}</h2>
            <div className="switch-container">
              <span>Off</span>
              <Switch id={`switch-${index}`} />
              <span>On</span>
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .testing-page {
          min-height: 100vh;
          padding: 2rem;
          background-color: #0f172a;
        }

        h1 {
          text-align: center;
          color: #e2e8f0;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 2rem;
        }

        .controls-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          padding: 1rem;
        }

        .control-card {
          background: #1e293b;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid #334155;
        }

        .control-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
          border-color: #475569;
        }

        .icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          border: 1px solid #334155;
        }

        h2 {
          color: #e2e8f0;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.5rem 0 1rem 0;
        }

        .switch-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: auto;
        }

        .switch-container span {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        /* Switch styles */
        .switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #334155;
          transition: .4s;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 2px;
          bottom: 2px;
          background-color: #e2e8f0;
          transition: .4s;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
        }

        input:checked + .slider {
          background-color: #3b82f6;
        }

        input:focus + .slider {
          box-shadow: 0 0 1px #3b82f6;
        }

        input:checked + .slider:before {
          transform: translateX(24px);
        }

        .slider.round {
          border-radius: 24px;
        }

        .slider.round:before {
          border-radius: 50%;
        }

        @media (max-width: 768px) {
          .testing-page {
            padding: 1rem;
          }
          
          .controls-grid {
            grid-template-columns: 1fr;
          }
          
          .control-card {
            padding: 1.25rem;
          }
        }

        @media (prefers-reduced-motion) {
          .control-card {
            transition: none;
          }
          
          .slider, .slider:before {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default TestingPage;
