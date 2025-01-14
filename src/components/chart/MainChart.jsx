import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Notiflix from 'notiflix';
import { FaSearchPlus, FaSearchMinus, FaUndo } from 'react-icons/fa';
import Sidebar from '../Sidebar';

const MainChart = ({ timeRange, chartType = 'temperature', isPaused, isSidebarOpen, onSidebarClose }) => {
    const tooltipRef = useRef(null);
    const [data, setData] = useState([]);
    const [chartWidth, setChartWidth] = useState(800);  // Example width, adjust as needed
    const [chartHeight, setChartHeight] = useState(400); 
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const zoomRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
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

    

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/data/${chartType}`);
                const csvText = await response.text();
                const parsedData = d3.csvParse(csvText);
        
                const formattedData = parsedData.map((row, index) => {
                    if (chartType === 'pressure') {
                        return {
                            time: index,
                            pressure: parseFloat(row.pressure)
                        };
                    } else if (chartType === 'temperature') {
                        return {
                            time: index,
                            temp1: +row.t1,
                            temp2: +row.t2,
                            temp3: +row.t3,
                            temp4: +row.t4,
                            temp5: +row.t5,
                            temp6: +row.t6,
                            temp7: +row.t7,
                            systemStates: {
                                vacuum: [{ start: index, end: index + 1, isActive: row.vakuums === '1' }],
                                freeze: [{ start: index, end: index + 1, isActive: row.saldetajs === '1' }],
                                vent: [{ start: index, end: index + 1, isActive: row.ventilacija === '1' }]
                            }
                        };
                    } else {
                        return {
                            time: index,
                            T_istaba: +row.t_istaba,
                            T_kodola: +row.t_kodola
                        };
                    }
                });
        
                setCollectedData(formattedData);
                
                if (formattedData.length >= 10 && !isProgramEnded) {
                    setIsProgramEnded(true);
                    Notiflix.Confirm.show(
                        'Programmas Beigas',
                        'Visi soļi tika izpildīti, ko jūs vēlaties darīt?',
                        'Palikt',
                        'Uz Mājām',
                        () => console.log('Stay clicked'),
                        () => window.location.href = '/'
                    );
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [chartType]);

 
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
      if (dimensions.width === 0 || dimensions.height === 0 || collectedData.length === 0) return;
  
      const margin = {
          top: chartType === 'temperature' ? 100 : 50,
          right: 30,
          bottom: chartType === 'temperature' ? 100 : 80,
          left: 60
      };
  
      const width = dimensions.width - margin.left - margin.right;
      const height = dimensions.height - margin.top - margin.bottom;
  
      d3.select(svgRef.current).selectAll("*").remove();
  
      const svg = d3.select(svgRef.current)
          .attr('width', dimensions.width)
          .attr('height', dimensions.height);
  
      const chartArea = svg.append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);
  
      chartArea.append('defs')
      .append('clipPath')
      .attr('id', 'chart-clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height);
  
      const clippedArea = chartArea.append('g')
          .attr('clip-path', 'url(#chart-clip)');
  
      const xScale = d3.scaleLinear()
          .domain([0, collectedData.length - 1])
          .range([0, width]);
  
          const yScale = d3.scaleLinear()
          .domain(chartType === 'pressure' 
              ? [d3.min(collectedData, d => d.pressure) - 10, d3.max(collectedData, d => d.pressure) + 10]
              : [-40, -25])
          .range([height, 0]);
  
          const zoom = d3.zoom()
  .scaleExtent([1, 20])
  .translateExtent([[0, 0], [width, height]]) // Prevent panning to the left and top
  .extent([[0, 0], [width, height]]) // Set bounds for zoom extent
  .on('zoom', (event) => {
    const { transform } = event;
    
    // Ensure both axes are clamped to the chart area
    const newXScale = transform.rescaleX(xScale).clamp(true); // Lock the x-axis to prevent going out of bounds
    const newYScale = transform.rescaleY(yScale).clamp(true); // Clamp y-axis as well
    
    // Update axes
    chartArea.select('.x-axis').call(d3.axisBottom(newXScale));
    chartArea.select('.y-axis').call(d3.axisLeft(newYScale));
    
    // Update lines
    chartArea.selectAll('.line')
      .attr('d', (d) => {
        const lineGenerator = d3.line()
          .x(d => newXScale(d.time))
          .y(d => newYScale(d[d.key]));
        return lineGenerator(d);
      });
    
    // Update dots
    chartArea.selectAll('.dot')
      .attr('cx', d => newXScale(d.time))
      .attr('cy', d => newYScale(d[d.key]));
    
    // Update pressure dots
    chartArea.selectAll('.pressure-dot')
      .attr('cx', d => newXScale(d.time))
      .attr('cy', d => newYScale(d.pressure));  // Use the correct 'pressure' value
  });

        
  
      const zoomRect = chartArea.append('rect')
          .attr('width', width)
          .attr('height', height)
          .style('fill', 'none')
          .style('pointer-events', 'all')
          .call(zoom);
  
      chartArea.append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(xScale));
  
      chartArea.append('g')
          .attr('class', 'y-axis')
          .call(d3.axisLeft(yScale));
  
      chartArea.append('g')
          .attr('class', 'grid')
          .call(d3.axisLeft(yScale)
              .ticks(10)
              .tickSize(-width)
              .tickFormat(''))
          .selectAll('.tick line')
          .attr('stroke', '#ccc')
          .attr('stroke-opacity', 0.2);
  
      chartArea.append('g')
          .attr('class', 'grid')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(xScale)
              .ticks(10)
              .tickSize(-height)
              .tickFormat(''))
          .selectAll('.tick line')
          .attr('stroke', '#ccc')
          .attr('stroke-opacity', 0.2);
  
// Existing drawLine function for non-pressure charts
const drawLine = (key, color) => {
    if (!lineVisibility[key]) return;

    const filteredData = collectedData.map(d => ({
        time: d.time,
        [key]: d[key],
        key: key
    })).filter(d => d[key] !== undefined);

    const lineGenerator = d3.line()
        .x(d => xScale(d.time))
        .y(d => yScale(d[key]));

    chartArea.append('path')
        .datum(filteredData)
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', lineGenerator);

    chartArea.selectAll(`.dot-${key}`)
        .data(filteredData)
        .enter()
        .append('circle')
        .attr('class', `dot dot-${key}`)
        .attr('cx', d => xScale(d.time))
        .attr('cy', d => yScale(d[key]))
        .attr('r', 3)
        .attr('fill', color)
        .on('mouseover', (event, d) => {
            const tooltip = tooltipRef.current;
            tooltip.style.visibility = 'visible';
            tooltip.style.left = `${event.pageX}px`;
            tooltip.style.top = `${event.pageY - 30}px`;
            tooltip.querySelector('#tooltip-value').textContent = `${key}: ${d[key].toFixed(2)}`;
        })
        .on('mouseout', () => {
            tooltipRef.current.style.visibility = 'hidden';
        });
};

// New drawPressureLine function specifically for the pressure chart
const drawPressureLine = (key, color) => {
    const filteredData = collectedData.map(d => ({
        time: d.time,
        [key]: d[key],
        key: key
    })).filter(d => d[key] !== undefined);

    const lineGenerator = d3.line()
        .x(d => xScale(d.time))
        .y(d => yScale(d[key]));

    chartArea.append('path')
        .datum(filteredData)
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', lineGenerator);

    chartArea.selectAll('.pressure-dot')
        .data(filteredData)
        .enter()
        .append('circle')
        .attr('class', 'pressure-dot')
        .attr('cx', d => xScale(d.time))
        .attr('cy', d => yScale(d[key]))
        .attr('r', 3)  // Adjusted radius to match other charts
        .attr('fill', color)
        .on('mouseover', (event, d) => {
            const tooltip = tooltipRef.current;
            tooltip.style.visibility = 'visible';
            tooltip.style.left = `${event.pageX}px`;
            tooltip.style.top = `${event.pageY - 30}px`;
            tooltip.querySelector('#tooltip-value').textContent = `Pressure: ${d[key].toFixed(2)}`;
        })
        .on('mouseout', () => {
            tooltipRef.current.style.visibility = 'hidden';
        });
};



        if (chartType === 'pressure') {
            drawPressureLine('pressure', COLORS.pressure);
        } else if (chartType === 'temperature') {
            ['temp1', 'temp2', 'temp3', 'temp4', 'temp5', 'temp6', 'temp7'].forEach(key => {
                drawLine(key, COLORS[key]);
            });
        } else if (chartType === 'temperature2') {
            ['T_istaba', 'T_kodola'].forEach(key => {
                drawLine(key, COLORS[key]);
            });
        }
  
      if (chartType === 'temperature') {
          ['temp1', 'temp2', 'temp3', 'temp4', 'temp5', 'temp6', 'temp7'].forEach(key => {
              drawLine(key, COLORS[key]);
          });
  
          // Variables for timelines
          const timelineHeight = 12;
          const timelineGap = 10;
          const timelineStartY = height + margin.bottom * 1.3;
  
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
  
              collectedData.forEach((d, i) => {
                  if (d.systemStates[system][0].isActive) {
                      svg.append('rect')
                          .attr('x', margin.left + xScale(i))
                          .attr('y', yPos)
                          .attr('width', xScale(1) - xScale(0))
                          .attr('height', timelineHeight)
                          .attr('fill', COLORS[system])
                          .attr('opacity', 0.7);
                  }
              });
          });
      } else if (chartType === 'temperature2') {
          ['T_istaba', 'T_kodola'].forEach(temp => {
              drawLine(temp, COLORS[temp]);
          });
      } else if (chartType === 'pressure') {
          drawLine('pressure', COLORS.pressure);
      }
  
      zoomRef.current = { zoom, zoomRect, xScale, yScale };
  }, [dimensions, timeRange, collectedData, lineVisibility, chartType]);
  

    const toggleLine = (line) => {
        setLineVisibility(prev => ({ ...prev, [line]: !prev[line] }));
    };

    const handleZoomIn = () => {
        const { zoom, zoomRect } = zoomRef.current;
        const currentTransform = d3.zoomTransform(zoomRect.node());
        const newTransform = currentTransform.scale(1.2);
        zoomRect.call(zoom.transform, newTransform);
    };

    const handleZoomOut = () => {
        const { zoom, zoomRect } = zoomRef.current;
        const currentTransform = d3.zoomTransform(zoomRect.node());
        const newTransform = currentTransform.scale(1 / 1.2);
        zoomRect.call(zoom.transform, newTransform);
    };

    const handleReset = () => {
        const { zoom, zoomRect } = zoomRef.current;
        zoomRect.call(zoom.transform, d3.zoomIdentity);
    };

    return (
        <div ref={containerRef} className="chart" style={{ position: 'relative', width: '100%' }}>

<div
                ref={tooltipRef}
                style={{
                    position: 'absolute',
                    padding: '5px 10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    borderRadius: '5px',
                    pointerEvents: 'none',
                    visibility: 'hidden', // Initially hidden
                    transform: 'translate(-50%, -100%)', // Tooltip above the point
                }}
            >
              <span id="tooltip-value">Y: </span>
              </div>
            {isSidebarOpen && <Sidebar isOpen={isSidebarOpen} onClose={onSidebarClose} />}
            <div className="svg-container" style={{ height: '100%', width: '100%' }}>
                <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
            </div>

            {(chartType === 'temperature' || chartType === 'temperature2') && (
                <div style={{ position: 'absolute', left: '10px', display: 'flex', gap: '10px' }}>
                    {chartType === 'temperature' 
                        ? ['temp1', 'temp2', 'temp3', 'temp4', 'temp5', 'temp6', 'temp7'].map(temp => (
                            <button
                                key={temp}
                                onClick={() => toggleLine(temp)}
                                style={{
                                    backgroundColor: COLORS[temp],
                                    color: 'white',
                                    padding: '5px 10px',
                                    marginTop: '20px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                {temp}
                            </button>
                        ))
                        : ['T_istaba', 'T_kodola'].map(temp => (
                            <button
                                key={temp}
                                onClick={() => toggleLine(temp)}
                                style={{
                                    backgroundColor: COLORS[temp],
                                    color: 'white',
                                    padding: '5px 10px',
                                    marginTop: '5px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                }}
                            >
                                {temp}
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
