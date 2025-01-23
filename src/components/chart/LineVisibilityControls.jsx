import React, { useState } from 'react';

const LineVisibilityControls = ({ onVisibilityChange }) => {
  const [visibleLines, setVisibleLines] = useState({
    temp1: true,
    temp2: true,
    temp3: true
  });

  const toggleLine = (line) => {
    const newVisibility = {
      ...visibleLines,
      [line]: !visibleLines[line]
    };
    setVisibleLines(newVisibility);
    onVisibilityChange(newVisibility);
  };

  const showAll = () => {
    const allVisible = {
      temp1: true,
      temp2: true,
      temp3: true
    };
    setVisibleLines(allVisible);
    onVisibilityChange(allVisible);
  };

  return (
    <div className="flex items-center gap-4 mb-4">
      <button
        onClick={() => toggleLine('temp1')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
          ${visibleLines.temp1 
            ? 'bg-orange-500 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
      >
        T1
      </button>
      <button
        onClick={() => toggleLine('temp2')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
          ${visibleLines.temp2 
            ? 'bg-cyan-500 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
      >
        T2
      </button>
      <button
        onClick={() => toggleLine('temp3')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
          ${visibleLines.temp3 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
      >
        T3
      </button>
      <button
        onClick={showAll}
        className="px-3 py-1 rounded-md text-sm font-medium bg-gray-700 text-white hover:bg-gray-800 transition-colors"
      >
        All
      </button>
    </div>
  );
};

export default LineVisibilityControls;