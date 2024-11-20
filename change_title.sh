#!/bin/bash

# Run the title_changer.js with Node.js
node title_changer.js

# After the title change, ask for the new title and image path
read -p "Enter the new title: " new_title
read -p "Enter the path of the new image (e.g., /path/to/image.png): " new_image_path

# Extract the image filename from the path
image_filename=$(basename "$new_image_path")

# Copy the image to the src/images folder
cp "$new_image_path" "./src/images/$image_filename"

# After copying, update the Login.jsx file with the correct title and image path
node -e "
const fs = require('fs');
const path = require('path');

// Path to the Login.jsx file
const loginPath = path.join(__dirname, 'src', 'views', 'Login.jsx');

// Read the Login.jsx file
let content = fs.readFileSync(loginPath, 'utf8');

// Replace the old title with the new title
const updatedContent = content.replace(
  /<div className=\"text\">.*<\/div>/,
  \`<div className="text">${new_title}</div>\`
);

// Replace the old logo path with the new one
const finalContent = updatedContent.replace(
  /import logo from '.*';/,
  \`import logo from '../images/$image_filename';\`
);

// Write the updated content back to Login.jsx
fs.writeFileSync(loginPath, finalContent);

console.log('Login.jsx has been updated with the new title and image.');
"

# Wait for the user to confirm the changes
read -p "Press [Enter] to continue..."
