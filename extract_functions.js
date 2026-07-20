const fs = require('fs');

const code = fs.readFileSync('docs/js/sudoku_csp.js', 'utf8');

const regex = /function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*\{/g;
let match;
const functions = [];

while ((match = regex.exec(code)) !== null) {
  functions.push({
    name: match[1],
    args: match[2].split(',').map(arg => arg.trim()).filter(arg => arg.length > 0)
  });
}

console.log(JSON.stringify(functions, null, 2));
