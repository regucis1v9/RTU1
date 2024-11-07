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

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/projects');
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

  // Function to create CSV data from project
  const createCsvData = () => {
    // Create header row
    const headers = ['Project Name', 'Creation Date'];
    
    // Create data row
    const today = new Date().toISOString().split('T')[0];
    const dataRow = [projectName, today];
    
    // Combine and format as CSV
    const csvContent = [
      headers.join(','),
      dataRow.join(',')
    ].join('\n');
    
    return csvContent;
  };

  const saveCsvFile = async () => {
    if (!projectName.trim()) {
      alert('Lūdzu, ievadiet projekta nosaukumu.');
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
          fileName: projectName, // Ensure this matches the backend field
          csvData: csvData,      // Match the field name with backend code
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      alert('Projekts veiksmīgi izveidots!');
      setProjectName(''); // Clear input after successful save
      
    } catch (error) {
      console.error('Error:', error);
      alert('Kļūda saglabājot projektu. Lūdzu mēģiniet vēlreiz.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="app-container">
      <div className="content-wrapper">
        <section className="section">
          <h1 className="section-title">IZVEIDOT JAUNU PROJEKTU</h1>
          <div className="create-form">
            <input 
              className="input-field"
              placeholder="Projekta nosaukums"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={isLoading}
            />
            <button 
              className="create-button" 
              onClick={saveCsvFile}
              disabled={isLoading}
            >
              {isLoading ? 'GAIDA...' : 'IZVEIDOT'}
            </button>
          </div>
        </section>

        <section className="section">
          <h1 className="section-title">MEKLĒT PROJEKTU</h1>
          <div className="search-container">
            <div className="search-wrapper">
              <input 
                className="search-input"
                placeholder="Projekta nosaukums"
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
                  <div key={project.id} className="result-item">
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
                <p className="no-results">Nav rezultātu</p>
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