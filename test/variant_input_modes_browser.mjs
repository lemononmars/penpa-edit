import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage();
 await page.goto('http://127.0.0.1:5180/');
 await page.waitForFunction(()=>window.pu && window.SudokuVariantPresentation && window.SudokuTools);
 const actual=await page.evaluate(()=>{
  const ids=['sumdetector','pointingdigits','threeup','insideskyscraper','odd even','fortress','thermo','killer'];
  pu.activeSudokuVariants=['classic',...ids];
  document.getElementById('constraints_settings_opt').replaceChildren();
  SudokuTools.renderVariantTools();
  return ids.map(id=>{const el=document.querySelector(`.sudoku-variant-group[data-variant="${id}"]`);return {id,title:el?.querySelector('.sudoku-variant-title')?.textContent,icon:el?.querySelector('.variant-accordion-icon')?.textContent,buttons:[...el.querySelectorAll('.sudoku-variant-mode')].map(b=>b.textContent)};});
 });
 console.log(actual);
 assert.equal(actual[0].title,'Sum Detector');
 for(const row of actual.slice(0,4)){assert.equal(row.icon,'□');assert.ok(row.buttons.includes('Arrow'));assert.ok(!row.buttons.includes('Mark'));}
 assert.equal(actual.find(x=>x.id==='odd even').icon,'□');
 assert.equal(actual.find(x=>x.id==='fortress').icon,'◩');
 assert.equal(actual.find(x=>x.id==='thermo').icon,'╱');
 assert.equal(actual.find(x=>x.id==='killer').icon,'▧');
 await page.getByRole('button',{name:'Enlarge input-mode text',exact:true}).click();
 const layout=await page.evaluate(()=>{
   const group=document.querySelector('.sudoku-variant-group[data-variant="pointingdigits"]');
   const header=group.querySelector('.sudoku-variant-header');
   const row=group.querySelector('.sudoku-variant-row');
   const title=group.querySelector('.sudoku-variant-title');
   const close=group.querySelector('.sudoku-variant-close');
   return {font:getComputedStyle(title).fontSize,background:getComputedStyle(row).backgroundColor,
     display:getComputedStyle(header).display,closeRow:getComputedStyle(close).gridRowStart};
 });
 assert.equal(layout.font,'16px');
 assert.equal(layout.background,'rgba(0, 0, 0, 0)');
 assert.equal(layout.display,'grid');
 assert.equal(layout.closeRow,'1');
 await page.evaluate(()=>{pu.activeSudokuVariants=['classic','258'];pu.redraw();});
 console.log('Input-mode titles, arrows, type icons, larger text, and fixed close layout passed.');
} finally {await browser.close();}
