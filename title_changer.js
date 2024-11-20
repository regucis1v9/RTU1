const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec } = require('child_process');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\x1b[36m%s\x1b[0m', '=== Project Title and Logo Changer ===\n');

async function copyLogo(logoPath) {
    try {
        // Remove any escape characters from the path
        const cleanPath = logoPath.replace(/\\/g, '');
        const imagesDir = path.join(__dirname, 'src', 'images');
        const newLogoPath = path.join(imagesDir, path.basename(cleanPath));
        
        // Ensure the images directory exists
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }
        
        fs.copyFileSync(cleanPath, newLogoPath);
        return path.basename(cleanPath);
    } catch (error) {
        throw new Error(`Failed to copy logo: ${error.message}`);
    }
}

async function updateTitleAndLogo(newTitle, newLogoPath) {
    const loginPath = path.join(__dirname, 'src', 'views', 'Login.jsx');

    if (!fs.existsSync(loginPath)) {
        throw new Error('Login.jsx not found! Make sure script is run from project root.');
    }

    let content = fs.readFileSync(loginPath, 'utf8');
    fs.writeFileSync(`${loginPath}.backup`, content);

    if (newLogoPath) {
        const logoName = await copyLogo(newLogoPath);
        content = content.replace(
            /import logo from "\.\.\/images\/.*";/,
            `import logo from "../images/${logoName}";`
        );
    }

    if (newTitle) {
        // Updated regex to handle the config.title format
        content = content.replace(
            /{config\.title \|\| '[^']*'}/,
            `'${newTitle}'`
        );
    }

    fs.writeFileSync(loginPath, content);
    
    console.log('\x1b[32m%s\x1b[0m', '\n✓ Updates completed successfully!');
    console.log('\x1b[33m%s\x1b[0m', '→ Backup created as Login.jsx.backup');

    // Start the application
    console.log('\nStarting the application...');
    exec('npm start', (error, stdout, stderr) => {
        if (error) {
            console.error(`Failed to start application: ${error}`);
            return;
        }
        console.log('Application started successfully');
    });
}

async function main() {
    try {
        const loginPath = path.join(__dirname, 'src', 'views', 'Login.jsx');
        const content = fs.readFileSync(loginPath, 'utf8');
        const titleMatch = content.match(/{config\.title \|\| '([^']*)'}/);
        const currentTitle = titleMatch ? titleMatch[1] : '';
        const logoMatch = content.match(/import logo from "\.\.\/images\/(.*?)";/);
        const currentLogo = logoMatch ? logoMatch[1] : '';

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
                            await updateTitleAndLogo(title.trim(), null);
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
                            await updateTitleAndLogo(null, cleanPath);
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
                                await updateTitleAndLogo(title.trim(), cleanPath);
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

main();
