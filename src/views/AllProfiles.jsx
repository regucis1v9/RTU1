import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    IconPencilPlus,
    IconGraph,
    IconList,
    IconSearch,
    IconExternalLink,
    IconTrashXFilled,
    IconLanguage,
    IconSun,
    IconMoon,
    IconUpload,
    IconPhoto,
    IconX,
    IconHelp,
    IconArrowLeft, IconAlertOctagonFilled, IconHomeFilled, IconChartSankey
} from '@tabler/icons-react';
import "../styles/AllProfiles.css";
import {
    Tabs,
    AppShell,
    Pagination,
    Flex,
    Select,
    Group,
    ActionIcon,
    useMantineColorScheme,
    useComputedColorScheme,
    Text,
    Input,
    Button,
    rem,
    Modal,
    useMantineTheme,
    Burger, Box, Stack, Transition
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { showNotification } from '@mantine/notifications';
import {useDisclosure, useElementSize, useViewportSize} from '@mantine/hooks';
import translations from '../locales/translations';
import dropdown from "../styles/Dropdown.module.css";
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import {useLanguage} from "../context/LanguageContext";
import {usePressureUnit} from "../context/PressureUnitContext";
import {useTemperatureUnit} from "../context/TemperatureUnitContext";
const RESULTS_PER_PAGE = 5;
const AllProfiles = () => {
    const [opened, { toggle }] = useDisclosure();
    const navigate = useNavigate();
    const [tutorialOpen, setTutorialOpen] = useState(false);
    const iconStyle = { width: rem(12), height: rem(12) };
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    const buttonColor = computedColorScheme === 'dark' ? 'white' : 'black';
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [projects, setProjects] = useState([]);
    const theme = useMantineTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [csvFile, setCsvFile] = useState(null);
    const { ref, width, height } = useElementSize();
    const { language, changeLanguage } = useLanguage();
    const { pressureUnit, togglePressureUnit } = usePressureUnit();
    const { temperatureUnit, changeTemperatureUnit } = useTemperatureUnit();
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
        showNotification({
            title: t.error,
            message: t.noProjectFound,
            color: 'red',
        });
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
  
      // Navigate to /singleProfile/:filename without .csv
      navigate(`/singleProfile/${projectName.replace('.csv', '')}`);
  
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
  
      // Navigate to /singleProfile/:filename without .csv
      navigate(`/singleProfile/${data.fileName.replace('.csv', '')}`);
  
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
 
  const tutorialContent1 = (
    <div style={{ padding: 20 }}>
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
  
  const tutorialContent2 = (
    <div style={{ padding: 20 }}>
      <Text style={{ color: theme.colors.gray[7], fontSize: '18px' }}>
        {t.tutorialContent2.description}
      </Text>
  
      <Text style={{ color: theme.colors.gray[0], fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>
        1. {t.tutorialContent2.step1}
      </Text>
      <Text style={{ color: theme.colors.blue[7], fontSize: '16px', paddingLeft: "15px" }}>
        {t.tutorialContent2.step1Description}
      </Text>
  
      <Text style={{ color: theme.colors.gray[0], fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>
        2. {t.tutorialContent2.step2}
      </Text>
      <Text style={{ color: theme.colors.blue[7], fontSize: '16px', paddingLeft: "15px" }}>
        {t.tutorialContent2.step2Description}
      </Text>
  
      <Text style={{ color: theme.colors.blue[7], fontSize: '16px', paddingLeft: "15px" }}>
        {t.tutorialContent2.step2AdditionalInfo}
      </Text>
  
      <Text style={{ color: theme.colors.gray[0], fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>
        3. {t.tutorialContent2.step3}
      </Text>
      <Text style={{ color: theme.colors.blue[7], fontSize: '16px', paddingLeft: "15px" }}>
        {t.tutorialContent2.step3Description}
      </Text>
      <Text style={{ color: theme.colors.blue[7], fontSize: '16px', paddingLeft: "15px" }}>
        {t.tutorialContent2.step3AdditionalInfo}
      </Text>
    </div>
  );
  
  const tutorialContent3 = (
    <div style={{ padding: 20 }}>
      <Text style={{ color: theme.colors.gray[7], fontSize: '18px' }}>
        {t.tutorialContent3.description}
      </Text>
  
      <Text style={{ color: theme.colors.gray[0], fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>
        1. {t.tutorialContent3.step1}
      </Text>
      <Text style={{ color: theme.colors.blue[7], fontSize: '16px', paddingLeft: "15px" }}>
        {t.tutorialContent3.step1Description}
      </Text>
  
      <Text style={{ color: theme.colors.gray[0], fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>
        2. {t.tutorialContent3.step2}
      </Text>
      <Text style={{ color: theme.colors.blue[7], fontSize: '16px', paddingLeft: "15px" }}>
        {t.tutorialContent3.step2Description}
      </Text>
  
      <Text style={{ color: theme.colors.gray[0], fontSize: '20px', fontWeight: 'bold', marginTop: '20px' }}>
        3. {t.tutorialContent3.step3}
      </Text>
      <Text style={{ color: theme.colors.blue[7], fontSize: '16px', paddingLeft: "15px" }}>
        {t.tutorialContent3.step3Description}
      </Text>
    </div>
  );
  
  return (
    <AppShell withBorder={false} header={{ height: 60 }}>
        <Header
            language={language}
            changeLanguage={changeLanguage}
            pressureUnit={pressureUnit}
            togglePressureUnit={togglePressureUnit}
            temperatureUnit={temperatureUnit}
            changeTemperatureUnit={changeTemperatureUnit}
        />
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
              <Group justify="center" gap="xl" mih={125} style={{ pointerEvents: 'none' }}>
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
            <div className="search-container" >
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
                    <div key={project.id} className="result-item" >
                      <Link to={`/singleProfile/${project.name}`}>
                        <Text>{project.name}</Text>
                      </Link>
                      <Group>
                        <Link to={`/singleProfile/${project.name}`}>
                          <ActionIcon h={40} w={40} p={2} variant='transparent' className='redirect-button'>
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
        {tutorialContent1}
      </Tabs.Panel>

      <Tabs.Panel value="messages">
      {tutorialContent2}
      </Tabs.Panel>

      <Tabs.Panel value="settings">
      {tutorialContent3}
      </Tabs.Panel>
    </Tabs>
      </Modal>
    </AppShell>
  );
};

export default AllProfiles;
