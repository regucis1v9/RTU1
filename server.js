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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PROJECTS_DIR);
  },
  filename: (req, file, cb) => {
    const { name, ext } = path.parse(file.originalname);
    const today = new Date().toISOString().split('T')[0];
    let finalName = `${name}-${today}${ext}`;
    let counter = 1;
    while (fs.existsSync(path.join(PROJECTS_DIR, finalName))) {
      finalName = `${name} (${counter})-${today}${ext}`;
      counter++;
    }
    cb(null, finalName);
  }
});

// Define the findCsvFile function
function findCsvFile(filename) {
  const filePath = path.join(PROJECTS_DIR, filename);

  if (fs.existsSync(filePath)) {
    // File exists, read it and return the content
    const data = fs.readFileSync(filePath, 'utf8');
    return { data };
  } else {
    // File does not exist
    return { error: 'File not found' };
  }
}

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
      const fileTime = fileStat.mtime.toISOString().split('T')[1].slice(0, 5);
      return { name: file, date: fileDate, time: fileTime };
    });
    res.json(projects);
  } catch (error) {
    console.error('Error reading project directory:', error);
    res.status(500).json({ message: 'Error fetching projects. Directory might not exist.' });
  }
});

app.post('/save-csv', (req, res) => {
  const { fileName, csvData } = req.body;

  // Define the default row and its values
  const defaultHeader = 'step,tMin,tMax,time,pressure,tMinUnit,tMaxUnit';
  const defaultRow = '1,0,0,3,1,C,C'; // Include 'pressure' in default row

  // Check if csvData exists and is not empty; otherwise, use default values
  let finalCsvData = defaultRow;

  // If there's no csvData or if it's empty, prepend the default header and row
  if (finalCsvData === defaultRow) {
    finalCsvData = defaultHeader + '\n' + defaultRow;
  } else {
    // Otherwise, just prepend the header if the data is valid
    if (!csvData.startsWith(defaultHeader)) {
      finalCsvData = defaultHeader + '\n' + csvData;
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const filePath = path.join(PROJECTS_DIR, `${fileName}-${today}.csv`);
  let finalFilePath = filePath;
  let counter = 1;

  // Ensure that the file does not already exist
  while (fs.existsSync(finalFilePath)) {
    finalFilePath = path.join(PROJECTS_DIR, `${fileName} (${counter})-${today}.csv`);
    counter++;
  }

  // Write the final CSV data to the file
  fs.writeFile(finalFilePath, finalCsvData, 'utf8', (err) => {
    if (err) {
      console.error('Error saving the CSV file:', err);
      return res.status(500).json({ message: 'Error saving the CSV file' });
    }
    res.json({ message: 'CSV file saved successfully', filePath: finalFilePath });
  });
});



const upload = multer({ storage: storage });

app.post('/upload-csv', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ message: 'File uploaded successfully', filePath: req.file.path });
});

app.get('/get-csv/:filename', (req, res) => {
  const { filename } = req.params;
  const result = findCsvFile(filename);

  if (result.error) {
    return res.status(404).json({ message: result.error });
  }

  res.header('Content-Type', 'text/csv');
  res.send(result.data);
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
app.post('/updateFile', (req, res) => {
  const { fileName, data } = req.body;

  // Step 1: Find the file path
  const filePath = path.join(PROJECTS_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  // Step 2: Read the existing CSV content
  const existingCsv = fs.readFileSync(filePath, 'utf8');

  // Step 3: Split the CSV into rows
  const rows = existingCsv.split('\n');

  // Step 4: Separate header from the data rows
  const header = rows[0]; // First row is the header
  const dataRows = rows.slice(1); // The rest are data rows

  // Step 5: Process the incoming data
  const newRows = data.map((newRow) => {
    const { step, tMin = 0, tMax = 0, time = 0, pressure = 0, tMinUnit = "C", tMaxUnit = "C" } = newRow;
    return `${step},${tMin},${tMax},${time},${pressure},${tMinUnit},${tMaxUnit}`;
  });

  // Step 6: Create a Set of steps from the new data for quick lookup
  const newSteps = new Set(data.map(row => row.step.toString()));

  // Step 7: Filter out rows that are not in the new data
  const updatedRows = dataRows.filter(row => {
    const step = row.split(',')[0]; // Extract step from the row
    return newSteps.has(step);
  });

  // Step 8: Add new rows (overwriting or appending)
  const rowsToAdd = newRows.filter(row => {
    const step = row.split(',')[0]; // Extract step from the new row
    return !updatedRows.some(existingRow => existingRow.startsWith(`${step},`));
  });

  const finalRows = [...updatedRows, ...rowsToAdd];

  // Step 9: Combine the header with the final rows
  const updatedCsvContent = [header, ...finalRows].join('\n');

  // Step 10: Write the updated CSV content back to the file
  fs.writeFile(filePath, updatedCsvContent, 'utf8', (err) => {
    if (err) {
      console.error('Error saving the updated CSV file:', err);
      return res.status(500).json({ message: 'Error saving the updated CSV file' });
    }
    
    res.json({ message: 'CSV file updated successfully', filePath });
  });
});
