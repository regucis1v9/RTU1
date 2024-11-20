const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec } = require('child_process');
const util = require('util');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisify exec to make it easier to work with async/await
const execPromise = util.promisify(exec);

console.log('\x1b[36m%s\x1b[0m', '=== Project Title and Image Changer ===\n'); // Cyan color

// Function to update the title and image source
async function updateTitleAndImage(newTitle, imagePath) {
    try {
        const loginPath = path.join(__dirname, 'src', 'views', 'Login.jsx');
        
        // Check if file exists
        if (!fs.existsSync(loginPath)) {
            throw new Error('Login.jsx not found! Make sure you run this script in the project root directory.');
        }

        let content = fs.readFileSync(loginPath, 'utf8');
        
        // Create backup
        fs.writeFileSync(`${loginPath}.backup`, content);

        // Replace the title in the JSX file
        const newContent = content.replace(
            /<div[^>]*className="text"[^>]*>[^<]*<\/div>/,
            `<div className="text">${newTitle}</div>`
        );

        // Check if the provided image path is valid
        const imageFileName = path.basename(imagePath);
        const destinationImagePath = path.join(__dirname, 'src', 'images', imageFileName);

        if (!fs.existsSync(imagePath)) {
            throw new Error(`Image path "${imagePath}" does not exist!`);
        }

        // Copy the image to the 'images' directory
        fs.copyFileSync(imagePath, destinationImagePath);
        console.log('\x1b[32m%s\x1b[0m', `✓ Image copied successfully to "src/images/${imageFileName}"`);

        // Update the import path and image src in the JSX file
        const updatedContent = newContent.replace(
            /import logo from ['"][^'"]+['"];/,
            `import logo from "./images/${imageFileName}";`
        ).replace(
            /<img[^>]*className=['"][^'"]*logo[^'"]*['"][^>]*src={[^}]*}[^>]*alt="Logo"[^>]*>/,
            `<img className="logo" src={logo} alt="Logo" />`
        );

        // Write the updated content back to the file
        fs.writeFileSync(loginPath, updatedContent);
        
        console.log('\x1b[32m%s\x1b[0m', '\n✓ Title and image updated successfully!'); // Green color
        console.log('\x1b[33m%s\x1b[0m', '→ A backup file has been created as Login.jsx.backup'); // Yellow color
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `\n❌ Error: ${error.message}`); // Red color
    }
}

// Main function to run the program
async function main() {
    try {
        // Get current title
        const loginPath = path.join(__dirname, 'src', 'views', 'Login.jsx');
        const content = fs.readFileSync(loginPath, 'utf8');
        const currentTitle = content.match(/<div[^>]*className="text"[^>]*>([^<]*)<\/div>/)[1];
        const currentImage = content.match(/import logo from ['"]([^'"]+)['"];/);
        const imageSrc = currentImage ? currentImage[1] : '';

        console.log('\x1b[33m%s\x1b[0m', `Current title: "${currentTitle}"`); // Yellow color
        console.log('\x1b[33m%s\x1b[0m', `Current image source: "${imageSrc}"`); // Yellow color
        
        rl.question('\nEnter new title: ', (titleAnswer) => {
            rl.question('\nEnter new image source (full path, e.g., "/Users/.../image.png"): ', async (imageAnswer) => {
                if (titleAnswer.trim() && imageAnswer.trim()) {
                    await updateTitleAndImage(titleAnswer.trim(), imageAnswer.trim());
                } else {
                    console.log('\x1b[31m%s\x1b[0m', '\n❌ Title and image cannot be empty!'); // Red color
                }
                rl.close();
            });
        });
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `\n❌ Error: ${error.message}`); // Red color
        rl.close();
    }
}

// Run the program
main();
