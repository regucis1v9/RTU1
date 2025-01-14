const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/data/:chartType', (req, res) => {
    const { chartType } = req.params;
    let fileName;

    switch(chartType) {
        case 'temperature':
            fileName = 'temperatura.csv';
            break;
        case 'pressure':
            fileName = 'spiediens.csv';
            break;
        case 'temperature2':
            fileName = 'temperatura2.csv';
            break;
        default:
            fileName = 'temperatura.csv';
    }

    const filePath = path.join(__dirname, 'U_dati', fileName);
    
    console.log(`Attempting to read file: ${fileName} from path: ${filePath}`);
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file ${fileName}:`, err);
            res.status(500).send('Error reading file');
            return;
        }

        console.log(`Successfully read file: ${fileName}`);
        console.log(`First 100 characters of data: ${data.substring(0, 100)}`);
        
        res.send(data);
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
