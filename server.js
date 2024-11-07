const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;
const PROJECTS_DIR = 'projects'; // Directory to store the CSV files

app.use(cors());
app.use(bodyParser.json());

// Endpoint to fetch all projects
app.get('/projects', (req, res) => {
  const projectFiles = fs.readdirSync(path.join(__dirname, PROJECTS_DIR));
  const projects = projectFiles.map(file => {
    const [name, date] = file.split('-');
    return { name, date: date.split('.')[0] };
  });
  res.json(projects);
});

// Endpoint to save CSV file
app.post('/save-csv', (req, res) => {
  const { fileName, csvData } = req.body;

  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  // Construct the file path with the project name and today's date
  const filePath = path.join(__dirname, PROJECTS_DIR, `${fileName}-${formattedDate}.csv`);

  // Write the CSV data to the file
  fs.writeFile(filePath, csvData, 'utf8', (err) => {
    if (err) {
      console.error('Error saving the file:', err);
      return res.status(500).json({ message: 'Error saving the CSV file' });
    }
    res.json({ message: 'CSV file saved successfully', filePath });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});