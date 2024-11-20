// title_changer.js
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
        const imagesDir = path.join(__dirname, 'src', 'images');
        const newLogoPath = path.join(imagesDir, path.basename(cleanPath));
        
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }
        
        fs.copyFileSync(cleanPath, newLogoPath);
        return `/images/${path.basename(cleanPath)}`; // Return web-friendly path
    } catch (error) {
        throw new Error(`Failed to copy logo: ${error.message}`);
    }
}

async function updateConfig(newTitle, newLogoPath) {
    try {
        const configPath = path.join(__dirname, 'config.json');
        let config = {};

        // Read existing config if it exists
        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }

        // Update config
        if (newTitle) {
            config.title = newTitle;
        }

        if (newLogoPath) {
            const logoWebPath = await copyLogo(newLogoPath);
            config.logoPath = logoWebPath;
        }

        // Save config
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        
        console.log('\x1b[32m%s\x1b[0m', '\n✓ Configuration updated successfully!');
        
        // Start the Electron application
        console.log('\nStarting the Electron application...');
        require('child_process').exec('npx electron .', (error, stdout, stderr) => {
            if (error) {
                console.error(`Failed to start application: ${error}`);
                return;
            }
            console.log('Application started successfully');
        });
    } catch (error) {
        throw new Error(`Failed to update config: ${error.message}`);
    }
}

async function main() {
    try {
        const configPath = path.join(__dirname, 'config.json');
        let currentTitle = '';
        let currentLogo = '';

        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            currentTitle = config.title || '';
            currentLogo = config.logoPath || '';
        }

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
                            await updateConfig(title.trim(), null);
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
                            await updateConfig(null, cleanPath);
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
                                await updateConfig(title.trim(), cleanPath);
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
