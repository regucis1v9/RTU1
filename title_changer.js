const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\x1b[36m%s\x1b[0m', '=== Projekta Nosaukuma un Logotipa Mainītājs ===\n');

async function copyLogo(logoPath) {
    try {
        const imagesDir = path.join(__dirname, 'src', 'images');
        const newLogoPath = path.join(imagesDir, path.basename(logoPath));
        
        fs.copyFileSync(logoPath, newLogoPath);
        return path.basename(logoPath);
    } catch (error) {
        throw new Error(`Neizdevās kopēt logotipu: ${error.message}`);
    }
}

async function updateTitleAndLogo(newTitle, newLogoPath) {
    const loginPath = path.join(__dirname, 'src', 'views', 'Login.jsx');

    if (!fs.existsSync(loginPath)) {
        throw new Error('Login.jsx nav atrasts! Pārliecinieties, ka skripts tiek izpildīts projekta saknes direktorijā.');
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
    
    console.log('\x1b[32m%s\x1b[0m', '\n✓ Atjauninājumi veiksmīgi pabeigti!');
    console.log('\x1b[33m%s\x1b[0m', '→ Ir izveidota rezerves kopija kā Login.jsx.backup');
}

async function main() {
    try {
        const loginPath = path.join(__dirname, 'src', 'views', 'Login.jsx');
        const content = fs.readFileSync(loginPath, 'utf8');
        const titleMatch = content.match(/className="text"[^>]*>([^<]*)/);
        const currentTitle = titleMatch ? titleMatch[1] : '';
        const logoMatch = content.match(/import logo from "\.\.\/images\/(.*?)";/);
        const currentLogo = logoMatch ? logoMatch[1] : '';

        console.log('\x1b[33m%s\x1b[0m', `Pašreizējais nosaukums: "${currentTitle}"`);
        console.log('\x1b[33m%s\x1b[0m', `Pašreizējais logotips: ${currentLogo}\n`);

        console.log('Ko vēlaties atjaunināt?');
        console.log('1. Tikai nosaukumu');
        console.log('2. Tikai logotipu');
        console.log('3. Nosaukumu un logotipu');

        rl.question('\nIevadiet izvēli (1-3): ', (choice) => {
            switch (choice.trim()) {
                case '1':
                    rl.question('\nIevadiet jauno nosaukumu: ', async (title) => {
                        if (title.trim()) {
                            await updateTitleAndLogo(title.trim(), null);
                        } else {
                            console.log('\x1b[31m%s\x1b[0m', '\n❌ Nosaukums nevar būt tukšs!');
                        }
                        rl.close();
                    });
                    break;

                case '2':
                    rl.question('\nIevadiet ceļu uz jauno logotipu: ', async (logoPath) => {
                        if (logoPath.trim() && fs.existsSync(logoPath.trim())) {
                            await updateTitleAndLogo(null, logoPath.trim());
                        } else {
                            console.log('\x1b[31m%s\x1b[0m', '\n❌ Nederīgs logotipa ceļš!');
                        }
                        rl.close();
                    });
                    break;

                case '3':
                    rl.question('\nIevadiet jauno nosaukumu: ', (title) => {
                        if (!title.trim()) {
                            console.log('\x1b[31m%s\x1b[0m', '\n❌ Nosaukums nevar būt tukšs!');
                            rl.close();
                            return;
                        }
                        rl.question('\nIevadiet ceļu uz jauno logotipu: ', async (logoPath) => {
                            if (logoPath.trim() && fs.existsSync(logoPath.trim())) {
                                await updateTitleAndLogo(title.trim(), logoPath.trim());
                            } else {
                                console.log('\x1b[31m%s\x1b[0m', '\n❌ Nederīgs logotipa ceļš!');
                            }
                            rl.close();
                        });
                    });
                    break;

                default:
                    console.log('\x1b[31m%s\x1b[0m', '\n❌ Nederīga izvēle!');
                    rl.close();
            }
        });
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `\n❌ Kļūda: ${error.message}`);
        rl.close();
    }
}

main();
