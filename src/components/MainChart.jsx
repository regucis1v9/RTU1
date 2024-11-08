import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const MainChart = () => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [timeRange, setTimeRange] = useState('1h');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [customMinutes, setCustomMinutes] = useState('60');
  const [customSubmissionCount, setCustomSubmissionCount] = useState(0);

  const COLORS = {
    temp1: '#ff9f1c',
    temp2: '#0AF7DD',
    temp3: '#00ff09'
  };

  const baseTimeRanges = {
    '1min': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    '5min': [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    '30min': [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300],
    '1h': [0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600],
    '4h': [0, 240, 480, 720, 960, 1200, 1440, 1680, 1920, 2160, 2400],
    'all': [0, 480, 960, 1440, 1920, 2400, 2880, 3360, 3840, 4320, 4800]
  };

  const generateCustomTimeRange = (minutes) => {
    const step = minutes / 10;
    return Array.from({ length: 11 }, (_, i) => i * step);
  };

  const timeRanges = {
    ...baseTimeRanges,
    custom: generateCustomTimeRange(Number(customMinutes))
  };

  const generateData = (times) => {
    return times.map(time => ({
      time,
      temp1: Math.sin(time / 500) * 10 + 25 + Math.random() * 2,
      temp2: Math.sin(time / 500) * 8 + 22 + Math.random() * 2,
      temp3: Math.sin(time / 500) * 6 + 20 + Math.random() * 2,
    }));
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
    if (dimensions.width === 0 || dimensions.height === 0) return;

    // Clear previous chart and legend
    d3.select(svgRef.current).selectAll("*").remove();

    // Don't render if custom time is empty
    if (timeRange === 'custom' && !customMinutes) return;

    const data = generateData(timeRanges[timeRange]);

    const margin = { top: 50, right: 30, bottom: 30, left: 40 }; // Increase top margin for legend space
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(0, -${margin.top - 20})`);

    const legendData = [
      { label: "T1", color: COLORS.temp1 },
      { label: "T2", color: COLORS.temp2 },
      { label: "T3", color: COLORS.temp3 }
    ];

    legendData.forEach((item, index) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(${index * 80}, 0)`);

      // Add color circle
      legendRow.append("circle")
        .attr("cx", 10)
        .attr("cy", 10)
        .attr("r", 6)
        .attr("fill", item.color);

      // Add text label
      legendRow.append("text")
        .attr("x", 20)
        .attr("y", 14)
        .attr("fill", "#616060")
        .attr("font-size", "12px")
        .text(item.label);
    });

    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.time), d3.max(data, d => d.time)])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(data, d => Math.min(d.temp1, d.temp2, d.temp3)) - 2,
        d3.max(data, d => Math.max(d.temp1, d.temp2, d.temp3)) + 2
      ])
      .range([height, 0]);

    // Add grid lines with animation
    svg.append('g')
      .attr('class', 'grid')
      .attr('stroke', '#333')
      .attr('stroke-opacity', 0.1)
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat('')
      );

    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .attr('stroke', '#333')
      .attr('stroke-opacity', 0.1)
      .call(d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat('')
      );

    // Add axes with animation
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .attr('class', 'axis')
      .attr('color', '#666')
      .call(d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d => `${d}m`));

    svg.append('g')
      .attr('class', 'axis')
      .attr('color', '#666')
      .call(d3.axisLeft(yScale)
        .tickFormat(d => `${d}°`));

    const createLine = (accessor) => 
      d3.line()
        .x(d => xScale(d.time))
        .y(d => yScale(accessor(d)))
        .curve(d3.curveCatmullRom.alpha(0.5));

    const addLineWithDotsAndArea = (data, accessor, color, index) => {
      const area = d3.area()
        .x(d => xScale(d.time))
        .y0(height)
        .y1(d => yScale(accessor(d)))
        .curve(d3.curveCatmullRom.alpha(0.5));

      svg.append('path')
        .datum(data)
        .attr('class', `area-${index}`)
        .attr('fill', `url(#line-gradient-${Object.keys(COLORS)[index - 1]})`)
        .attr('d', area)
        .style('opacity', 0)
        .transition()
        .duration(800)
        .style('opacity', 0.4);

      const path = svg.append('path')
        .datum(data)
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

      svg.selectAll(null)
        .data(data)
        .enter()
        .append('circle')
        .attr('class', `temp-dot-${index}`)
        .attr('cx', d => xScale(d.time))
        .attr('cy', d => yScale(accessor(d)))
        .attr('r', 0)
        .attr('fill', color)
        .transition()
        .delay((d, i) => i * 100)
        .duration(100)
        .attr('r', 4);
    };

    addLineWithDotsAndArea(data, d => d.temp1, COLORS.temp1, 1);
    addLineWithDotsAndArea(data, d => d.temp2, COLORS.temp2, 2);
    addLineWithDotsAndArea(data, d => d.temp3, COLORS.temp3, 3);

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#848484')
      .attr('font-size', '16px')
      .attr('opacity', 0)
      .text('PLAUKTU TEMPERATŪRAS')
      .transition()
      .attr('opacity', 1);

  }, [dimensions, timeRange, customMinutes, customSubmissionCount]);

  const handleCustomTimeSubmit = (e) => {
    e.preventDefault();
    const numMinutes = Number(customMinutes);
    if (numMinutes > 0 && numMinutes <= 240) {
      setTimeRange('custom');
      setCustomSubmissionCount(prev => prev + 1);
    }
  };

  const handleInputChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');

    if (value && value !== "000" && !/^0/.test(value) && Number(value) <= 240) {
      setCustomMinutes(value);
    } else if (value === "") {
      setCustomMinutes("");
      setTimeRange('custom');
      setCustomSubmissionCount(prev => prev + 1);
    }
  };

  return (
    <div ref={containerRef} className="chart">
      <div className="svg-container">
        <svg ref={svgRef} />
      </div>
      <div className="button-container">
        {Object.keys(baseTimeRanges).map((range) => (
          <button 
            key={range}
            onClick={() => setTimeRange(range)}
            className={timeRange === range ? 'active' : ''}
          >
            <span>{range.toUpperCase()}</span>
          </button>
        ))}
        {/* <form className="custom-time-form" onSubmit={handleCustomTimeSubmit}>
          <input
            type="text"
            value={customMinutes}
            onChange={handleInputChange}
            className={timeRange === 'custom' ? 'active' : ''}
            placeholder="Min (max 240)"
          />
        </form> */}
      </div>
    </div>
  );
};

export default MainChart;
