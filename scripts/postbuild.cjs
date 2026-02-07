const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('Starting post-build...');

try {
    const distDir = path.join(__dirname, '../dist');
    const srcStyle = path.join(__dirname, '../src/styles.css');
    const distStyle = path.join(distDir, 'styles.css');

    if (!fs.existsSync(distDir)) {
        console.log('Creating dist folder...');
        fs.mkdirSync(distDir);
    }

    console.log('Copying styles.css from', srcStyle, 'to', distStyle);
    fs.copyFileSync(srcStyle, distStyle);

    console.log('Running lightningcss...');
    execSync(`npx lightningcss --minify --targets "> 0.5%, not dead" "${distStyle}" -o "${distStyle}"`, { stdio: 'inherit' });

    console.log('Post-build complete.');
} catch (err) {
    console.error('Post-build failed:', err);
    process.exit(1);
}
