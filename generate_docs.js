const fs = require('fs');

const code = fs.readFileSync('docs/js/sudoku_csp.js', 'utf8');

// A simple regex to find top-level function declarations
const regex = /function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*\{([\s\S]*?)\}/g;
let match;
const functions = [];

while ((match = regex.exec(code)) !== null) {
  const name = match[1];
  const args = match[2].split(',').map(arg => arg.trim()).filter(arg => arg.length > 0);
  const body = match[3];

  // Try to find return statements to guess the output
  const returnRegex = /return\s+([^;]+)/g;
  let returnMatch;
  const returns = [];
  while ((returnMatch = returnRegex.exec(body)) !== null) {
    let ret = returnMatch[1].trim();
    if (ret && !returns.includes(ret)) {
      returns.push(ret);
    }
  }

  // If no return statement or only returning undefined/void
  let outputDescription = "None";
  if (returns.length > 0) {
      if (returns.length === 1) {
          outputDescription = returns[0];
      } else {
          outputDescription = returns.join(' OR ');
      }
  }

  functions.push({
    name,
    args,
    outputs: outputDescription
  });
}

// Generate HTML
let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>sudoku_csp Functions Anatomy</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
        h1 { color: #333; }
        .function-card { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .function-name { font-size: 1.2em; font-weight: bold; color: #0056b3; }
        .property { font-weight: bold; }
    </style>
</head>
<body>
    <h1>Anatomy of functions in sudoku_csp</h1>
`;

for (const fn of functions) {
    html += `    <div class="function-card">
        <div class="function-name">${fn.name}</div>
        <div><span class="property">Arguments:</span> ${fn.args.length > 0 ? fn.args.join(', ') : 'None'}</div>
        <div><span class="property">Outputs:</span> ${fn.outputs.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>\n`;
}

html += `</body>
</html>`;

fs.writeFileSync('docs/csp.html', html);
console.log('Generated docs/csp.html');
