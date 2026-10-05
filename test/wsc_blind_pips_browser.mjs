import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1280,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:5180/wsc2026/?tab=blind');
 if(await page.getByLabel('Password',{exact:true}).count()){await page.getByLabel('Password',{exact:true}).fill('กู้ชาติ');await page.getByRole('button',{name:'Enter',exact:true}).click();}
 const tool=page.locator('.blind-practice');await page.waitForFunction(()=>document.querySelector('.blind-practice .completion')?.textContent.includes('Generated a unique'));
 const generated=await page.evaluate(()=>JSON.parse(localStorage.getItem('wsc2026-tool-blind')).state);
 assert.equal(generated.clues.length,36);assert.equal(generated.entries.flat().filter(Boolean).length,0);
 const unique=await page.evaluate(async()=>{const {solveBlindPips,PIP_MASKS}=await import('/src/wsc2026/blindPractice.mjs');const state=JSON.parse(localStorage.getItem('wsc2026-tool-blind')).state;return {count:solveBlindPips(state.clues,state.entries,{limitSolutions:2}).solutions.length,partial:state.clues.some(mask=>mask&&!Object.values(PIP_MASKS).includes(mask))};});
 assert.equal(unique.count,1);assert.ok(unique.partial);
 await tool.getByRole('button',{name:'Clear board',exact:true}).click();await tool.locator('#blind-cell-0').click();
 await tool.getByRole('button',{name:'Clue pip center',exact:true}).click();assert.equal(await tool.locator('#blind-cell-0 .clue-pip.pip').count(),1);
 await tool.getByRole('button',{name:'Solve mode',exact:true}).click();assert.equal(await tool.getByRole('button',{name:'Enter 3',exact:true}).isDisabled(),false);
 await tool.getByRole('button',{name:'Enter 2',exact:true}).click();assert.match(await tool.getByRole('alert').textContent(),/misses a clue pip/);assert.equal(await tool.locator('#blind-cell-0 .pip').count(),1);await tool.getByRole('button',{name:'Enter 3',exact:true}).click();assert.equal(await tool.locator('#blind-cell-0 .pip').count(),3);assert.equal(await tool.locator('#blind-cell-0 .clue-pip.pip').count(),1);
 assert.match(await tool.locator('#blind-cell-0').getAttribute('aria-label'),/3 pips entered/);
 await tool.getByRole('button',{name:'Clear cell',exact:true}).click();assert.equal(await tool.locator('#blind-cell-0 .pip').count(),1);
 assert.notEqual(await tool.locator('.completion').textContent(),'Complete!');
 await tool.getByRole('button',{name:'Solve',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.blind-practice .completion')?.textContent==='Complete!');
 await tool.getByRole('button',{name:'Clear solution',exact:true}).click();assert.equal(await tool.locator('#blind-cell-0 .clue-pip.pip').count(),1);
 await tool.locator('#blind-cell-0').press('3');assert.match(await tool.locator('#blind-cell-0').getAttribute('aria-label'),/3 pips entered/);
 await tool.locator('#blind-cell-1').click();await tool.locator('#blind-cell-2').click();assert.equal(await tool.locator('.revealed').count(),2);assert.equal(await tool.locator('#blind-cell-0 .pips').count(),0);
 await page.getByRole('tab',{name:'Flower Sudoku',exact:true}).click();await page.getByRole('tab',{name:'Blind Pips',exact:true}).click();
 await tool.locator('#blind-cell-0').click();assert.match(await tool.locator('#blind-cell-0').getAttribute('aria-label'),/3 pips entered/);
 await page.reload();await tool.waitFor();assert.match(await tool.locator('#blind-cell-0').getAttribute('aria-label'),/3 pips entered/);
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);console.log('Partial pip generation, clue editing, input in clue cells, solving, completion, blindness, autosave and mobile layout verified.');
}finally{await browser.close();}
