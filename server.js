const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 5001;

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
    const { name, ext } = path.parse(file.originalname); // original name and extension
    const today = new Date().toISOString().split('T')[0];
    let finalName = `${name}-${today}${ext}`;
    let counter = 1;

    while (fs.existsSync(path.join(PROJECTS_DIR, finalName))) {
      finalName = `${name} (${counter})-${today}${ext}`; // Bracket format for duplicates
      counter++;
    }
    cb(null, finalName);
  }
});

// Endpoint to fetch all projects
app.get('/csvFiles', (req, res) => {
  try {
    const projectFiles = fs.readdirSync(PROJECTS_DIR);
    if (projectFiles.length === 0) {
      return res.status(404).json({ message: 'No projects found in the directory.' });
    }
    const projects = projectFiles.map(file => {
      const filePath = path.join(PROJECTS_DIR, file);
      const fileStat = fs.statSync(filePath);
      const fileDate = fileStat.mtime.toISOString().split('T')[0];
      const fileTime = fileStat.mtime.toISOString().split('T')[1].slice(0, 5); // "HH:MM" format
      return { name: file, date: fileDate, time: fileTime };
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
  const today = new Date().toISOString().split('T')[0];
  const filePath = path.join(PROJECTS_DIR, `${fileName}-${today}.csv`);
  let finalFilePath = filePath;
  let counter = 1;

  while (fs.existsSync(finalFilePath)) {
    finalFilePath = path.join(PROJECTS_DIR, `${fileName} (${counter})-${today}.csv`);
    counter++;
  }

  fs.writeFile(finalFilePath, csvData, 'utf8', (err) => {
    if (err) {
      console.error('Error saving the CSV file:', err);
      return res.status(500).json({ message: 'Error saving the CSV file' });
    }
    res.json({ message: 'CSV file saved successfully', filePath: finalFilePath });
  });
});

// Configure multer upload
const upload = multer({ storage: storage });
// New endpoint for drag-and-drop CSV file upload
app.post('/upload-csv', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ message: 'File uploaded successfully', filePath: req.file.path });
});

// New endpoint to fetch CSV content by filename
app.get('/get-csv/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(PROJECTS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  // Read the CSV file and send its content
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Error reading the file' });
    }

    // Assuming you want to parse the CSV into JSON:
    const rows = parseCSVToJson(data); // Replace with actual CSV parsing logic
    res.json({ rows }); // Send the parsed CSV data
  });
});

// A simple CSV parsing function (you can replace this with a more sophisticated one)
const parseCSVToJson = (csv) => {
  const lines = csv.split('\n');
  const headers = lines[0].split(',');
  const rows = lines.slice(1).map((line) => {
    const values = line.split(',');
    let rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header.trim()] = values[index]?.trim();
    });
    return rowObj;
  });
  return rows;
};

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});