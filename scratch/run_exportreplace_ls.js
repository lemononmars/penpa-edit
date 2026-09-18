const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

process.chdir('C:/Users/sakul_bp6myy0/OneDrive/Downloads/Puzzles/CB Puzzle Contest/2026/pb');
const srcDir = 'logic_showcase';
const outDir = 'graphics';

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.svg'));
console.log(`Found ${files.length} SVGs to process in ${srcDir}`);

const startTime = Date.now();
let count = 0;

files.forEach(f => {
  const filePath = path.join(srcDir, f);
  let svg = fs.readFileSync(filePath, 'utf8');
  svg = svg.replace(/Helvetica[, ]*Arial/g, 'Chakra Petch')
           .replace(/#444444/gi, '#09637E')
           .replace(/#999999/gi, '#09637E');
  
  const tempPath = path.join(srcDir, 'temp_' + f);
  const outPdf = path.join(outDir, f.replace('.svg', '.pdf'));
  fs.writeFileSync(tempPath, svg);
  try {
    execSync(`inkscape "${tempPath}" --without-gui --export-pdf="${outPdf}"`, { stdio: 'pipe' });
    count++;
    if (count % 20 === 0 || count === files.length) {
      console.log(`Processed ${count}/${files.length} files...`);
    }
  } catch (err) {
    console.error(`Error processing ${f}:`, err.message);
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
});

console.log(`Done! Exported ${count} PDFs in ${((Date.now() - startTime)/1000).toFixed(1)}s`);
