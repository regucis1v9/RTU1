const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\x1b[36m%s\x1b[0m', '=== Project Title & Logo Changer ===\n');

async function copyLogo(logoPath) {
    try {
        const imagesDir = path.join(__dirname, 'src', 'images');
        const newLogoPath = path.join(imagesDir, path.basename(logoPath));
        
        fs.copyFileSync(logoPath, newLogoPath);
        return path.basename(logoPath);
    } catch (error) {
        throw new Error(`Failed to copy logo: ${error.message}`);
    }
}

async function updateTitleAndLogo(newTitle, newLogoPath) {
    const loginPath = path.join(__dirname, 'src', 'views', 'Login.jsx');

    if (!fs.existsSync(loginPath)) {
        throw new Error('Login.jsx not found! Make sure you run this script in the project root directory.');
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
        content = content.replace(
            /className="text"[^>]*>([^<]*)/,
            `className="text">${newTitle}`
        );
    }

    fs.writeFileSync(loginPath, content);
    
    console.log('\x1b[32m%s\x1b[0m', '\n✓ Updates completed successfully!');
    console.log('\x1b[33m%s\x1b[0m', '→ A backup file has been created as Login.jsx.backup');
}

async function main() {
    try {
        const loginPath = path.join(__dirname, 'src', 'views', 'Login.jsx');
        const content = fs.readFileSync(loginPath, 'utf8');
        const titleMatch = content.match(/className="text"[^>]*>([^<]*)/);
        const currentTitle = titleMatch ? titleMatch[1] : '';
        const logoMatch = content.match(/import logo from "\.\.\/images\/(.*?)";/);
        const currentLogo = logoMatch ? logoMatch[1] : '';

        console.log('\x1b[33m%s\x1b[0m', `Current title: "${currentTitle}"`);
        console.log('\x1b[33m%s\x1b[0m', `Current logo: ${currentLogo}\n`);

        console.log('What would you like to update?');
        console.log('1. Title only');
        console.log('2. Logo only');
        console.log('3. Both title and logo');

        rl.question('\nEnter your choice (1-3): ', (choice) => {
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
                    rl.question('\nEnter path to new logo file: ', async (logoPath) => {
                        if (logoPath.trim() && fs.existsSync(logoPath.trim())) {
                            await updateTitleAndLogo(null, logoPath.trim());
                        } else {
                            console.log('\x1b[31m%s\x1b[0m', '\n❌ Invalid logo path!');
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
                        rl.question('\nEnter path to new logo file: ', async (logoPath) => {
                            if (logoPath.trim() && fs.existsSync(logoPath.trim())) {
                                await updateTitleAndLogo(title.trim(), logoPath.trim());
                            } else {
                                console.log('\x1b[31m%s\x1b[0m', '\n❌ Invalid logo path!');
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
