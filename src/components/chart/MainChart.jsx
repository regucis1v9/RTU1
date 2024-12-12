import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Notiflix from 'notiflix';
import { FaSearchPlus, FaSearchMinus, FaUndo } from 'react-icons/fa';
import Sidebar from '../Sidebar';

const MainChart = ({ timeRange, chartType = 'temperature', isPaused, isSidebarOpen, onSidebarClose}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const zoomRef = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [collectedData, setCollectedData] = useState([]);
  const [dataPointCount, setDataPointCount] = useState(0);
  const [isProgramEnded, setIsProgramEnded] = useState(false);
  const [lineVisibility, setLineVisibility] = useState({
    temp1: true, temp2: true, temp3: true, temp4: true,
    temp5: true, temp6: true, temp7: true,
    T_istaba: true, T_kodola: true
  });

  const TIME_RANGES = {
    '1m': 60, '5m': 300, '15m': 900,
    '30m': 1800, '1h': 3600, '4h': 14400,
  };
  
  const COLORS = {
    temp1: '#ff9f1c', temp2: '#0AF7DD', temp3: '#00ff09',
    temp4: '#ff00ff', temp5: '#ff6347', temp6: '#4169e1',
    temp7: '#ffd700', 
    T_istaba: '#FF4500', T_kodola: '#1E90FF',
    vacuum: '#4a90e2', freeze: '#e25c5c',
    vent: '#50c878', pressure: '#4a90e2'
  };

  const toggleLine = (line) => {
    setLineVisibility(prev => ({ ...prev, [line]: !prev[line] }));
  };

  const handleZoomIn = () => {
    const { zoom, zoomRect, xScale, yScale } = zoomRef.current;
    const currentTransform = d3.zoomTransform(zoomRect.node());
    const newTransform = currentTransform.scale(1.2);
    zoomRect.call(zoom.transform, newTransform);
  };

  const handleZoomOut = () => {
    const { zoom, zoomRect, xScale, yScale } = zoomRef.current;
    const currentTransform = d3.zoomTransform(zoomRect.node());
    const newTransform = currentTransform.scale(1 / 1.2);
    zoomRect.call(zoom.transform, newTransform);
  };

  const handleReset = () => {
    const { zoom, zoomRect } = zoomRef.current;
    zoomRect.call(zoom.transform, d3.zoomIdentity);
  };

  const showProgramEndDialog = () => {
    Notiflix.Confirm.show(
      'Programmas Beigas', 
      'Visi soļi tika izpildīti, ko jūs vēlaties darīt?',
      'Palikt',
      'Uz Mājām',
      () => console.log('View Graphs clicked'),
      () => window.location.href = '/'
    );
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
      vacuum: [], freeze: [], vent: []
    } : {
      vacuum: [generateSystemState(prevPoint?.systemStates.vacuum, secondsElapsed)],
      freeze: [generateSystemState(prevPoint?.systemStates.freeze, secondsElapsed)],
      vent: [generateSystemState(prevPoint?.systemStates.vent, secondsElapsed)]
    };

    return {
      time: secondsElapsed,
      systemStates,
      temp1: Math.sin(secondsElapsed / 500) * 6 - 34 + Math.random() * 2,
      temp2: Math.sin(secondsElapsed / 550) * 5 - 32 + Math.random() * 2,
      temp3: Math.sin(secondsElapsed / 600) * 4 - 36 + Math.random() * 2,
      temp4: Math.sin(secondsElapsed / 650) * 5 - 30 + Math.random() * 2,
      temp5: Math.sin(secondsElapsed / 700) * 6 - 33 + Math.random() * 2,
      temp6: Math.sin(secondsElapsed / 750) * 4 - 35 + Math.random() * 2,
      temp7: Math.sin(secondsElapsed / 800) * 5 - 31 + Math.random() * 2,
      T_istaba: Math.sin(secondsElapsed / 400) * 7 - 35 + Math.random() * 2,
      T_kodola: Math.sin(secondsElapsed / 450) * 6 - 33 + Math.random() * 2,
      pressure: Math.sin(secondsElapsed / 300) * 50 + 760 + Math.random() * 10,
    };
  };

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
    if (!isInitialLoad || isProgramEnded) return;

    const initialDelay = setTimeout(() => {
      const startTimeRef = Date.now();
      const startTime = 0;

      if (dataPointCount === 0) {
        const firstPoint = generateDataPoint(startTime, [], true);
        setCollectedData([firstPoint]);
        setDataPointCount(1);
      }
      
      setIsInitialLoad(false);

      const dataInterval = setInterval(() => {
        setDataPointCount(prev => {
          const newCount = prev + 1;
          if (newCount <= 9) {
            const secondsElapsed = Math.floor((Date.now() - startTimeRef) / 1000);
            setCollectedData(prevData => {
              const newDataPoint = generateDataPoint(secondsElapsed, prevData);
              return [...prevData, newDataPoint];
            });
          } else if (!isProgramEnded) {
            setIsProgramEnded(true);
            clearInterval(dataInterval);
            showProgramEndDialog();
          }
          return newCount;
        });
      }, 10001);

      return () => clearInterval(dataInterval);
    }, 0);

    return () => clearTimeout(initialDelay);
  }, [isInitialLoad, isProgramEnded]);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || collectedData.length === 0) return;
    const margin = (() => {
      switch(chartType) {
        case 'temperature':
          return { top: 100, right: 30, bottom: 100, left: 60 };
        case 'pressure':
          return { top: 50, right: 30, bottom: 90, left: 60 }; // Increased bottom margin
        case 'temperature2':
          return { top: 50, right: 30, bottom: 80, left: 60 }; // Adjusted bottom margin
        default:
          return { top: 50, right: 30, bottom: 50, left: 60 };
      }
    })();
    
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;
  
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

    const chartArea = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

    const clipPath = svg.append('defs')
      .append('clipPath')
      .attr('id', 'chart-clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height);

    const latestTime = collectedData[collectedData.length - 1].time;
    const timeWindow = TIME_RANGES[timeRange];
    
    const startTime = Math.max(0, latestTime - timeWindow);
    const filteredData = collectedData.filter(d => d.time >= startTime && d.time <= startTime + timeWindow);

    const xScale = d3.scaleLinear()
      .domain([startTime, startTime + timeWindow])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(chartType === 'temperature' 
        ? [
            Math.min(...filteredData.map(d => 
              Math.min(
                d.temp1 ?? -Infinity, d.temp2 ?? -Infinity, 
                d.temp3 ?? -Infinity, d.temp4 ?? -Infinity, 
                d.temp5 ?? -Infinity, d.temp6 ?? -Infinity, 
                d.temp7 ?? -Infinity
              )
            )) - 2, 
            Math.max(...filteredData.map(d => 
              Math.max(
                d.temp1 ?? Infinity, d.temp2 ?? Infinity, 
                d.temp3 ?? Infinity, d.temp4 ?? Infinity, 
                d.temp5 ?? Infinity, d.temp6 ?? Infinity, 
                d.temp7 ?? Infinity
              )
            )) + 2
          ]
        : chartType === 'temperature2'
        ? [
            Math.min(...filteredData.map(d => 
              Math.min(
                d.T_istaba ?? -Infinity, d.T_kodola ?? -Infinity
              )
            )) - 2, 
            Math.max(...filteredData.map(d => 
              Math.max(
                d.T_istaba ?? Infinity, d.T_kodola ?? Infinity
              )
            )) + 2
          ]
        : [740, 780])
      .range([height, 0]);

    const zoom = d3.zoom()
      .scaleExtent([1, 20])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        const { transform } = event;
        const newXScale = transform.rescaleX(xScale);
        const newYScale = transform.rescaleY(yScale);

        chartArea.select('.x-axis').call(d3.axisBottom(newXScale).ticks(10));
        chartArea.select('.y-axis').call(d3.axisLeft(newYScale).ticks(10));

        xGridlines.call(d3.axisBottom(newXScale)
          .tickSize(-height)
          .tickFormat(''));

        yGridlines.call(d3.axisLeft(newYScale)
          .tickSize(-width)
          .tickFormat(''));

        chartArea.selectAll('.line')
          .attr('d', d => {
            const lineGenerator = d3.line()
              .x(d => newXScale(d.time))
              .y(d => newYScale(d[d.key]));
            return lineGenerator(d);
          });

        chartArea.selectAll('.dot')
          .attr('cx', d => newXScale(d.time))
          .attr('cy', d => newYScale(d[d.key]));
      });

    const zoomRect = chartArea.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .call(zoom);

    zoomRect.on('wheel.zoom', (event) => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        const delta = event.deltaY * -0.01;
        const currentTransform = d3.zoomTransform(zoomRect.node());
        const newScale = currentTransform.k * Math.pow(1.1, delta);
        const point = d3.pointer(event);
        
        zoom.transform(zoomRect, d3.zoomIdentity
          .translate(point[0], point[1])
          .scale(Math.min(Math.max(newScale, 1), 20))
          .translate(-point[0], -point[1])
        );
      }
    });

    const xGridlines = chartArea.append('g')
      .attr('class', 'gridline x-gridline')
      .attr('transform', `translate(0,${height})`)
      .style('color', '#e0e0e0')
      .style('opacity', 0.1);

    const yGridlines = chartArea.append('g')
      .attr('class', 'gridline y-gridline')
      .style('color', '#e0e0e0')
      .style('opacity', 0.1);

    xGridlines.call(d3.axisBottom(xScale)
      .ticks(10)
      .tickSize(-height)
      .tickFormat(''));

    yGridlines.call(d3.axisLeft(yScale)
      .ticks(10)
      .tickSize(-width)
      .tickFormat(''));

    const renderAxes = () => {
      const xAxis = d3.axisBottom(xScale).ticks(10);
    
      const yAxis = d3.axisLeft(yScale)
        .ticks(10)
        .tickFormat((d) => d);

      chartArea.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);

      chartArea.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);
    };

    const renderChartElements = () => {
      if (chartType === 'temperature' || chartType === 'temperature2' || chartType === 'pressure') {
        const titleText = chartType === 'pressure' ? 'Pressure' : 
                          chartType === 'temperature2' ? 'Temperature' : 
                          'Temperature';
        const showFileText = chartType === 'temperature'; // Only show the file text for 'temperature'
    
        // Title
        chartArea.append('text')
          .attr('x', width / 2)
          .attr('y', chartType === 'pressure' || chartType === 'temperature2' ? -9 : -margin.top / 2)
          .attr('text-anchor', 'middle')
          .attr('fill', '#333')
          .attr('font-size', '20px')
          .attr('font-weight', 'bold')
          .text(titleText);
    
        // File text (only for 'temperature')
        if (showFileText) {
          chartArea.append('text')
            .attr('x', width / 2)
            .attr('y', -margin.top / 4)
            .attr('text-anchor', 'middle')
            .attr('fill', '#666')
            .attr('font-size', '14px')
            .text('12-12-2024-project1.csv');
        }
    
        // Solis Text
        chartArea.append('text')
          .attr('x', width)
          .attr('y', -margin.top / 4)
          .attr('text-anchor', 'end')
          .attr('fill', '#666')
          .attr('font-size', '14px')
          .text(`Solis: ${dataPointCount}/10`);
      }
    
      renderAxes();
    
      if (chartType === 'temperature') {
        ['temp1', 'temp2', 'temp3', 'temp4', 'temp5', 'temp6', 'temp7'].forEach(tempKey => {
          if (lineVisibility[tempKey]) {
            addLineWithDots(filteredData, d => d[tempKey], COLORS[tempKey], tempKey);
          }
        });
      } else if (chartType === 'temperature2') {
        ['T_istaba', 'T_kodola'].forEach(tempKey => {
          if (lineVisibility[tempKey]) {
            addLineWithDots(filteredData, d => d[tempKey], COLORS[tempKey], tempKey);
          }
        });
      } else if (chartType === 'pressure') {
        addLineWithDots(filteredData, d => d.pressure, COLORS.pressure, 'pressure');
      }
    };
    

    const addLineWithDots = (data, accessor, color, lineId) => {
      const lineGenerator = d3.line()
        .x(d => xScale(d.time))
        .y(d => yScale(accessor(d)));

      const sourceData = data.filter(d => 
        accessor(d) !== undefined && 
        !isNaN(accessor(d))
      ).map(d => ({ ...d, key: lineId }));

      chartArea.append('path')
        .datum(sourceData)
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 3)
        .style('opacity', 0.7)
        .attr('clip-path', 'url(#chart-clip)')
        .attr('d', lineGenerator);

      chartArea.selectAll(`.dot-${lineId}`)
        .data(sourceData)
        .enter()
        .append('circle')
        .attr('class', `dot dot-${lineId}`)
        .attr('cx', d => xScale(d.time))
        .attr('cy', d => yScale(accessor(d)))
        .attr('r', 4)
        .attr('fill', color)
        .style('opacity', 0.7)
        .attr('clip-path', 'url(#chart-clip)');
    };

    if (chartType === 'temperature') {
      const timelineHeight = 15;
      const timelineGap = 10;
      const systemLabelWidth = 80;
      const timelineStartY = height + margin.bottom / 1 + 25; // Move down by 20 pixels

      const systems = ['vacuum', 'freeze', 'vent'];
      const systemLabels = {
        vacuum: 'Vakuums',
        freeze: 'Saldētājs', 
        vent: 'Ventilācija'
      };

      systems.forEach((system, index) => {
        const yPos = timelineStartY + index * (timelineHeight + timelineGap);

        svg.append('text')
          .attr('x', margin.left - 10)
          .attr('y', yPos + timelineHeight / 2)
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#333')
          .attr('font-size', '8px')
          .attr('font-weight', 'bold')
          .text(systemLabels[system]);

        svg.append('rect')
          .attr('x', margin.left)
          .attr('y', yPos)
          .attr('width', width)
          .attr('height', timelineHeight)
          .attr('stroke', '#d0d0d0')
          .attr('stroke-width', 0.5)
          .attr('fill', 'none');

        const allStates = collectedData.map(d => d.systemStates[system][0]).filter(Boolean);
        
        allStates.forEach(state => {
          if (state.isActive) {
            svg.append('rect')
              .attr('x', margin.left + xScale(state.start))
              .attr('y', yPos)
              .attr('width', Math.max(0, xScale(state.end) - xScale(state.start)))
              .attr('height', timelineHeight)
              .attr('fill', COLORS[system])
              .attr('opacity', 0.7)
              .attr('stroke', COLORS[system])
              .attr('stroke-width', 0.5);
          }
        });
      });
    }

    zoomRef.current = { zoom, zoomRect, xScale, yScale };

    renderChartElements();
  }, [dimensions, timeRange, collectedData, dataPointCount, lineVisibility, chartType]);

  return (
    <div
      ref={containerRef}
      className="chart"
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      {isSidebarOpen && <Sidebar isOpen={isSidebarOpen} onClose={onSidebarClose} />}
      <div className="svg-container" style={{ height: '100%', width: '100%' }}>
        <svg
          ref={svgRef}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {(chartType === 'temperature' || chartType === 'temperature2') && (
        <div
          style={{
            position: 'absolute',
            left: '10px',
            display: 'flex',
            gap: '10px',
          }}
        >
          {chartType === 'temperature' 
            ? ['temp1', 'temp2', 'temp3', 'temp4', 'temp5', 'temp6', 'temp7'].map((temp) => (
                <button
                  key={temp}
                  onClick={() => toggleLine(temp)}
                  style={{
                    backgroundColor: lineVisibility[temp] ? COLORS[temp] : '#808080',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '3px 7px',
                    cursor: 'pointer',
                    marginTop: '10px',
                  }}
                >
                  {temp.toUpperCase()}
                </button>
              ))
            : ['T_istaba', 'T_kodola'].map((temp) => (
                <button
                  key={temp}
                  onClick={() => toggleLine(temp)}
                  style={{
                    backgroundColor: lineVisibility[temp] ? COLORS[temp] : '#808080',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '3px 7px',
                    cursor: 'pointer',
                    marginTop: '10px',
                  }}
                >
                  {temp.toUpperCase()}
                </button>
              ))
          }
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'flex',
          flexDirection: 'row',
          gap: '10px',
        }}
      >
        <button
          onClick={handleZoomIn}
          style={{
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FaSearchPlus />
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            backgroundColor: '#ff5722',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FaSearchMinus />
        </button>
        <button
          onClick={handleReset}
          style={{
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FaUndo />
        </button>
      </div>
    </div>
  );
};

export default MainChart;
