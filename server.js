const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5001;
const CSV_DIR = path.join(__dirname, 'src', 'csvFiles'); // Updated path for CSV files

app.use(cors());
app.use(bodyParser.json());

// Endpoint to fetch all CSV files in src/csvFiles
app.get('/src/csvFiles', (req, res) => {  // Updated endpoint path
  try {
    const csvFiles = fs.readdirSync(CSV_DIR);
    const projects = csvFiles.map(file => {
      const [name, date] = file.split('-');
      return { name, date: date.split('.')[0] };
    });
    res.json(projects);
  } catch (error) {
    console.error('Error reading CSV files:', error);
    res.status(500).json({ message: 'Error reading CSV files' });
  }
});

// Endpoint to save a new CSV file in src/csvFiles
app.post('/src/save-csv', (req, res) => {  // Updated endpoint path
  const { fileName, csvData } = req.body;

  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];

  const filePath = path.join(CSV_DIR, `${fileName}-${formattedDate}.csv`);

  fs.writeFile(filePath, csvData, 'utf8', (err) => {
    if (err) {
      console.error('Error saving the CSV file:', err);
      return res.status(500).json({ message: 'Error saving the CSV file' });
    }
    res.json({ message: 'CSV file saved successfully', filePath });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
