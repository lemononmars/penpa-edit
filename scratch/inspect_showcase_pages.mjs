import fs from 'fs';

const tex = fs.readFileSync('C:/Users/sakul_bp6myy0/OneDrive/Downloads/Puzzles/CB Puzzle Contest/2026/pb/logic_showcase.tex', 'utf8');
const pages = tex.split(/\\newpage/);
console.log('Total pages in logic_showcase.tex:', pages.length);

pages.forEach((p, idx) => {
  const heads = [...p.matchAll(/\\lshead(?:s)?\{([^}]+)\}\{([^}]+)\}\{([^}]+)\}/g)];
  console.log(`\n=== Page ${idx+1} === (${heads.length} puzzles)`);
  heads.forEach(h => {
    console.log(`  [${h[1]}] ${h[2]} (${h[3]})`);
  });
});
