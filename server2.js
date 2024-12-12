const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importing CORS

const app = express();
const PORT = 3002;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse incoming JSON requests

const CODES_FOLDER = path.join(__dirname, 'codes');

const multer = require('multer');

// Configure multer to save files in the 'codes' folder
const upload = multer({
  dest: path.join(__dirname, 'codes'),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed.'));
    }
  },
});

// Ensure the codes directory exists
if (!fs.existsSync(CODES_FOLDER)) {
  fs.mkdirSync(CODES_FOLDER);
}

// POST route to delete a code file
app.post('/delete-code', (req, res) => {
  const { fileName } = req.body;

  if (!fileName) {
    return res.status(400).send('File name is required.');
  }

  const filePath = path.join(CODES_FOLDER, fileName);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      
      // Different error handling based on error type
      if (err.code === 'ENOENT') {
        return res.status(404).send('File not found.');
      }
      
      return res.status(500).send('Failed to delete the file.');
    }

    res.status(200).send('File deleted successfully.');
  });
});

// POST route to save or rename code
app.post('/save-code', (req, res) => {
    const { fileName, code, oldFileName } = req.body;
  
    if (!fileName || !code) {
      return res.status(400).send('Filename and code are required.');
    }
  
    const codesDirectory = path.join(__dirname, 'codes');
    const newFilePath = path.join(codesDirectory, `${fileName}.csv`);
  
    console.log('Old File Name:', oldFileName); // Debugging
    console.log('New File Name:', fileName);    // Debugging
  
    if (oldFileName && oldFileName !== fileName) {
      const oldFilePath = path.join(codesDirectory, `${oldFileName}.csv`);
  
      // Check if the old file exists
      if (fs.existsSync(oldFilePath)) {
        // Rename the old file to the new file name
        fs.rename(oldFilePath, newFilePath, (err) => {
          if (err) {
            console.error('Error renaming file:', err);
            return res.status(500).send('Failed to rename the file.');
          }
  
          // After renaming, write the updated content to the file
          fs.writeFile(newFilePath, code, (err) => {
            if (err) {
              console.error('Error saving file:', err);
              return res.status(500).send('Failed to save the file.');
            }
  
            res.status(200).send('File renamed and saved successfully.');
          });
        });
      } else {
        console.error('Old file not found:', oldFilePath);
        return res.status(404).send('Old file not found.');
      }
    } else {
      // Save the file with the current name (no renaming)
      fs.writeFile(newFilePath, code, (err) => {
        if (err) {
          console.error('Error saving file:', err);
          return res.status(500).send('Failed to save the file.');
        }
  
        res.status(200).send('File saved successfully.');
      });
    }
  });

// GET route to fetch all CSV files from the codes folder
app.get('/get-codes', (req, res) => {
  fs.readdir(CODES_FOLDER, (err, files) => {
    if (err) {
      console.error('Error reading codes directory:', err);
      return res.status(500).send('Failed to retrieve codes.');
    }

    const csvFiles = files.filter(file => file.endsWith('.csv'));
    const fileDetails = csvFiles.map(file => {
      const filePath = path.join(CODES_FOLDER, file);
      const fileStats = fs.statSync(filePath);

      return {
        name: file,
        size: `${Math.round(fileStats.size / 1024)} KB`,
        content: fs.readFileSync(filePath, 'utf8') // Read file content
      };
    });

    res.status(200).json(fileDetails);
  });
});

// POST route to create a new file
app.post('/create-code', (req, res) => {
    const { fileName } = req.body;
  
    // Validate the request data
    if (!fileName) {
      return res.status(400).send('File name is required.');
    }
  
    if (!/^[a-zA-Z0-9_-]+$/.test(fileName)) {
      return res.status(400).send('Invalid file name. Only letters, numbers, underscores, and dashes are allowed.');
    }
  
    // Construct the file path
    const filePath = path.join(__dirname, 'codes', `${fileName}.csv`);
  
    // Check if the file already exists
    if (fs.existsSync(filePath)) {
      return res.status(400).send('File already exists.');
    }
  
    // Create an empty file
    fs.writeFile(filePath, '', (err) => {
      if (err) {
        console.error('Error creating file:', err);
        return res.status(500).send('Failed to create the file.');
      }
  
      res.status(201).send('File created successfully.');
    });
  });

app.post('/upload-code', upload.single('file'), (req, res) => {
    const uploadedFile = req.file;
  
    if (!uploadedFile) {
      return res.status(400).send('No file was uploaded or invalid file type.');
    }
  
    // Rename the file to include the original name with the correct extension
    const targetPath = path.join(__dirname, 'codes', uploadedFile.originalname);
  
    fs.rename(uploadedFile.path, targetPath, (err) => {
      if (err) {
        console.error('Error moving file:', err);
        return res.status(500).send('Failed to save the uploaded file.');
      }
  
      res.status(200).send('File uploaded and saved successfully.');
    });
  });

// Handle non-existent routes
app.use((req, res) => {
  res.status(404).send('Endpoint not found.');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
