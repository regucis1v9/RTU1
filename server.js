const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5001;

const PROJECTS_DIR = path.resolve(__dirname, 'csvFiles');
const ACTIVE_DIR = path.resolve(__dirname, '../active-folder');


if (!fs.existsSync(PROJECTS_DIR)) {
  console.error(`Directory ${PROJECTS_DIR} does not exist!`);
  process.exit(1);
}
if (!fs.existsSync(ACTIVE_DIR)) {
  fs.mkdirSync(ACTIVE_DIR);
  console.log(`Sister folder created at: ${ACTIVE_DIR}`);
}
app.use(cors());
app.use(bodyParser.json());

const loadUsers = () => {
  const usersFilePath = path.join(__dirname, '../U_Paroles/users.csv');
  const users = [];

  if (!fs.existsSync(usersFilePath)) {
    throw new Error("Users CSV file not found.");
  }

  const rawData = fs.readFileSync(usersFilePath, 'utf8');
  const rows = rawData.split('\n').filter(row => row.trim()); // Split lines and filter empty rows

  rows.forEach((line, index) => {
    if (index === 0) return; // Skip the header row ("user,password")
    const [username, password] = line.split(','); // Parse each row into username and password
    if (username && password) {
      users.push({ username: username.trim(), password: password.trim() });
    }
  });

  return users;
};

const checkPassword = (storedPassword, inputPassword) => {
  return storedPassword === inputPassword; // Plain text comparison
};

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  try {
    const users = loadUsers();
    const user = users.find(user => user.username === username);

    if (user) {
      if (checkPassword(user.password, password)) {
        return res.json({ message: "Login successful!" });
      } else {
        return res.status(401).json({ message: "Incorrect password" });
      }
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

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
      finalName = `${name}-${today} (${counter})${ext}`;
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

const sanitizeFileName = (fileName) => {
  // Remove any existing date stamps or additional extensions
  return fileName.replace(/-\d{4}-\d{2}-\d{2}.*/, '').trim();
};

app.post('/renameFile', (req, res) => {
  const { oldFileName, newFileName } = req.body;

  // Sanitize filenames
  const sanitizedOldFileName = sanitizeFileName(oldFileName);
  const sanitizedNewFileName = sanitizeFileName(newFileName);

  // Construct full file paths
  const today = new Date().toISOString().split('T')[0];
  const oldFilePath = path.join(PROJECTS_DIR, oldFileName);
  const newFilePath = path.join(PROJECTS_DIR, `${sanitizedNewFileName}-${today}.csv`);

  // Check if the old file exists
  if (!fs.existsSync(oldFilePath)) {
    return res.status(404).json({ message: 'Original file not found' });
  }

  // Check if a file with the new name already exists
  let finalNewFilePath = newFilePath;
  let counter = 1;
  while (fs.existsSync(finalNewFilePath)) {
    finalNewFilePath = path.join(PROJECTS_DIR, `${sanitizedNewFileName}-${today} (${counter}).csv`);
    counter++;
  }

  try {
    // Rename the file
    fs.renameSync(oldFilePath, finalNewFilePath);

    // Return the new filename
    const newFileNameOnly = path.basename(finalNewFilePath);
    res.json({
      message: 'File renamed successfully',
      newFileName: newFileNameOnly
    });
  } catch (error) {
    console.error('Error renaming file:', error);
    res.status(500).json({ message: 'Error renaming the file', error: error.message });
  }
});

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

  const defaultHeader = 'step,tMin,tMax,time,pressure,tUnit,pressureUnit,shellTemp,coldStart,fan,activeShelf1,activeShelf2,activeShelf3';
  const defaultRow = '1,0,0,1,6,C,mbar,0,0,0,1,1,1';


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
  while (fs.existsSync(finalFilePath)) {
    finalFilePath = path.join(PROJECTS_DIR, `${fileName}-${today} (${counter}).csv`);
    counter++;
  }

  // Write the final CSV data to the file
  fs.writeFile(finalFilePath, finalCsvData, 'utf8', (err) => {
    if (err) {
      console.error('Error saving the CSV file:', err);
      return res.status(500).json({ message: 'Error saving the CSV file' });
    }

    // Send back the full file name (including date)
    const savedFileName = path.basename(finalFilePath); // This will include the date, e.g., "test-2024-12-12.csv"
    res.json({ message: 'CSV file saved successfully', filePath: savedFileName });
  });
});

