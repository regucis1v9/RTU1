const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 5000;

const PROJECTS_DIR = path.resolve(__dirname, 'csvFiles');
if (!fs.existsSync(PROJECTS_DIR)) {
  console.error(`Directory ${PROJECTS_DIR} does not exist!`);
  process.exit(1);
}

app.use(cors());
app.use(bodyParser.json());

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PROJECTS_DIR);
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  }
});
const upload = multer({ storage });

// Endpoint to fetch all projects
app.get('/csvFiles', (req, res) => {
  try {
    const projectFiles = fs.readdirSync(PROJECTS_DIR);
    if (projectFiles.length === 0) {
      return res.status(404).json({ message: 'No projects found in the directory.' });
    }
    const projects = projectFiles.map(file => {
      const [name, date] = file.split('-');
      return { name, date: date.split('.')[0] };
    });
    res.json(projects);
  } catch (error) {
    console.error('Error reading project directory:', error);
    res.status(500).json({ message: 'Error fetching projects. Directory might not exist.' });
  }
});

// Endpoint to save CSV file from form input
app.post('/save-csv', (req, res) => {
  const { fileName, csvData } = req.body;
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  const filePath = path.join(PROJECTS_DIR, `${fileName}-${formattedDate}.csv`);
  fs.writeFile(filePath, csvData, 'utf8', (err) => {
    if (err) {
      console.error('Error saving the file:', err);
      return res.status(500).json({ message: 'Error saving the CSV file' });
    }
    res.json({ message: 'CSV file saved successfully', filePath });
  });
});

// New endpoint for drag-and-drop CSV file upload
app.post('/upload-csv', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ message: 'File uploaded successfully', filePath: req.file.path });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
