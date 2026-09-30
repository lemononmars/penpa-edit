const test = require('node:test');
const assert = require('node:assert/strict');
const solver = require('../docs/js/sudoku_solver.js');
const variants = require('../docs/js/sudoku_variants/index.js');

function puzzle() {
  return {
    nx:9, ny:9, nx0:13, ny0:13, space:[0,0,0,0],
    centerlist:Array.from({length:81},(_,i)=>(Math.floor(i/9)+2)*13+i%9+2),
    point:{}, activeSudokuVariants:['classic','multidiagonal'],
    pu_q:{number:{},symbol:{},surface:{},line:{},killercages:[]}
  };
}
const key = (row,col) => (col+2)+(row+2)*13;
function addLine(p, cells, style=3) {
  for(let i=1;i<cells.length;i++){
    const a=key(...cells[i-1]), b=key(...cells[i]);
    p.pu_q.line[[a,b].join(',')]=style;
  }
}

test('Multi Diagonal preserves two crossing lines as separate complete constraints',()=>{
  const p=puzzle();
  addLine(p,Array.from({length:7},(_,i)=>[i+1,i+1]));
  addLine(p,Array.from({length:7},(_,i)=>[i+1,7-i]));
  const parsed=solver.readConstraints(p);
  assert.equal(parsed.diagnostics.length,0);
  assert.equal(parsed.wscRules.length,2);
  assert.deepEqual(parsed.wscRules.map(clue=>clue.cells.length).sort(),[7,7]);
  const lines=parsed.wscRules.map(clue=>clue.cells.map(cell=>[cell.row,cell.col]));
  assert(lines.some(line=>line.some(([r,c])=>r===1&&c===1)&&line.some(([r,c])=>r===7&&c===7)));
  assert(lines.some(line=>line.some(([r,c])=>r===1&&c===7)&&line.some(([r,c])=>r===7&&c===1)));
});

test('line style labels match Penpa colors',()=>{
  const app=require('node:fs').readFileSync(require('node:path').join(__dirname,'../docs/src/App.svelte'),'utf8');
  assert.match(app,/"3": "Green", "5": "Gray"/);
});

test('Multi Diagonal declares edge input',()=>{
  assert.deepEqual(variants.resolve('multidiagonal').inputType.categories,['edge']);
});
