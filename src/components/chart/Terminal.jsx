import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Play, Terminal as TerminalIcon, ChevronDown } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faWindowRestore, faCompressAlt } from '@fortawesome/free-solid-svg-icons';
import Draggable from 'react-draggable';
import styles from '../../styles/terminalStyles.module.css';

const DirectoryCommands = {
  '/': [
    { command: 'help', description: 'Show general help' },
    { command: 'about', description: 'Display system information' },
    { command: 'ls', description: 'List available commands in the current directory' },
    { command: 'pwd', description: 'Print the current directory' },
    { command: 'date', description: 'Show the current date and time' },
    { command: 'echo', description: 'Print the provided text to the terminal' },
    { command: 'calc', description: 'Perform a simple calculation' }
  ],
  '/root': [
    { command: 'user-list', description: 'List system users' },
    { command: 'permissions', description: 'View access permissions' }
  ],
  '/graph': [
    { command: 'show-nodes', description: 'Display graph nodes' },
    { command: 'analyze', description: 'Perform graph analysis' }
  ],
  '/system': [
    { command: 'status', description: 'Check system status' },
    { command: 'resource-usage', description: 'View system resources' }
  ]
};

const ManualPanel = ({ isOpen, isFloating, toggleManual, toggleManualFloating }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDirectory, setSelectedDirectory] = useState('/');
  const [sortOrder, setSortOrder] = useState('asc');
  const manualRef = useRef(null);

  const filteredCommands = DirectoryCommands[selectedDirectory]
    .filter(cmd =>
      cmd.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === 'asc'
        ? a.command.localeCompare(b.command)
        : b.command.localeCompare(a.command)
    );

  return isFloating ? (
    <Draggable
      handle=".manual-header"
      defaultPosition={{ x: 0, y: 0 }} // Start at top-left
    >
      <div
        ref={manualRef}
        className={`${styles['manual-panel']} ${styles['floating']} ${isOpen ? styles['open'] : ''}`}
      >
        <div className={styles['manual-header']}>
          <h3>Command Reference</h3>
          <div className={styles['manual-controls']}>
            <FontAwesomeIcon
              icon={faCompressAlt}
              onClick={toggleManualFloating}
              className={styles['pop-in-icon']}
            />
            <X
              size={16}
              onClick={toggleManual}
              className={styles['close-manual-icon']}
            />
          </div>
        </div>
        <div className={styles['manual-content']}>
          <div className={styles['manual-controls-bar']}>
            <div className={styles['directory-selector']}>
              <select
                value={selectedDirectory}
                onChange={(e) => setSelectedDirectory(e.target.value)}
                className={styles['directory-dropdown']}
              >
                {Object.keys(DirectoryCommands).map(dir => (
                  <option key={dir} value={dir}>{dir}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles['commands-list']}>
            {filteredCommands.map((cmd, index) => (
              <div key={index} className={styles['command-item']}>
                <span className={styles['command-name']}>{cmd.command}</span>
                <span className={styles['command-description']}>{cmd.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Draggable>
  ) : (
    <div
      ref={manualRef}
      className={`${styles['manual-panel']} ${isOpen ? styles['open'] : ''}`}
    >
      <div className={styles['manual-header']}>
        <h3>Command Reference</h3>
        <div className={styles['manual-controls']}>
          <FontAwesomeIcon
            icon={faWindowRestore}
            onClick={toggleManualFloating}
            className={styles['pop-out-icon']}
          />
          <X
            size={16}
            onClick={toggleManual}
            className={styles['close-manual-icon']}
          />
        </div>
      </div>
      <div className={styles['manual-content']}>
        <div className={styles['manual-controls-bar']}>
          <div className={styles['directory-selector']}>
            <select
              value={selectedDirectory}
              onChange={(e) => setSelectedDirectory(e.target.value)}
              className={styles['directory-dropdown']}
            >
              {Object.keys(DirectoryCommands).map(dir => (
                <option key={dir} value={dir}>{dir}</option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles['commands-list']}>
          {filteredCommands.map((cmd, index) => (
            <div key={index} className={styles['command-item']}>
              <span className={styles['command-name']}>{cmd.command}</span>
              <span className={styles['command-description']}>{cmd.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const TerminalWindow = ({ onClose, isActive, initialOutput = [] }) => {
  const [command, setCommand] = useState('');
  const [outputs, setOutputs] = useState(initialOutput);
  const [currentPath, setCurrentPath] = useState('/');
  const [availablePaths] = useState(['/', '/root', '/graph', '/system']);
  const [isPathDropdownOpen, setIsPathDropdownOpen] = useState(false);
  const outputRef = useRef(null);
  const inputRef = useRef(null);
  const pathSelectorRef = useRef(null);

  const handleCommandSubmit = () => {
    if (command.trim()) {
      const trimmedCommand = command.trim().toLowerCase();
      const args = trimmedCommand.split(' ');
      const mainCommand = args[0];
      const param = args.slice(1).join(' ');

      let outputText = '';
      let status = 'success';

      if (mainCommand.startsWith('.')) {
        const targetDirectory = mainCommand.substring(1);
        if (targetDirectory === 'home') {
          setCurrentPath('/');
          outputText = 'Returned to home directory';
        } else if (DirectoryCommands[`/${targetDirectory}`]) {
          setCurrentPath(`/${targetDirectory}`);
          outputText = `Switched to /${targetDirectory} directory`;
        } else {
          outputText = `Directory "/${targetDirectory}" not found.`;
          status = 'error';
        }
      } else {
        switch (mainCommand) {
          case 'ls':
            outputText = DirectoryCommands[currentPath]
              .map(cmd => `${cmd.command} - ${cmd.description}`)
              .join('\n');
            break;
          case 'pwd':
            outputText = currentPath;
            break;
          case 'clear':
            setOutputs([]);
            return;
          case 'date':
            outputText = new Date().toLocaleString();
            break;
          case 'echo':
            outputText = param;
            break;
          case 'calc':
            try {
              outputText = eval(param);
            } catch {
              outputText = 'Invalid expression';
              status = 'error';
            }
            break;
          case 'help':
            outputText = param
              ? DirectoryCommands[currentPath].find(cmd => cmd.command === param)?.description || 'No help available for this command.'
              : Object.keys(DirectoryCommands)
                  .map(path =>
                    `${path}:\n${DirectoryCommands[path]
                      .map(cmd => `  ${cmd.command} - ${cmd.description}`)
                      .join('\n')}`
                  )
                  .join('\n\n');
            break;
          default:
            outputText = `Unknown command: ${mainCommand}`;
            status = 'error';
        }
      }

      setOutputs(prev => [
        ...prev,
        { type: 'command', text: `${currentPath}> ${trimmedCommand}` },
        { type: 'output', text: outputText, status }
      ]);

      setCommand('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommandSubmit();
    }
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }

    const handleClickOutside = (event) => {
      if (
        pathSelectorRef.current &&
        !pathSelectorRef.current.contains(event.target)
      ) {
        setIsPathDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [outputs]);

  return (
    <div className={`${styles['terminal-window']} ${isActive ? styles['active'] : ''}`}>
      <div className={styles['terminal-input-container']}>
        <div ref={pathSelectorRef} className={styles['path-selector-container']}>
          <span
            className={styles['prompt-symbol']}
            onClick={() => setIsPathDropdownOpen(!isPathDropdownOpen)}
          >
            {currentPath}&gt; <ChevronDown size={14} />
          </span>
          {isPathDropdownOpen && (
            <div className={styles['path-dropdown']}>
              {availablePaths.map((path) => (
                <div
                  key={path}
                  className={`${styles['path-dropdown-item']} ${currentPath === path ? styles['active'] : ''}`}
                  onClick={() => {
                    setCurrentPath(path);
                    setIsPathDropdownOpen(false);
                  }}
                >
                  {path}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles['current-input-line']}>
          <textarea
            ref={inputRef}
            className={styles['terminal-textarea-input']}
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your command here..."
            rows={1}
          />
          <button className={styles['execute-button']} onClick={handleCommandSubmit}>
            <Play size={15} />
          </button>
        </div>
      </div>
      <div ref={outputRef} className={styles['terminal-output-container']}>
        <div className={styles['terminal-output']}>
          {outputs.map((output, index) => (
            <div
              key={index}
              className={`
                ${styles['output-line']} 
                ${output.type === 'command' ? styles['command-line'] : 
                  output.status === 'error' ? styles['error-line'] : styles['success-line']}
              `}
            >
              {output.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Terminal = () => {
  const [terminals, setTerminals] = useState([{ id: 1 }]);
  const [activeTerminalId, setActiveTerminalId] = useState(1);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isManualFloating, setIsManualFloating] = useState(false);
  const tabBarRef = useRef(null);

  const addTerminal = () => {
    const newTerminalId = terminals.length ?
      Math.max(...terminals.map(t => t.id)) + 1 :
      1;
    setTerminals(prev => [
      ...prev,
      { id: newTerminalId }
    ]);
    setActiveTerminalId(newTerminalId);

    setTimeout(() => {
      if (tabBarRef.current) {
        tabBarRef.current.scrollLeft = tabBarRef.current.scrollWidth;
      }
    }, 0);
  };

  const removeTerminal = (idToRemove) => {
    const updatedTerminals = terminals.filter(terminal => terminal.id !== idToRemove);
    setTerminals(updatedTerminals);

    if (updatedTerminals.length > 0) {
      setActiveTerminalId(updatedTerminals[updatedTerminals.length - 1].id);
    }
  };

  const toggleManual = () => {
    setIsManualOpen(!isManualOpen);
    if (isManualFloating) {
      setIsManualFloating(false);
    }
  };

  const toggleManualFloating = () => {
    setIsManualOpen(true);
    setIsManualFloating(!isManualFloating);
  };

  return (
    <div className={styles['terminal-container']}>
      <div
        ref={tabBarRef}
        className={styles['terminal-tab-bar']}
      >
        {terminals.map((terminal) => (
          <div
            key={terminal.id}
            className={`${styles['terminal-tab']} ${activeTerminalId === terminal.id ? styles['active'] : ''}`}
            onClick={() => setActiveTerminalId(terminal.id)}
          >
            <TerminalIcon size={14} />
            Terminālis {terminal.id}
            <X
              size={12}
              className={styles['close-tab-icon']}
              onClick={(e) => {
                e.stopPropagation();
                removeTerminal(terminal.id);
              }}
            />
          </div>
        ))}
        <button
          className={styles['add-terminal-btn']}
          onClick={addTerminal}
          disabled={terminals.length >= 10}
        >
          <Plus size={14} />
        </button>
        <button 
          className={styles['manual-toggle-btn']}
          onClick={toggleManual}
        >
          <FontAwesomeIcon icon={faBook} />
        </button>
      </div>
      <div className={styles['terminals-wrapper']}>
        {terminals.map((terminal) => (
          <TerminalWindow
            key={terminal.id}
            isActive={activeTerminalId === terminal.id}
          />
        ))}
      </div>
      <ManualPanel
        isOpen={isManualOpen}
        isFloating={isManualFloating}
        toggleManual={toggleManual}
        toggleManualFloating={toggleManualFloating}
      />
    </div>
  );
};

export default Terminal;
