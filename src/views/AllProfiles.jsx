import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { IconSearch, IconExternalLink, IconTrashXFilled, IconLanguage } from '@tabler/icons-react';
import "../styles/AllProfiles.css";
import { AppShell, Pagination, Flex, Select } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import translations from '../locales/translations';
import dropdown from "../styles/Dropdown.module.css";

const RESULTS_PER_PAGE = 5;

const AllProfiles = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const { ref, width, height } = useElementSize();
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'Latviešu');
  const t = translations[language] || translations['Latviešu']; 
  const fileInputRef = useRef(null);

  
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/csvFiles');
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        
        // Process files to create fullName and other properties
        const processedData = data.map(file => {
          return { 
            fullName: file.name.replace('.csv', ''), 
            name: file.name.split('-')[0].trim(), 
            date: file.date,  // Ensure `date` is mapped
            time: file.time   // Ensure `time` is mapped
          };
        });
  
        setProjects(processedData);
      } catch (error) {
        console.error('Error fetching projects:', error);
        alert('Error fetching projects. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project =>
    project.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProjects.length / RESULTS_PER_PAGE);
  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
  const endIndex = startIndex + RESULTS_PER_PAGE;
  const displayItems = filteredProjects.slice(startIndex, endIndex);

  const createCsvData = () => {
    const headers = ['Project Name', 'Creation Date'];
    const today = new Date().toISOString().split('T')[0];
    const dataRow = [projectName, today];
    return [headers.join(','), dataRow.join(',')].join('\n');
  };

  const saveCsvFile = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name.');
      return;
    }
    setIsLoading(true);
    try {
      const csvData = createCsvData();
      const response = await fetch('http://localhost:5000/save-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: projectName,
          csvData: csvData,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      alert('Projekts veiksmīgi izveidots!');
      setProjectName('');
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving the project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      alert('Please upload a CSV file.');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      alert('Please upload a CSV file.');
    }
  };

  const handleFileUpload = async () => {
    if (!csvFile) return;
    const formData = new FormData();
    formData.append('file', csvFile);
    try {
      const response = await fetch('http://localhost:5000/upload-csv', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      const data = await response.json();
      alert('CSV file uploaded successfully');
      setCsvFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  const handleLanguageChange = (value) => {
    setLanguage(value);
    localStorage.setItem('lang', value);
  };
  
  return (
    <AppShell withBorder={false} header={{ height: 60 }}>
      <AppShell.Header p={12}>
        <Flex align="center" justify="flex-end" w="100%">
          <Select
            leftSection={<IconLanguage size={26} />}
            variant='unstyled'
            allowDeselect={false}
            value={language}
            onChange={handleLanguageChange}
            data={['Latviešu', 'English']}
            classNames={dropdown}
            comboboxProps={{
              transitionProps: { transition: 'pop', duration: 200 },
              position: 'bottom',
              middlewares: { flip: false, shift: false },
              offset: 0 
            }}
          />
        </Flex>
      </AppShell.Header>
      <AppShell.Main ref={ref}>
        <Flex w={width} h={height} gap="md" align="center" direction="column">
          <section className="section">
            <h1 className="section-title">{t.createNewProject}</h1>
            <div className="create-form">
              <input 
                className="input-field"
                placeholder={t.projectName}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={isLoading}
              />
              <button 
                className="create-button" 
                onClick={saveCsvFile}
                disabled={isLoading}
              >
                {isLoading ? t.loading : t.create}
              </button>
            </div>
            <div 
              className="drag-and-drop-box"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileSelect} 
                accept=".csv"
              />
              {csvFile ? (
                <div className="file-info">
                  <p>File: {csvFile.name}</p>
                  <button onClick={handleFileUpload}>Upload CSV</button>
                </div>
              ) : (
                <p>{t.dragAndDropFile || "Drag and drop a CSV file here or click to upload"}</p>
              )}
            </div>
          </section>

          <section className="section">
            <h1 className="section-title">{t.searchProject}</h1>
            <div className="search-container">
              <div className="search-wrapper">
                <input 
                  className="search-input"
                  placeholder={t.projectName}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <IconSearch className="search-icon" size={20} />
              </div>
              <div className="results-container">
                {displayItems.length > 0 ? (
                  displayItems.map((project) => (
                    <div key={project.fullName} className="result-item">
                      <span className="result-text">
                        {`${project.fullName}`}
                      </span>
                      <div className="result-actions">
                        <Link to="/SingleProfile">
                          <IconExternalLink className="edit-icon" size={30} />
                        </Link>
                        <IconTrashXFilled className="delete-icon" size={30} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-results">{t.noResults}</p>
                )}
              </div>
              <div className="pagination-wrapper">
                <Pagination 
                  total={totalPages}
                  color="blue"
                  radius="md"
                  value={currentPage}
                  onChange={setCurrentPage}
                  siblings={2}
                />
              </div>
            </div>
          </section>
        </Flex>
      </AppShell.Main>
    </AppShell>
    );
};

export default AllProfiles;