const upload = multer({ storage: storage });

app.delete('/delete-project/:projectId', (req, res) => {
  const { projectId } = req.params;
  const filePath = path.join(PROJECTS_DIR, projectId);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Project not found' });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting project:', err);
      return res.status(500).json({ message: 'Error deleting the project' });
    }

    res.json({ message: 'Project deleted successfully' });
  });
});

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
  const sanitizedFileName = sanitizeFileName(fileName);

  // Find the actual file in the directory
  const files = fs.readdirSync(PROJECTS_DIR);
  const matchingFile = files.find(file => file.startsWith(sanitizedFileName) && file.endsWith('.csv'));

  if (!matchingFile) {
    return res.status(404).json({ message: 'File not found' });
  }

  const filePath = path.join(PROJECTS_DIR, matchingFile);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  const existingCsv = fs.readFileSync(filePath, 'utf8');
  const rows = existingCsv.split('\n');
  const header = rows[0];
  let dataRows = rows.slice(1);

  // Process incoming data
  const newRows = data.map((newRow) => {
    const {
      step,
      tMin = 0,
      tMax = 0,
      time = 0,
      pressure = 0,
      tUnit = 'C',
      pressureUnit = 'C',
      shellTemp = 0,
      coldStart = 0,  // Default as integer (0 or 1)
      fan = 0,        // Default as integer (0 or 1)
      activeShelf1 = 0,
      activeShelf2 = 0,
      activeShelf3 = 0,
    } = newRow;

    // Ensure coldStart, fan, activeShelf1, etc., are converted to integers
    const coldStartInt = coldStart ? 1 : 0;  // Convert truthy value to 1, falsy to 0
    const fanInt = fan ? 1 : 0;
    const activeShelf1Int = activeShelf1 ? 1 : 0;
    const activeShelf2Int = activeShelf2 ? 1 : 0;
    const activeShelf3Int = activeShelf3 ? 1 : 0;

    return `${step},${tMin},${tMax},${time},${pressure},${tUnit},${pressureUnit},${shellTemp},${coldStartInt},${fanInt},${activeShelf1Int},${activeShelf2Int},${activeShelf3Int}`;
  });

  // Update existing rows and add new rows
  const rowsToKeep = dataRows.map((row) => {
    const step = row.split(',')[0];
    const matchingNewRow = newRows.find((newRow) => newRow.startsWith(`${step},`));
    return matchingNewRow || row;
  });

  newRows.forEach((newRow) => {
    const step = newRow.split(',')[0];
    const existsInDataRows = rowsToKeep.some((row) => row.startsWith(`${step},`));
    if (!existsInDataRows) {
      rowsToKeep.push(newRow);
    }
  });

  const rowsToDelete = dataRows.filter((row) => {
    const step = row.split(',')[0];
    return !newRows.some((newRow) => newRow.startsWith(`${step},`));
  });

  const updatedRowsToKeep = rowsToKeep.filter((row) => {
    const step = row.split(',')[0];
    return !rowsToDelete.some((deletedRow) => deletedRow.startsWith(`${step},`));
  });

  // Combine header and updated rows
  const updatedCsvContent = [header, ...updatedRowsToKeep].join('\n');

  // Write the updated CSV content back to the file
  fs.writeFile(filePath, updatedCsvContent, 'utf8', (err) => {
    if (err) {
      console.error('Error saving the updated CSV file:', err);
      return res.status(500).json({ message: 'Error saving the updated CSV file' });
    }

    res.json({ message: 'CSV file updated successfully', filePath });
  });
});


const { exec } = require('child_process');

