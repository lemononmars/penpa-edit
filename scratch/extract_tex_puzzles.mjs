import fs from 'fs';

const tex = fs.readFileSync('C:/Users/sakul_bp6myy0/OneDrive/Downloads/Puzzles/CB Puzzle Contest/2026/pb/logic_showcase.tex', 'utf8');
const regex = /\\lshead(?:s)?\{([^}]+)\}\{([^}]+)\}\{([^}]+)\}/g;
let m;
let count = 0;
while ((m = regex.exec(tex)) !== null) {
  count++;
  console.log(`${count}: ${m[1]} | ${m[2]} | ${m[3]}`);
}
