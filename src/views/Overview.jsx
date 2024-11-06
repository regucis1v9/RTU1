import { useEffect, useRef } from 'react';
import { Button } from "@mantine/core";
import "../styles/overviewStyles.scss"
import * as d3 from 'd3';
import MainChart from '../components/MainChart';
import SettingsBox from '../components/SettingsBox';
import ChartSettings from '../components/ChartSettings';
import ShelfContainer from '../components/ShelfContainer';

export default function Overview() {
    
  return (
    <div className="mainCont">
      <div className="chartContainer">
        <MainChart/>
      </div>
      <div className="settingsContainer">
        <SettingsBox/>
        <ChartSettings/>
      </div>
      <div className="shelfContainer">
        <ShelfContainer/>
      </div>
      <div className="extraContainer"></div>
    </div>
  );
}


