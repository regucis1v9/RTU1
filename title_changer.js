const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\x1b[36m%s\x1b[0m', '=== Project Title Changer ===\n'); // Cyan color

// Function to update the title
async function updateTitle(newTitle) {
    try {
        const loginPath = path.join(__dirname, 'src', 'views', 'Login.jsx');
        
        // Check if file exists
        if (!fs.existsSync(loginPath)) {
            throw new Error('Login.jsx not found! Make sure you run this script in the project root directory.');
        }

        let content = fs.readFileSync(loginPath, 'utf8');
        
        // Create backup
        fs.writeFileSync(`${loginPath}.backup`, content);

        // Updated regex to specifically target the text between the <div> tags
        const regex = /(<div[^>]*className="text"[^>]*>)([^<]*)(<\/div>)/;
        
        // Replace the title while preserving the surrounding HTML tags
        const newContent = content.replace(regex, (match, startTag, oldTitle, endTag) => {
            return `${startTag}${newTitle}${endTag}`; // Only replace the title text
        });

        // Write the new content back to the file
        fs.writeFileSync(loginPath, newContent);
        
        console.log('\x1b[32m%s\x1b[0m', '\n✓ Title updated successfully!'); // Green color
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

        // Match the current title from the HTML
        const match = content.match(/<div[^>]*className="text"[^>]*>([^<]*)<\/div>/);
        
        if (match && match[1]) {
            const currentTitle = match[1];
            console.log('\x1b[33m%s\x1b[0m', `Current title: "${currentTitle}"`); // Yellow color
        } else {
            console.log('\x1b[31m%s\x1b[0m', '\n❌ Could not find the title in Login.jsx'); // Red color
        }
        
        rl.question('\nEnter new title: ', async (answer) => {
            if (answer.trim()) {
                await updateTitle(answer.trim());
            } else {
                console.log('\x1b[31m%s\x1b[0m', '\n❌ Title cannot be empty!'); // Red color
            }
            rl.close();
        });
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `\n❌ Error: ${error.message}`); // Red color
        rl.close();
    }
}

// Run the program
main();