app.post('/run-script', (req, res) => {
  const scriptPath = path.join(__dirname, 'test.bat'); // Change the extension to '.bat'

  // Execute the batch script using cmd.exe on Windows
  exec(`cmd.exe /c "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error.message}`);
      return res.status(500).json({ message: 'Error running the script', error: error.message });
    }
    if (stderr) {
      console.warn(`Script stderr: ${stderr}`);
    }

    // Respond with the script's output
    res.json({ message: 'Script executed successfully', output: stdout.trim() });
  });
});
app.post('/copy-to-sister-folder', (req, res) => {
  const { fileName, username, password } = req.body;

  if (!fileName || !username || !password) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  // Extract the base filename by locating '.csv' and taking everything before it
  const baseFileName = fileName.split('.csv')[0] + '.csv';  // Keeps the entire base name before '.csv'

  // Construct modified filename by appending username and password
  const modifiedFileName = `${baseFileName.split('.')[0]}-${username}-${password}.csv`;

  const sourcePath = path.join(PROJECTS_DIR, baseFileName);  // Look for the base file in the source directory
  const destinationPath = path.join(ACTIVE_DIR, modifiedFileName);  // Destination with modified filename
  if (!fs.existsSync(sourcePath)) {
    return res.status(404).json({ message: `File "${baseFileName}" not found in ${PROJECTS_DIR}` });
  }

  try {
    // Check if any files exist in the destination directory and remove them
    const filesInActiveDir = fs.readdirSync(ACTIVE_DIR);
    if (filesInActiveDir.length > 0) {
      filesInActiveDir.forEach(file => {
        const fileToDelete = path.join(ACTIVE_DIR, file);
        fs.unlinkSync(fileToDelete);
      });
    }

    // Copy the base file to the destination directory with the new name
    fs.copyFileSync(sourcePath, destinationPath);

    return res.json({ message: `File copied successfully to: ${destinationPath}` });
  } catch (err) {
    console.error('Error copying file:', err);
    return res.status(500).json({ message: `Error copying file: ${err.message}` });
  }
});

app.post('/copy-to-sister-folder', (req, res) => {
  const { fileName } = req.body;

  if (!fileName) {
    return res.status(400).json({ message: 'File name is required' });
  }

  const result = copyFileToSisterFolder(fileName);

  if (result.error) {
    return res.status(404).json({ message: result.error });
  }

  res.json({ message: result.message });
});

const csvParser = require('csv-parser');

function parseCSVToAlert(filePath) {
  return new Promise((resolve, reject) => {
    const alerts = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        // Trim the keys to remove leading/trailing spaces
        const trimmedRow = Object.fromEntries(
          Object.entries(row).map(([key, value]) => [key.trim(), value.trim()])
        );

        console.log('Parsed row:', trimmedRow); // Log the trimmed row for debugging

        const alert = {
          type: trimmedRow.type || '',
          message: trimmedRow.message || '',
          time: trimmedRow.Time || '',  // Make sure 'Time' is used as per CSV header
        };
        alerts.push(alert);
      })
      .on('end', () => {
        resolve(alerts);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

app.get('/api/check-alerts', async (req, res) => {
  try {
    const alertsDir = path.resolve(__dirname, 'U_Paziņojumi');

    if (!fs.existsSync(alertsDir)) {
      console.error('Alerts directory not found');
      return res.status(404).json({ message: 'Alerts directory not found' });
    }

    const files = fs.readdirSync(alertsDir).filter(file => file.endsWith('.csv'));

    if (files.length === 0) {
      console.error('No CSV files found in the alerts directory');
      return res.status(404).json({ message: 'No alerts found' });
    }

    const alerts = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(alertsDir, file);
        const parsedAlerts = await parseCSVToAlert(filePath);
        return { fileName: file, alerts: parsedAlerts };
      })
    );

    res.setHeader('Content-Type', 'application/json');
    return res.json({ alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.post('/api/delete-alert', (req, res) => {
  const { filename } = req.body; // Expecting filename in the body of the request

  if (!filename) {
    return res.status(400).json({ error: 'Filename is required' });
  }

  const filepath = path.resolve(__dirname, 'U_Paziņojumi', filename);  // Path to the file

  // Check if the file exists before attempting to delete it
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Alert file not found' });
  }

  // Attempt to delete the file
  fs.unlink(filepath, (err) => {
    if (err) {
      console.error('Error deleting alert file:', err);
      return res.status(500).json({ error: 'Failed to delete alert file' });
    }

    // Successfully deleted the alert file
    res.json({ success: true, message: `Alert file '${filename}' deleted successfully` });
  });
});

app.delete('/delete-alert/:alertId', (req, res) => {
  const alertId = req.params.alertId;  // Get the alert ID from the URL parameter
  const filePath = path.join(__dirname, 'U_Paziņojumi', `${alertId}.csv`);  // Path to the file
  
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Failed to delete the file:", err);
      return res.status(500).json({ message: 'Error deleting file' });
    }
    console.log(`File ${alertId}.csv deleted successfully`);
    res.status(200).json({ message: 'File deleted successfully' });
  });
});


