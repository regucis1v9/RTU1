// Server-side route
app.post('/create-code', (req, res) => {
  const { fileName } = req.body;

  // Validate the request data
  if (!fileName) {
    return res.status(400).send('File name is required.');
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(fileName)) {
    return res.status(400).send('Invalid file name. Only letters, numbers, underscores, and dashes are allowed.');
  }

  const codesDirectory = path.join(__dirname, 'codes');

  // Function to generate a unique file name
  const generateUniqueFileName = (baseName) => {
    let uniqueName = baseName;
    let counter = 1;
    
    while (fs.existsSync(path.join(codesDirectory, `${uniqueName}.csv`))) {
      uniqueName = `${baseName}_${counter}`;
      counter++;
    }
    
    return uniqueName;
  };

  // Generate a unique file name
  const uniqueFileName = generateUniqueFileName(fileName);
  const filePath = path.join(codesDirectory, `${uniqueFileName}.csv`);

  // Create a file with a simple placeholder
  const placeholderContent = 'id,name,value\n1,Example,100\n2,Sample,200\n';

  // Create the file with placeholder content
  fs.writeFile(filePath, placeholderContent, (err) => {
    if (err) {
      console.error('Error creating file:', err);
      return res.status(500).send('Failed to create the file.');
    }

    // Send back the actual file name used (which might be different from the original input)
    res.status(201).json({ 
      fileName: uniqueFileName,
      message: 'File created successfully.' 
    });
  });
});

// Client-side modification
const handleCreateNewFile = async () => {
  const baseFileName = `new_file`;
  
  try {
    const response = await fetch('http://localhost:3002/create-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: baseFileName }),
    });

    if (response.ok) {
      const result = await response.json();
      
      // Immediately fetch the updated file list to ensure we get the new file
      await fetchCsvFiles();
      
      // Set the newly created file as the current file
      const newFileName = result.fileName;
      const newFile = csvFiles.find(f => f.name === `${newFileName}.csv`);
      
      if (newFile) {
        setCurrentCode(newFile.content);
        setFileName(newFileName);
        setLineNumbers(newFile.content.split('\n').map((_, index) => index + 1));
      }
      
      toast.success('New file created successfully');
    } else {
      const error = await response.text();
      toast.error(`Failed to create file: ${error}`);
    }
  } catch (error) {
    console.error('Error creating new file:', error);
    toast.error(`An error occurred: ${error.message}`);
  }
};

app.post('/save-code', (req, res) => {
  const { fileName, code, oldFileName } = req.body;

  if (!fileName || !code) {
    return res.status(400).send('Filename and code are required.');
  }

  const codesDirectory = path.join(__dirname, 'codes');
  const newFilePath = path.join(codesDirectory, `${fileName}.csv`);

  // If old file name is provided and different from new file name
  if (oldFileName && oldFileName !== fileName) {
    const oldFilePath = path.join(codesDirectory, `${oldFileName}.csv`);

    // Ensure we're not overwriting another file
    if (fs.existsSync(newFilePath)) {
      return res.status(400).send('A file with this name already exists.');
    }

    // Rename the file
    fs.rename(oldFilePath, newFilePath, (renameErr) => {
      if (renameErr) {
        console.error('Error renaming file:', renameErr);
        return res.status(500).send('Failed to rename the file.');
      }

      // Write the updated content to the new file
      fs.writeFile(newFilePath, code, (writeErr) => {
        if (writeErr) {
          console.error('Error saving file:', writeErr);
          return res.status(500).send('Failed to save the file.');
        }

        res.status(200).send('File renamed and saved successfully.');
      });
    });
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

// Client-side changes (in the React component)
const handleSaveCode = async () => {
  if (!fileName.trim()) {
    toast.error('Please provide a valid file name before saving.');
    return;
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(fileName)) {
    toast.error('File name can only contain letters, numbers, underscores, and dashes.');
    return;
  }

  // Determine the old file name only if a file is currently dragged
  const oldFileName = draggedFile?.name ? draggedFile.name.replace('.csv', '') : null;

  try {
    const response = await fetch('http://localhost:3002/save-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName,  // New file name
        code: currentCode,  // Content of the file
        oldFileName,  // Old file name (if renaming)
      }),
    });

    if (response.ok) {
      toast.success(`File "${fileName}.csv" saved successfully.`);

      // Update draggedFile and file list states
      if (oldFileName && oldFileName !== fileName) {
        // Update the file in the list
        setCsvFiles(prevFiles => 
          prevFiles.map(file => 
            file.name === `${oldFileName}.csv` 
              ? { ...file, name: `${fileName}.csv`, content: currentCode }
              : file
          )
        );

        // Update draggedFile
        setDraggedFile({ 
          ...draggedFile, 
          name: `${fileName}.csv`, 
          content: currentCode 
        });
      }
    } else {
      const error = await response.text();
      toast.error(`Failed to save file: ${error}`);
    }
  } catch (error) {
    toast.error(`An error occurred: ${error.message}`);
  }
};

