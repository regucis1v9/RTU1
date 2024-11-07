import React, { useState } from 'react';
import { IconSearch, IconExternalLink, IconTrashXFilled, IconLanguage } from '@tabler/icons-react';
import "../styles/AllProfiles.css";
import { AppShell, Pagination, Flex, Select } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import translations from '../locales/translations';
import dropdown from "../styles/Dropdown.module.css";

const PROJECTS_DATA = [
  { id: 1, name: "SU 72h" },
  { id: 2, name: "AU 72h" },
  { id: 3, name: "BU 72h" },
  { id: 4, name: "DU 72h" },
  { id: 5, name: "HU 72h" },
  { id: 6, name: "NU 72h" },
  { id: 7, name: "RU 72h" },
  { id: 8, name: "PU 72h" },
];

const RESULTS_PER_PAGE = 5;

const AllProfiles = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { ref, width, height } = useElementSize();
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'Latviešu');
  const t = translations[language] || translations['Latviešu']; 

  const filteredProjects = PROJECTS_DATA.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProjects.length / RESULTS_PER_PAGE);

  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
  const endIndex = startIndex + RESULTS_PER_PAGE;
  const displayItems = filteredProjects.slice(startIndex, endIndex);

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
            comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 }, position: 'bottom', middlewares: { flip: false, shift: false }, offset: 0 } }
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
              />
              <button className="create-button">
                {t.create}
              </button>
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
                    <div key={project.id} className="result-item">
                      <span className="result-text">{project.name}</span>
                      <div className="result-actions">
                        <IconExternalLink className="edit-icon" size={30} />
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
