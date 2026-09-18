import fs from 'fs';

const rulesText = fs.readFileSync('rules.txt', 'utf8');
const entries = rulesText.split(/###\s*\[(\d+)\]/).slice(1);
const ruleEntries = [];
for (let i = 0; i < entries.length; i += 2) {
  const num = parseInt(entries[i], 10);
  const body = entries[i+1];
  const titleMatch = body.match(/^([^\n]+)/);
  const title = titleMatch ? titleMatch[1].trim() : '';
  const rulesMatch = body.match(/RULES:\s*([\s\S]+?)(?=\n###|\n-{10,}|$)/);
  const rules = rulesMatch ? rulesMatch[1].trim() : '';
  ruleEntries.push({ num, title, rules });
}

console.log(`Total rules entries: ${ruleEntries.length}`);

// Print non-examples
const puzzlesOnly = ruleEntries.filter(e => !e.title.includes('(EXAMPLE)'));
console.log(`Puzzles only: ${puzzlesOnly.length}`);
puzzlesOnly.forEach((p, idx) => {
  console.log(`${idx+1} [${p.num}]: ${p.title}`);
});
