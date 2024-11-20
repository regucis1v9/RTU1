const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\x1b[36m%s\x1b[0m', '=== Project Title and Logo Changer ===\n');

async function copyLogo(logoPath) {
    try {
        const cleanPath = logoPath.replace(/\\/g, '');
        // Update path to match src/images structure
        const imagesDir = path.join(__dirname, 'src', 'images');
        const newLogoPath = path.join(imagesDir, path.basename(cleanPath));
        
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }
        
        fs.copyFileSync(cleanPath, newLogoPath);
        // Update to use the correct import path for React
        return `../images/${path.basename(cleanPath)}`;
    } catch (error) {
        throw new Error(`Failed to copy logo: ${error.message}`);
    }
}

async function updateLoginComponent(newTitle, newLogoPath) {
    const loginPath = path.join(__dirname, 'src', 'views', 'Login.jsx');

    if (!fs.existsSync(loginPath)) {
        throw new Error('Login.jsx not found! Make sure script is run from project root.');
    }

    let content = fs.readFileSync(loginPath, 'utf8');
    
    // Create backup
    fs.writeFileSync(`${loginPath}.backup`, content);

    try {
        // Update logo import if new logo provided
        if (newLogoPath) {
            const logoName = await copyLogo(newLogoPath);
            content = content.replace(
                /import\s+logo\s+from\s+(['"])\.\.\/images\/[^'"]*\1;/,
                `import logo from "${logoName}";`
            );
        }

        // Update title if provided
        if (newTitle) {
            content = content.replace(
                /<div\s+className="text">.*?<\/div>/,
                `<div className="text">${newTitle}</div>`
            );
        }

        // Save updated content
        fs.writeFileSync(loginPath, content);
        console.log('\x1b[32m%s\x1b[0m', '\n✓ Updates completed successfully!');
        console.log('\x1b[33m%s\x1b[0m', '→ Backup created as Login.jsx.backup');

    } catch (error) {
        // Restore from backup if something goes wrong
        fs.copyFileSync(`${loginPath}.backup`, loginPath);
        throw new Error(`Failed to update Login.jsx: ${error.message}`);
    }
}

async function main() {
    try {
        const loginPath = path.join(__dirname, 'src', 'views', 'Login.jsx');
        let content = fs.readFileSync(loginPath, 'utf8');
        
        // Extract current title and logo
        const titleMatch = content.match(/<div\s+className="text">(.*?)<\/div>/);
        const currentTitle = titleMatch ? titleMatch[1].replace(/['"]/g, '') : '';
        
        const logoMatch = content.match(/import\s+logo\s+from\s+(['"])(.+?)\1/);
        const currentLogo = logoMatch ? logoMatch[2] : '';

        console.log('\x1b[33m%s\x1b[0m', `Current title: "${currentTitle}"`);
        console.log('\x1b[33m%s\x1b[0m', `Current logo: ${currentLogo}\n`);

        console.log('What would you like to update?');
        console.log('1. Title only');
        console.log('2. Logo only');
        console.log('3. Both title and logo');

        rl.question('\nEnter choice (1-3): ', (choice) => {
            switch (choice.trim()) {
                case '1':
                    rl.question('\nEnter new title: ', async (title) => {
                        if (title.trim()) {
                            await updateLoginComponent(title.trim(), null);
                        } else {
                            console.log('\x1b[31m%s\x1b[0m', '\n❌ Title cannot be empty!');
                        }
                        rl.close();
                    });
                    break;

                case '2':
                    rl.question('\nEnter path to new logo: ', async (logoPath) => {
                        const cleanPath = logoPath.trim().replace(/\\/g, '');
                        if (cleanPath && fs.existsSync(cleanPath)) {
                            await updateLoginComponent(null, cleanPath);
                        } else {
                            console.log('\x1b[31m%s\x1b[0m', '\n❌ Invalid logo path!');
                            console.log('Please ensure the file exists and the path is correct.');
                        }
                        rl.close();
                    });
                    break;

                case '3':
                    rl.question('\nEnter new title: ', (title) => {
                        if (!title.trim()) {
                            console.log('\x1b[31m%s\x1b[0m', '\n❌ Title cannot be empty!');
                            rl.close();
                            return;
                        }
                        rl.question('\nEnter path to new logo: ', async (logoPath) => {
                            const cleanPath = logoPath.trim().replace(/\\/g, '');
                            if (cleanPath && fs.existsSync(cleanPath)) {
                                await updateLoginComponent(title.trim(), cleanPath);
                            } else {
                                console.log('\x1b[31m%s\x1b[0m', '\n❌ Invalid logo path!');
                                console.log('Please ensure the file exists and the path is correct.');
                            }
                            rl.close();
                        });
                    });
                    break;

                default:
                    console.log('\x1b[31m%s\x1b[0m', '\n❌ Invalid choice!');
                    rl.close();
            }
        });
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `\n❌ Error: ${error.message}`);
        rl.close();
    }
}

// Start the main function
main();
