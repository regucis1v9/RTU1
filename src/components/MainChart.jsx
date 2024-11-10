import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as d3 from 'd3';
import Notiflix from 'notiflix';



const MainChart = ({ timeRange, onTimeRangeChange }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [collectedData, setCollectedData] = useState([]);
  const [dataPointCount, setDataPointCount] = useState(0);
  const [isProgramEnded, setIsProgramEnded] = useState(false);
  const startTimeRef = useRef(null);
  const dataIntervalRef = useRef(null);

  const TIME_RANGES = {
    '1m': 60,
    '5m': 300,
    '15m': 900,
    '30m': 1800,
    '1h': 3600,
    '4h': 14400
  };

  const COLORS = {
    temp1: '#ff9f1c',
    temp2: '#0AF7DD',
    temp3: '#00ff09',
    vacuum: '#4a90e2',
    freeze: '#e25c5c',
    vent: '#50c878'
  };

  const generateSystemState = (prevState, currentTime) => {
    if (!prevState || prevState.length === 0) {
      return {
        start: Math.max(0, currentTime - 10),
        end: currentTime,
        isActive: Math.random() > 0.5
      };
    }

    const lastState = prevState[prevState.length - 1];
    const shouldChangeState = Math.random() < 0.4;
    
    return {
      start: Math.max(0, currentTime - 10),
      end: currentTime,
      isActive: shouldChangeState ? !lastState.isActive : lastState.isActive
    };
  };

  const generateDataPoint = (secondsElapsed, prevData, isFirstPoint = false) => {
    const prevPoint = prevData.length > 0 ? prevData[prevData.length - 1] : null;
    
    const systemStates = isFirstPoint ? {
      vacuum: [],
      freeze: [],
      vent: []
    } : {
      vacuum: [generateSystemState(prevPoint?.systemStates.vacuum, secondsElapsed)],
      freeze: [generateSystemState(prevPoint?.systemStates.freeze, secondsElapsed)],
      vent: [generateSystemState(prevPoint?.systemStates.vent, secondsElapsed)]
    };
    
    return {
      time: secondsElapsed,
      temp1: Math.sin(secondsElapsed / 500) * 10 + 25 + Math.random() * 2,
      temp2: Math.sin(secondsElapsed / 500) * 8 + 22 + Math.random() * 2,
      temp3: Math.sin(secondsElapsed / 500) * 6 + 20 + Math.random() * 2,
      systemStates
    };
  };


  

  const showProgramEndDialog = () => {
    Notiflix.Notify.failure('Data collection has completed. What would you like to do?', {
      position: 'center-center',
      timeout: 0, // Prevent auto-hide
      backOverlay: true, // Optional, show overlay
      width: '500px',
      clickToClose: true,
    });
  
    // Showing a custom dialog using Notiflix's Confirm dialog
    Notiflix.Confirm.show(
      'Program Ended', 
      'Data collection has completed. What would you like to do?',
      'View Graphs',
      'Go Home',
      function () {
        console.log('View Graphs clicked');
        // Optionally, you can navigate to another route here
      },
      function () {
        console.log('Go Home clicked');
        window.location.href = '/';  // Redirect to home
      }
    );
  };
  



  


  useEffect(() => {
    if (!isInitialLoad || isProgramEnded) return;

    const initialDelay = setTimeout(() => {
      startTimeRef.current = Date.now();
      setIsInitialLoad(false);
      
      const firstPoint = generateDataPoint(0, [], true);
      setCollectedData([firstPoint]);
      setDataPointCount(1);

      dataIntervalRef.current = setInterval(() => {
        setDataPointCount(prev => {
          const newCount = prev + 1;
          if (newCount <= 9) {
            const secondsElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setCollectedData(prevData => {
              const newDataPoint = generateDataPoint(secondsElapsed, prevData);
              return [...prevData, newDataPoint];
            });
          } else if (!isProgramEnded) {
            setIsProgramEnded(true);
            if (dataIntervalRef.current) {
              clearInterval(dataIntervalRef.current);
            }
            showProgramEndDialog();
          }
          return newCount;
        });
      }, 10000);

      return () => {
        if (dataIntervalRef.current) {
          clearInterval(dataIntervalRef.current);
        }
      };
    }, 5000);

    return () => clearTimeout(initialDelay);
  }, [isInitialLoad, isProgramEnded]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 80, right: 30, bottom: 120, left: 60 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (isInitialLoad) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '24px')
        .attr('fill', '#666')
        .text('Collecting Data...');
      return;
    }

    if (collectedData.length === 0) return;

    // Update xScale domain to always show the most recent time window
    const latestTime = collectedData[collectedData.length - 1].time;
    const timeWindow = TIME_RANGES[timeRange];
    const startTime = Math.max(0, latestTime - timeWindow);
    
    const xScale = d3.scaleLinear()
      .domain([startTime, startTime + timeWindow])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(collectedData, d => Math.min(d.temp1, d.temp2, d.temp3)) - 2,
        d3.max(collectedData, d => Math.max(d.temp1, d.temp2, d.temp3)) + 2
      ])
      .range([height, 0]);

    // Create clip path
    svg.append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height);

    // Add glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'glow');
    
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '2')
      .attr('result', 'coloredBlur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'coloredBlur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    const chartArea = svg.append('g')
      .attr('clip-path', 'url(#clip)');

    // Add title and subtitle
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#333')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .text('Project 1');

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#666')
      .attr('font-size', '14px')
      .text('12-12-2024-project1.csv');

    // Add data point counter
    svg.append('text')
      .attr('x', width)
      .attr('y', -margin.top / 4)
      .attr('text-anchor', 'end')
      .attr('fill', '#666')
      .attr('font-size', '14px')
      .text(`Solis: ${dataPointCount}/10`);

    // Add temperature lines legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(0, -${margin.top - 60})`);

    const legendData = [
      { label: "T1", color: COLORS.temp1 },
      { label: "T2", color: COLORS.temp2 },
      { label: "T3", color: COLORS.temp3 }
    ];

    legendData.forEach((item, index) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(${index * 80}, 0)`);

      legendRow.append("circle")
        .attr("cx", 10)
        .attr("cy", 10)
        .attr("r", 6)
        .attr("fill", item.color);

      legendRow.append("text")
        .attr("x", 20)
        .attr("y", 14)
        .attr("fill", "#616060")
        .attr("font-size", "12px")
        .text(item.label);
    });

    // Add grid lines
    chartArea.append('g')
      .attr('class', 'grid')
      .attr('stroke', '#333')
      .attr('stroke-opacity', 0.1)
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat('')
      );

    chartArea.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .attr('stroke', '#333')
      .attr('stroke-opacity', 0.1)
      .call(d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat('')
      );

    // Add axes
    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}s`))
      .selectAll('text')
      .style('fill', '#666')
      .style('font-size', '12px');

    svg.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).tickFormat(d => `${d}°`))
      .selectAll('text')
      .style('fill', '#666')
      .style('font-size', '12px');

    // Add axis labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#666')
      .style('font-size', '14px')
      .style('font-weight', '500')
      .text('Laiks (sekundes)');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#666')
      .style('font-size', '14px')
      .style('font-weight', '500')
      .text('Temperatūra (°C)');

    const createLine = (accessor) => 
      d3.line()
        .x(d => xScale(d.time))
        .y(d => yScale(accessor(d)))
        .curve(d3.curveCatmullRom.alpha(0.5));

    const addLineWithDots = (data, accessor, color, index) => {
      const path = chartArea.append('path')
        .datum(data)
        .attr('class', `line line-${index}`)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', createLine(accessor));

      const pathLength = path.node().getTotalLength();

      path.attr('stroke-dasharray', pathLength)
        .attr('stroke-dashoffset', pathLength)
        .transition()
        .duration(300)
        .attr('stroke-dashoffset', 0);

      chartArea.selectAll(null)
        .data(data)
        .enter()
        .append('circle')
        .attr('class', `temp-dot temp-dot-${index}`)
        .attr('cx', d => xScale(d.time))
        .attr('cy', d => yScale(accessor(d)))
        .attr('r', 0)
        .attr('fill', color)
        .transition()
        .delay((d, i) => i * 100)
        .duration(100)
        .attr('r', 4);
    };

    // Add temperature lines with animations
    addLineWithDots(collectedData, d => d.temp1, COLORS.temp1, 1);
    addLineWithDots(collectedData, d => d.temp2, COLORS.temp2, 2);
    addLineWithDots(collectedData, d => d.temp3, COLORS.temp3, 3);

    // Draw system status timelines
    const timelineHeight = 10;
    const timelineGap = 15;
    const timelineStartY = height + 50;

    const systems = ['vacuum', 'freeze', 'vent'];
    const systemLabels = {
      vacuum: 'Vakuums',
      freeze: 'Saldētājs',
      vent: 'Ventilācija'
    };

    systems.forEach((system, index) => {
      const yPos = timelineStartY + index * (timelineHeight + timelineGap);
      
      // Add system label
      svg.append('text')
        .attr('x', -10)
        .attr('y', yPos + timelineHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#777')
        .attr('font-size', '10px')
        .text(systemLabels[system]);

      // Add timeline background
      svg.append('rect')
        .attr('x', 0)
        .attr('y', yPos)
        .attr('width', width)
        .attr('height', timelineHeight)
        .attr('fill', 'transparent')

      // Combine all system states for this system
      const allStates = collectedData.map(d => d.systemStates[system][0]).filter(Boolean);
      
      // Draw active periods
      allStates.forEach(state => {
        if (state.isActive) {
          svg.append('rect')
            .attr('x', xScale(state.start))
            .attr('y', yPos)
            .attr('width', xScale(state.end) - xScale(state.start))
            .attr('height', timelineHeight)
            .attr('fill', COLORS[system])
            .attr('opacity', 0.8);
        }
      });
    });

  }, [dimensions, timeRange, isInitialLoad, collectedData, dataPointCount]);

  return (
    <div ref={containerRef} className="chart">
      <div className="svg-container" style={{ height: '500px' }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default MainChart;