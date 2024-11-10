import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IconPencilPlus, IconGraph, IconList,IconSearch, IconExternalLink, IconTrashXFilled, IconLanguage, IconSun, IconMoon, IconUpload, IconPhoto, IconX, IconHelp } from '@tabler/icons-react';
import "../styles/AllProfiles.css";
import { Tabs, AppShell, Pagination, Flex, Select, Group, ActionIcon, useMantineColorScheme, useComputedColorScheme, Text, Input, Button, rem, Modal, useMantineTheme} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { showNotification } from '@mantine/notifications';
import { useElementSize } from '@mantine/hooks';
import translations from '../locales/translations';
import dropdown from "../styles/Dropdown.module.css";
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';

const RESULTS_PER_PAGE = 5;

const AllProfiles = () => {
  const iconStyle = { width: rem(12), height: rem(12) };
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [projects, setProjects] = useState([]);
  const theme = useMantineTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const { ref, width, height } = useElementSize();
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'Latviešu');
  const t = translations[language] || translations['Latviešu'];

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/csvFiles');
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

  useEffect(() => {
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
      showNotification({
        title: t.warning,
        message: t.pleaseEnterProjectName,
        color: 'orange',
      });
      
      return;
    }
    
    setIsLoading(true);
    try {
      const csvData = createCsvData();
      const response = await fetch('http://localhost:5001/save-csv', {
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
      
      showNotification({
        title: t.success,
        message: t.projectCreated,
        color: 'green',
      });
  
      setProjectName('');
      fetchProjects();
    } catch (error) {
      console.error('Error saving the project:', error);
      showNotification({
        title: t.error,
        message: t.errorSavingProject,
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:5001/upload-csv', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      const data = await response.json();
      
      showNotification({
        title: t.success,
        message: t.csvUploaded,
        color: 'green',
      });
  
      setCsvFile(null);
      fetchProjects();
    } catch (error) {
      console.error('Error uploading file:', error);
      showNotification({
        title: t.error,
        message: t.errorUploadingFile,
        color: 'red',
      });
    }
  };

  const deleteProject = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:5001/delete-project/${projectId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
  
      showNotification({
        title: t.success,
        message: t.projectDeleted,
        color: 'green',
      });
  
      setProjects((prevProjects) => prevProjects.filter(project => project.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      showNotification({
        title: t.error,
        message: t.errorDeletingProject,
        color: 'red',
      });
    }
  };

  const handleLanguageChange = (value) => {
    setLanguage(value);
    localStorage.setItem('lang', value);
  };

  const [tutorialOpen, setTutorialOpen] = useState(false);

  const tutorialContent = (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: theme.colors.gray[0], fontSize: '24px' }}>{t.tutorialTitle}</h2>
      
      <Text style={{ color: theme.colors.gray[7], fontSize: '18px' }}>
        {t.tutorialDescription}
      </Text>
      <Text style={{ color: theme.colors.gray[0], fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>
        1. {t.tutorialStep1}
      </Text>
      <Text style={{ color: theme.colors.blue[7], fontSize: '16px' }}>
        {t.tutorialStep1Description}
      </Text>

      <Text style={{ color: theme.colors.gray[0], fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>
        2. {t.tutorialStep2}
      </Text>
      <Text style={{ color: theme.colors.blue[7], fontSize: '16px' }}>
        {t.tutorialStep2Description}
      </Text>

      <Text style={{ color: theme.colors.gray[0], fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>
        3. {t.tutorialStep3}
      </Text>
      <Text style={{ color: theme.colors.blue[7], fontSize: '16px' }}>
        {t.tutorialStep3Description}
      </Text>
    </div>
  );
  return (
    <AppShell withBorder={false} header={{ height: 60 }}>
      <AppShell.Header p={12}>
        <Flex align="center" justify="flex-end" w="100%">
          <Group>
            <ActionIcon
              onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
              variant="default"
              size="xl"
              aria-label="Toggle color scheme"
            >
              {computedColorScheme === 'light' ? (
                <IconMoon stroke={1.5} />
              ) : (
                <IconSun stroke={1.5} />
              )}
            </ActionIcon>
            <ActionIcon
              onClick={() => setTutorialOpen(true)}
              variant="default"
              size="xl"
              aria-label="Show Tutorial"
            >
              <IconHelp stroke={1.5} />
            </ActionIcon>
            <Select
              leftSection={<IconLanguage size={26} />}
              variant='unstyled'
              allowDeselect={false}
              value={language}
              onChange={handleLanguageChange}
              data={['Latviešu', 'English']}
              classNames={dropdown}
              comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 }, position: 'bottom', middlewares: { flip: false, shift: false }, offset: 0 }}
            />
          </Group>
        </Flex>
      </AppShell.Header>
      <AppShell.Main ref={ref}>
        <Flex w={width} h={height} gap="md" align="center" direction="column">
          <section className="section">
            <h1 className="section-title">
              <Text fz={24} fw={600}>{t.createNewProject}</Text>
            </h1>
            <div className="create-form">
              <Input.Wrapper>
                <Input
                  variant='filled'
                  placeholder={t.projectName}
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  disabled={isLoading}
                  size='xl'
                  mb={20}
                />
              </Input.Wrapper>
              <Button
               size='xl'
               onClick={saveCsvFile}
               disabled={isLoading}
              >
                {isLoading ? t.loading : t.create}
              </Button>
            </div>

            <Dropzone
              onDrop={(files) => {
                setCsvFile(files[0]);
                handleFileUpload(files[0]);
              }}
              onReject={(files) => console.log('rejected files', files)}
              maxSize={5 * 1024 ** 2}
              accept={['text/csv']}
            >
              <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                <Dropzone.Accept>
                  <IconUpload style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }} stroke={1.5} />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <IconX style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }} stroke={1.5} />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <IconPhoto style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }} stroke={1.5} />
                </Dropzone.Idle>
                <div>
                  <Text size="xl" inline>
                    {t.attachCsvNote}
                  </Text>
                  <Text size="sm" color="dimmed" inline mt={7}>
                    {t.attachCsvNote}
                  </Text>
                </div>
              </Group>
            </Dropzone>
          </section>

          <section className="section">
            <h1 className="section-title">
              <Text fz={24} fw={600}>{t.searchProject} </Text>
            </h1>
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
                      <Link to={`/singleProfile`}>
                        <Text color='black'>{project.name}</Text>
                      </Link>
                      <Group>
                        <Link to="/singleProfile">
                        <ActionIcon h={40} w={40} p={2} variant='transparent' color='black'>
                          <IconExternalLink />
                        </ActionIcon>
                        </Link>
                        <ActionIcon h={40} w={40} p={2} color="red" onClick={() => deleteProject(project.id)}>
                          <IconTrashXFilled />
                        </ActionIcon>
                      </Group>
                    </div>
                  ))
                ) : (
                  <Text size="md" color="dimmed">
                    {t.noProjects}
                  </Text>
                )}
              </div>
              <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} />
            </div>
          </section>
        </Flex>
      </AppShell.Main>
      <Modal
        opened={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        title={t.tutorialTitle}
        centered
        size="lg"
      >
        <Tabs variant="outline" defaultValue="gallery">
      <Tabs.List>
        <Tabs.Tab value="gallery" leftSection={<IconPencilPlus style={iconStyle} />}>
          Projekta izveide
        </Tabs.Tab>
        <Tabs.Tab value="messages" leftSection={<IconList style={iconStyle} />}>
          Soļu izveide
        </Tabs.Tab>
        <Tabs.Tab value="settings" leftSection={<IconGraph style={iconStyle} />}>
          Pārksats
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="gallery">
        {tutorialContent}
      </Tabs.Panel>

      <Tabs.Panel value="messages">
      {tutorialContent}
      </Tabs.Panel>

      <Tabs.Panel value="settings">
      {tutorialContent}
      </Tabs.Panel>
    </Tabs>
      </Modal>
    </AppShell>
  );
};

export default AllProfiles;
