import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as d3 from 'd3';
import Notiflix from 'notiflix';
import LineVisibilityControls from './LineVisibilityControls';



const MainChart = ({ timeRange, onTimeRangeChange, chartType = 'temperature', isPaused }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [collectedData, setCollectedData] = useState([]);
  const [dataPointCount, setDataPointCount] = useState(0);
  const [isProgramEnded, setIsProgramEnded] = useState(false);
  const [lineVisibility, setLineVisibility] = useState({
    temp1: true,
    temp2: true,
    temp3: true
  });
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
    vent: '#50c878',
    pressure: '#4a90e2'
  };


  const toggleLine = (line) => {
    if (chartType === 'pressure') return;
    setLineVisibility(prev => ({
      ...prev,
      [line]: !prev[line]
    }));
  };

  const showAllLines = () => {
    if (chartType === 'pressure') return;
    setLineVisibility({
      temp1: true,
      temp2: true,
      temp3: true,
      pressure: true
    });
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

    // Generate both temperature and pressure data regardless of chart type
    return {
      time: secondsElapsed,
      systemStates,
      // Temperature data
      temp1: Math.sin(secondsElapsed / 500) * 10 + 25 + Math.random() * 2,
      temp2: Math.sin(secondsElapsed / 500) * 8 + 22 + Math.random() * 2,
      temp3: Math.sin(secondsElapsed / 500) * 6 + 20 + Math.random() * 2,
      // Pressure data
      pressure: Math.sin(secondsElapsed / 300) * 0.5 + 1 + Math.random() * 0.2,
    };
};

  // useEffect(() => {
  //   // Reset data collection when chart type changes
  //   setIsInitialLoad(true);
  //   setCollectedData([]);
  //   setDataPointCount(0);
  //   setIsProgramEnded(false);
  //   if (dataIntervalRef.current) {
  //     clearInterval(dataIntervalRef.current);
  //   }
  // }, [chartType]);

  


  

  const showProgramEndDialog = () => {
    Notiflix.Confirm.show(
      'Programmas Beigas', 
      'Visi soļi tika izpildīti, ko jūs vēlaties darīt?',
      'Skatīt Grafiku',
      'Uz Mājām',
      function () {
        console.log('View Graphs clicked');
      },
      function () {
        window.location.href = '/';
      }
    );

  
    // Showing a custom dialog using Notiflix's Confirm dialog
    Notiflix.Confirm.show(
      'Programmas Beigas', 
      'Visi soļi tika izpildīti, ko jūs vēlaties darīt?',
      'Skatīt Grafiku',
      'Uz Mājām',
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
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
        const firstPoint = generateDataPoint(0, [], true);
        setCollectedData([firstPoint]);
        setDataPointCount(1);
      }
      
      setIsInitialLoad(false);

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
      }, 10001);

      return () => {
        if (dataIntervalRef.current) {
          clearInterval(dataIntervalRef.current);
        }
      };
    }, 0);

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
    // Chart rendering logic
    if (dimensions.width === 0 || dimensions.height === 0 || collectedData.length === 0) return;

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
        .text('Ievāc Datus...');
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

    // Different y-scale domains for temperature and pressure
    const yScale = d3.scaleLinear()
      .domain(chartType === 'temperature' 
        ? [
            d3.min(collectedData, d => Math.min(d.temp1 || Infinity, d.temp2 || Infinity, d.temp3 || Infinity)) - 2,
            d3.max(collectedData, d => Math.max(d.temp1 || -Infinity, d.temp2 || -Infinity, d.temp3 || -Infinity)) + 2
          ]
        : [0, d3.max(collectedData, d => d.pressure || 0) + 0.5]
      )
      .range([height, 0]);

      svg.select('.y-axis-label')
      .text(chartType === 'temperature' ? 'Temperatūra (°C)' : 'Spiediens (bar)');


      svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#666')
      .style('font-size', '14px')
      .style('font-weight', '500')
      .text(chartType === 'temperature' ? 'Temperatūra (°C)' : 'Spiediens (bar)');

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
  

      const legendData = chartType === 'temperature'
  ? [
      { label: "T1", color: COLORS.temp1, id: "temp1" },
      { label: "T2", color: COLORS.temp2, id: "temp2" },
      { label: "T3", color: COLORS.temp3, id: "temp3" }
    ]
  : [
      { label: "Pressure", color: COLORS.pressure, id: "pressure" }
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
    
      // Add toggle buttons using foreignObject
      
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
      
          const addLineWithDots = (data, accessor, color, lineId, transparentSegments = []) => {
            chartArea.selectAll(`.line-${lineId}`).remove();
            chartArea.selectAll(`.temp-dot-${lineId}`).remove();
          
            // Create line segments
            const lineGenerator = d3.line()
              .x(d => xScale(d.time))
              .y(d => yScale(accessor(d)));
          
            for (let i = 0; i < data.length - 1; i++) {
              const segmentData = [data[i], data[i + 1]];
              const isTransparentSegment = transparentSegments.some(
                ([start, end]) => start === i && end === i + 1
              );
          
              chartArea.append('path')
                .datum(segmentData)
                .attr('class', `line-${lineId}`)
                .attr('fill', 'none')
                .attr('stroke', isTransparentSegment ? `${color}80` : color) // Transparency for specific segments
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', isTransparentSegment ? '5,5' : 'none') // Dashed for specific segments
                .attr('d', lineGenerator);
            }
          
            // Add dots
            chartArea.selectAll(null)
              .data(data)
              .enter()
              .append('circle')
              .attr('class', `temp-dot temp-dot-${lineId}`)
              .attr('cx', d => xScale(d.time))
              .attr('cy', d => yScale(accessor(d)))
              .attr('r', 0)
              .attr('fill', color)
              .transition()
              .delay((d, i) => i * 100)
              .duration(100)
              .attr('r', 4);
          };
          
  
      // Draw the lines based on chart type
      const sharedTransparentSegments = [
        [2, 3], // Segment between dots 2 and 3
        [4, 5]  // Segment between dots 4 and 5
      ];
      
      if (chartType === 'temperature') {
        if (lineVisibility.temp1) {
          addLineWithDots(collectedData, d => d.temp1, COLORS.temp1, 'T1', sharedTransparentSegments);
        }
        if (lineVisibility.temp2) {
          addLineWithDots(collectedData, d => d.temp2, COLORS.temp2, 'T2', sharedTransparentSegments);
        }
        if (lineVisibility.temp3) {
          addLineWithDots(collectedData, d => d.temp3, COLORS.temp3, 'T3', sharedTransparentSegments);
        }
      } else {
        addLineWithDots(collectedData, d => d.pressure, COLORS.pressure, 'pressure', sharedTransparentSegments);
      }
      
      


      svg.select('.y-axis-label')
      .text(chartType === 'temperature' ? 'Temperatūra (°C)' : 'Spiediens (bar)');  

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

}, [dimensions, timeRange, isInitialLoad, collectedData, dataPointCount, lineVisibility, chartType]);

return (
  <div ref={containerRef} className="chart" style={{ position: 'relative' }}>
    <div className="svg-container" style={{ height: '500px' }}>
      <svg ref={svgRef} />
    </div>
    {chartType === 'temperature' && (
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          display: 'flex',
          gap: '10px',
        }}
      >
        {['temp1', 'temp2', 'temp3'].map((temp) => (
  <button
    key={temp}
    onClick={() => toggleLine(temp)}
    style={{
      backgroundColor: lineVisibility[temp] ? COLORS[temp] : '#808080', // Use the line color when visible, grey when off
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      padding: '3px 7px',
      cursor: 'pointer',
    }}
  >
    {temp.toUpperCase()}
  </button>
))}

      </div>
    )}
  </div>
);
};

export default MainChart;