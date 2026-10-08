import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1400,height:1100},acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5180/wsc2026/');
 if(await page.getByLabel('Password',{exact:true}).count()){await page.getByLabel('Password',{exact:true}).fill('กู้ชาติ');await page.getByRole('button',{name:'Enter',exact:true}).click();}
 await page.getByRole('tab',{name:'Shifted Sudoku',exact:true}).click();const tool=page.locator('.circular-tool');
 for(const [row,digit] of [[0,1],[3,2],[6,3]]){await tool.locator(`#circular-cell-core-${row}-0`).focus();await tool.locator(`.digit-${digit}`).click();}
 await tool.getByRole('button',{name:'9×9 square',exact:true}).click();assert.equal(await tool.locator('.square-cell').count(),81);
 await tool.locator('#circular-cell-core-3-0').focus();await tool.getByRole('button',{name:'Shift selected band right one column',exact:true}).click();await page.waitForTimeout(220);
 const xs=await tool.locator('.square-cell').evaluateAll(cells=>[0,3,4,5,6].map(row=>Number(cells.find(c=>c.id===`circular-cell-core-${row}-0`).getAttribute('d').match(/^M([\d.]+)/)[1])));assert.deepEqual(xs,[20,64,64,64,20]);
 await tool.getByRole('button',{name:'Rings',exact:true}).click();assert.equal(await tool.locator('.given-digit').count(),3);await tool.getByRole('button',{name:'9×9 square',exact:true}).click();assert.equal(await tool.locator('.given-digit').count(),3);
 await tool.getByRole('button',{name:'Shift selected band left one column',exact:true}).click();await page.waitForTimeout(220);await tool.getByRole('button',{name:'Shift selected band left one column',exact:true}).click();await page.waitForTimeout(220);
 await tool.locator('#circular-cell-core-3-0').focus();await tool.locator('.digit-9').click();assert.equal(await tool.locator('.given-digit').allTextContents().then(a=>a.includes('9')),true);
 const svg=tool.getByRole('group',{name:'Square shifted Sudoku board'}),box=await svg.boundingBox(),scale=box.width/436;
 await page.mouse.move(box.x+394*scale,box.y+174*scale);await page.mouse.down({button:'right'});await page.mouse.move(box.x+438*scale,box.y+174*scale,{steps:5});await page.mouse.up({button:'right'});await page.waitForTimeout(250);
 assert.equal(Number((await tool.locator('#circular-cell-core-3-0').getAttribute('d')).match(/^M([\d.]+)/)[1]),20);
 await tool.locator('#circular-cell-core-3-0').focus();await page.keyboard.press('ArrowUp');assert.equal(await page.evaluate(()=>document.activeElement.id),'circular-cell-core-2-0');
 const exported=await page.evaluate(async()=>{const {puzzleSvg}=await import('/src/wsc2026/downloadSudokuSvg.mjs');return puzzleSvg(document.querySelector('.circular-tool svg'));});assert.ok(exported.includes('id="shifted-square-clip"'));assert.ok(exported.includes('clip-path="url(#shifted-square-clip)"'));
 assert.ok(await tool.getByRole('button',{name:'Generate unique puzzle',exact:true}).isVisible());assert.ok(await tool.getByRole('button',{name:'Solve',exact:true}).isVisible());
 const pending=page.waitForEvent('download');await tool.getByRole('button',{name:'Download puzzles · A4 PDF',exact:true}).click();assert.match((await pending).suggestedFilename(),/square/);
 await tool.getByRole('button',{name:'Generate unique puzzle',exact:true}).click();await tool.locator('.status').filter({hasText:'Generated a uniquely solvable puzzle'}).waitFor({timeout:120000});
 assert.ok(await tool.locator('.given-digit').count()<81);await tool.getByRole('button',{name:'Solve',exact:true}).click();await tool.locator('.status').filter({hasText:'Solved after checking'}).waitFor({timeout:120000});await page.waitForTimeout(550);assert.equal(await tool.locator('.given-digit,.solved-digit').count(),81);
 assert.deepEqual(errors,[]);console.log('Square layout, shared digits, band wrapping, drag, navigation, export, PDF, generation and solving passed.');
}finally{await browser.close();}
