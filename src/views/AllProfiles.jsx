import React, { useState, useEffect } from 'react';
import { Pagination } from "@mantine/core";
import { IconSearch, IconExternalLink, IconTrashXFilled } from "@tabler/icons-react";
import { Link } from 'react-router-dom';
import "../styles/AllProfiles.css";

const RESULTS_PER_PAGE = 6;

const AllProfiles = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [csvFile, setCsvFile] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/csvFiles');
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const data = await response.json();
        setProjects(data);
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
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      alert('Project successfully created!');
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

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <section className="section">
          <h1 className="section-title">Create a New Project</h1>
          <div className="create-form">
            <input 
              className="input-field"
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={isLoading}
            />
            <button 
              className="create-button" 
              onClick={saveCsvFile}
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : 'Create'}
            </button>
          </div>
          <div 
            className="drag-and-drop-box"
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {csvFile ? (
              <div className="file-info">
                <p>File: {csvFile.name}</p>
                <button onClick={handleFileUpload}>Upload CSV</button>
              </div>
            ) : (
              <p>Drag and drop a CSV file here</p>
            )}
          </div>
        </section>

        <section className="section">
          <h1 className="section-title">Search for Projects</h1>
          <div className="search-container">
            <div className="search-wrapper">
              <input 
                className="search-input"
                placeholder="Project Name"
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
                displayItems.map((project, index) => (
                  <div key={index} className="result-item">
                    <span className="result-text">{project.name}</span>
                    <div className="result-actions">
                      <Link to="/SingleProfile">
                        <IconExternalLink className="edit-icon" size={30} />
                      </Link>
                      <IconTrashXFilled className="delete-icon" size={30} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-results">No results found</p>
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
      </div>
    </div>
  );
};

export default AllProfiles;
