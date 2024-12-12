import React, { useState, useRef, useEffect } from 'react';
import { 
  IconFile, 
  IconPlus, 
  IconSearch, 
  IconCode, 
  IconDownload,
  IconClipboard,
  IconUpload,
  IconTrash,
  IconX
} from '@tabler/icons-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import { toast, Toaster } from 'react-hot-toast';

export default function CodeEditor() {
  const [csvFiles, setCsvFiles] = useState([]);
  const [draggedFile, setDraggedFile] = useState(null);
  const [currentCode, setCurrentCode] = useState('');
  const [lineNumbers, setLineNumbers] = useState([1]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [fileName, setFileName] = useState('');
  const [hoverFile, setHoverFile] = useState(null);

  const codeEditorRef = useRef(null);
  const searchInputRef = useRef(null);
  const textareaRef = useRef(null);
  const lineNumberContainerRef = useRef(null);
  const codeHighlightRef = useRef(null);

  const highlightCode = (code) => {
    let highlightedCode = Prism.highlight(code, Prism.languages.javascript, 'javascript');
    
    if (searchTerm && isSearchActive) {
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      highlightedCode = highlightedCode.replace(
        regex, 
        '<mark class="search-highlight">$1</mark>'
      );
    }
    
    return highlightedCode;
  };

  const handleCodeChange = (e) => {
    const code = e.target.value;
    setCurrentCode(code);

    const lines = code.split('\n');
    setLineNumbers(lines.map((_, index) => index + 1));
  };

  const handleDeleteFile = async (file) => {
    try {
      const response = await fetch(`http://localhost:3002/delete-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name }),
      });

      if (response.ok) {
        setCsvFiles(csvFiles.filter(f => f.name !== file.name));
        
        // Reset current code and file name if deleted file was currently open
        if (fileName === file.name.replace('.csv', '')) {
          setCurrentCode('');
          setFileName('');
        }
        toast.success(`File "${file.name}" deleted successfully`);
      } else {
        toast.error('Failed to delete file');
      }
    } catch (error) {
      toast.error('Error deleting file');
    }
  };
  const handleFileClick = (file) => {
    setCurrentCode(file.content);
    const lines = file.content.split('\n');
    setLineNumbers(lines.map((_, index) => index + 1));

    const fileNameWithoutExtension = file.name.replace('.csv', '');
    setFileName(fileNameWithoutExtension);
  };

  const handleSaveCode = async () => {
    if (!fileName.trim()) {
      alert('Please provide a valid file name before saving.');
      return;
    }
  
    if (!/^[a-zA-Z0-9_-]+$/.test(fileName)) {
      alert('File name can only contain letters, numbers, underscores, and dashes.');
      return;
    }
  
    const oldFileName = draggedFile?.name.replace('.csv', ''); // Get old file name without ".csv"
    console.log('Old File Name:', oldFileName); // Debugging
  
    try {
      const response = await fetch('http://localhost:3002/save-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,  // New file name
          code: currentCode,  // Content of the file
          oldFileName,  // Old file name
        }),
      });
  
      if (response.ok) {
        setTerminalOutput([
          ...terminalOutput,
          { type: 'output', message: `File "${fileName}.csv" saved successfully.` },
        ]);
  
        // If the file name has changed, update the draggedFile state with the new file name
        if (oldFileName && oldFileName !== fileName) {
          setDraggedFile({ ...draggedFile, name: `${fileName}.csv` });
        }
      } else {
        const error = await response.text();
        setTerminalOutput([
          ...terminalOutput,
          { type: 'error', message: `Failed to save file: ${error}` },
        ]);
      }
    } catch (error) {
      setTerminalOutput([
        ...terminalOutput,
        { type: 'error', message: `An error occurred: ${error.message}` },
      ]);
    }
  };
  
  
  
  

  const fetchCsvFiles = async () => {
    try {
      const response = await fetch('http://localhost:3002/get-codes');
      if (response.ok) {
        const files = await response.json();
  
        // Preserve the current file if it exists in the new file list
        setCsvFiles(prevFiles => {
          const updatedFiles = files.map(newFile => {
            const existingFile = prevFiles.find(f => f.name === newFile.name);
            return existingFile ? { ...existingFile, ...newFile } : newFile;
          });
  
          // Ensure any file currently being hovered or dragged is preserved
          const preservedDraggedFile = updatedFiles.find(f => f.name === draggedFile?.name);
          if (preservedDraggedFile) {
            setDraggedFile(preservedDraggedFile);
          }
  
          const preservedHoverFile = updatedFiles.find(f => f.name === hoverFile?.name);
          if (preservedHoverFile) {
            setHoverFile(preservedHoverFile);
          }
  
          return updatedFiles;
        });
      } else {
        console.error('Failed to fetch files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };
  



  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
  };

  const handleSearchToggle = () => {
    setIsSearchActive(!isSearchActive);
    if (!isSearchActive) {
      setTimeout(() => {
        searchInputRef.current?.focus();
        setSearchTerm('');
        setSearchResults([]);
        setCurrentSearchIndex(-1);
      }, 100);
    }
  };

  const performSearch = () => {
    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'gi');
      const matches = [];
      const lines = currentCode.split('\n');
      
      lines.forEach((line, index) => {
        const lineMatches = line.matchAll(regex);
        for (const match of lineMatches) {
          matches.push({
            line: index + 1,
            index: match.index,
            text: line
          });
        }
      });

      setSearchResults(matches);
      setCurrentSearchIndex(matches.length > 0 ? 0 : -1);

      if (matches.length > 0) {
        const resultLine = matches[0].line;
        const lineElement = document.querySelector(`.lineNumber[data-line="${resultLine}"]`);
        lineElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const navigateSearchResults = (direction) => {
    if (searchResults.length === 0) return;

    const newIndex = direction === 'next' 
      ? (currentSearchIndex + 1) % searchResults.length
      : (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    
    setCurrentSearchIndex(newIndex);
    
    const resultLine = searchResults[newIndex].line;
    const lineElement = document.querySelector(`.lineNumber[data-line="${resultLine}"]`);
    lineElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    performSearch();
  };

  const handleTestCode = () => {
    try {
      const result = eval(currentCode);
      setTerminalOutput([
        ...terminalOutput, 
        { type: 'output', message: JSON.stringify(result) }
      ]);
    } catch (error) {
      setTerminalOutput([
        ...terminalOutput, 
        { type: 'error', message: error.toString() }
      ]);
    }
  };


  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragStart = (file) => {
    console.log('Dragging file:', file); // Debug log
    setDraggedFile(file);
  };
  
  
  
  const handleDrop = (e) => {
    e.preventDefault();
    console.log('Dropped file:', draggedFile); // Debug log
    if (draggedFile && draggedFile.content) {
      setCurrentCode(draggedFile.content);
      const lines = draggedFile.content.split('\n');
      setLineNumbers(lines.map((_, index) => index + 1));
  
      // Remove the ".csv" extension from the dragged file's name before setting it
      const fileNameWithoutExtension = draggedFile.name.replace('.csv', '');
      setFileName(fileNameWithoutExtension);  // Set the file name without ".csv"
    } else {
      console.error('Dragged file does not have content:', draggedFile); // Debug log for missing content
      alert('The file appears to have no content. Please try again.');
    }
  };
  
  
  
  
  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
  
    if (!file || file.type !== 'text/csv') {
      alert('Please upload a valid CSV file.');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch('http://localhost:3002/upload-code', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        const newFile = {
          id: csvFiles.length + 1,
          name: file.name,
          size: `${Math.round(file.size / 1024)} KB`,
          code: '', // Initially empty, loaded later
        };
        setCsvFiles([...csvFiles, newFile]);
      } else {
        const error = await response.text();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`An error occurred: ${error.message}`);
    }
  };
  
  
  
  

  

  useEffect(() => {
    // Fetch files every second
    const intervalId = setInterval(fetchCsvFiles, 1000);
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);


  const handleCreateNewFile = async () => {
    const newFileName = `new_file_${csvFiles.length + 1}`;
    
    try {
      const response = await fetch('http://localhost:3002/create-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: newFileName }),
      });
  
      if (response.ok) {
        // Add the new file to the list of files
        const newFile = {
          id: csvFiles.length + 1,
          name: `${newFileName}.csv`,
          size: '0 KB',
          content: '', // Empty file content
        };
        setCsvFiles([...csvFiles, newFile]);
        setCurrentCode(''); // Clear the code editor
        setFileName(newFileName); // Set the file name
      } else {
        const error = await response.text();
        alert(`Failed to create file: ${error}`);
      }
    } catch (error) {
      console.error('Error creating new file:', error);
      alert(`An error occurred: ${error.message}`);
    }
  };
  


  useEffect(() => {
    if (textareaRef.current && codeHighlightRef.current && lineNumberContainerRef.current) {
      const textarea = textareaRef.current;
      const codeHighlight = codeHighlightRef.current;
      const lineNumberContainer = lineNumberContainerRef.current;

      const syncScroll = () => {
        lineNumberContainer.scrollTop = textarea.scrollTop;
        codeHighlight.scrollTop = textarea.scrollTop;
      };

      textarea.addEventListener('scroll', syncScroll);
      return () => {
        textarea.removeEventListener('scroll', syncScroll);
      };
    }
  }, []);

  return (
    <div className="o-container">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-darker)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          },
        }}
      />
      <div className="botCont">
      <div className="terminalContainer">
          <div className="fileName-container">
            <input
              id="fileName"
              type="text"
              placeholder="Enter file name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="fileNameInput"
            />
          </div>
          <div className="terminalLeft">
            <div className="editorToolbar">
              <div className="editorActions">
                {isSearchActive && (
                  <div className="searchContainer">
                    <IconSearch size={14} className="search-icon" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="searchInput"
                      placeholder="Meklēt failā"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    {searchResults.length > 0 && (
                      <div className="search-nav">
                        <span>{currentSearchIndex + 1} no {searchResults.length}</span>
                        <button onClick={() => navigateSearchResults('prev')}>▲</button>
                        <button onClick={() => navigateSearchResults('next')}>▼</button>
                      </div>
                    )}
                  </div>
                )}
                <button className="editorButton" onClick={handleCopyCode}>
                  <IconClipboard size={16} />
                </button>
                <button className="editorButton" onClick={handleSearchToggle}>
                  <IconSearch size={16} />
                </button>
              </div>
            </div>
            <div 
              className="terminalBox" 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div 
                ref={lineNumberContainerRef} 
                className="lineNumberContainer"
              >
                {lineNumbers.map((number) => (
                  <div 
                    key={number} 
                    className="lineNumber" 
                    data-line={number}
                  >
                    {number}
                  </div>
                ))}
              </div>
              <div className="code-wrapper">
                <textarea
                  ref={textareaRef}
                  className="tInput"
                  value={currentCode}
                  onChange={handleCodeChange}
                  spellCheck="false"
                  placeholder="Sāciet rakstīt savu kodu..."
                />
                <pre 
                  ref={codeHighlightRef}
                  className="code-highlight" 
                  dangerouslySetInnerHTML={{ 
                    __html: highlightCode(currentCode) 
                  }}
                />
              </div>
            </div>
            <div className="buttonCont">
              <button 
                className="testBtn"
                onClick={handleTestCode}
              >
                <IconCode size={16} style={{ marginRight: '8px' }} />
                Testēt
              </button>
              <button className="saveBtn" onClick={handleSaveCode}>
                <IconDownload size={16} style={{ marginRight: '8px' }} />
                Saglabāt
              </button>
            </div>
            <div className="terminalOutputContainer">
              {terminalOutput.map((output, index) => (
                <div 
                  key={index} 
                  className={`terminal-line ${output.type}`}
                >
                  {output.message}
                </div>
              ))}
            </div>
          </div>
          <div className="terminalRight">
        <div className="csvListContainer">
          {csvFiles.map((file) => (
            <div
              key={file.id}
              className="csv-file"
              draggable
              onDragStart={() => handleDragStart(file)}
              onClick={() => handleFileClick(file)}
            >
              <IconFile className="file-icon" size={20} />
              <span className="file-name">{file.name}</span>
              <button 
                className="delete-file-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFile(file);
                }}
              >
                <IconTrash size={16} />
              </button>
            </div>
          ))}

            </div>
            <div className="fileActionButtons">
              <button 
                className="csvCreateBtn"
                onClick={handleCreateNewFile}
              >
                <IconPlus size={16} style={{ marginRight: '8px' }} />
                Izveidot Jaunu
              </button>
              <label className="csvUploadBtn">
                <input 
                  type="file" 
                  accept=".csv" 
                  style={{ display: 'none' }} 
                  onChange={handleUploadFile}
                />
                <IconUpload size={16} style={{ marginRight: '8px' }} />
                Augšupielādēt
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
