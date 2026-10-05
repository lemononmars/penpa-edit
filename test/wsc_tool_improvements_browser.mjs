import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,readFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true}),page=await browser.newPage({acceptDownloads:true,viewport:{width:1280,height:1000}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
async function tab(name){await page.getByRole('tab',{name,exact:true}).click();}
try{
 await page.goto('http://127.0.0.1:5180/wsc2026/?tab=flower');
 if(await page.getByLabel('Password',{exact:true}).count()){await page.getByLabel('Password',{exact:true}).fill('กู้ชาติ');await page.getByRole('button',{name:'Enter',exact:true}).click();}
 const flower=page.locator('.flower-tool');await flower.waitFor();
 await flower.locator('#flower-cell-0').focus();await flower.locator('.digit-1').click();
 await tab('Pentagram Sudoku');await tab('Flower Sudoku');assert.match(await flower.locator('#flower-cell-0').getAttribute('aria-label'),/digit 1/);
 await page.reload();await flower.waitFor();assert.match(await flower.locator('#flower-cell-0').getAttribute('aria-label'),/digit 1/);
 let pending=page.waitForEvent('download');await flower.getByRole('button',{name:'Export backup',exact:true}).click();let download=await pending;mkdirSync('tmp/backups',{recursive:true});await download.saveAs('tmp/backups/flower.json');
 await flower.getByRole('button',{name:'Clear board',exact:true}).click();await flower.getByLabel('Import puzzle backup',{exact:true}).setInputFiles('tmp/backups/flower.json');await page.waitForFunction(()=>document.querySelector('#flower-cell-0')?.getAttribute('aria-label')?.includes('digit 1'));
 await flower.getByLabel('Import puzzle backup',{exact:true}).setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"version":1,"tool":"flower","state":{}}')});await page.waitForFunction(()=>document.querySelector('.flower-tool .status')?.textContent.includes('invalid'));assert.match(await flower.locator('#flower-cell-0').getAttribute('aria-label'),/digit 1/);
 await flower.getByRole('button',{name:'Solve',exact:true}).click();console.log('Solve requested',await flower.locator('.status').textContent());await page.waitForFunction(()=>document.querySelectorAll('.flower-tool svg .digit').length===90);assert.equal(await flower.locator('.status').textContent(),'Complete');assert.equal(await flower.locator('.given-digit').count(),1);
 await flower.locator('#flower-cell-1').focus();await flower.getByRole('button',{name:'Delete selected cell',exact:true}).click();assert.equal(await flower.locator('svg .digit').count(),89);
 await flower.getByRole('button',{name:'Clear solution',exact:true}).click();assert.equal(await flower.locator('svg .digit').count(),1);
 await flower.getByRole('button',{name:'Generate unique puzzle',exact:true}).click();await flower.getByRole('button',{name:'Cancel search',exact:true}).click();assert.equal(await flower.locator('svg .digit').count(),1);await page.waitForTimeout(300);assert.equal(await flower.locator('svg .digit').count(),1);
 await tab('Pentagram Sudoku');const pent=page.locator('.pentagram-tool');assert.equal(await pent.locator('.selection-outline').count(),1);
 const first=await pent.locator('.selection-outline').getAttribute('d');await pent.locator('#pentagram-1').focus();assert.notEqual(await pent.locator('.selection-outline').getAttribute('d'),first);
 await pent.getByRole('button',{name:'Solve',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.pentagram-tool svg .digit').length===80);assert.equal(await pent.locator('.status').textContent(),'Complete');
 await pent.locator('#pentagram-1').focus();await pent.getByRole('button',{name:'Delete selected cell',exact:true}).click();assert.equal(await pent.locator('svg .digit').count(),79);
 await tab('Shifted Sudoku');const shifted=page.locator('.circular-tool');await shifted.getByRole('button',{name:'Add outer ring · 6 grids',exact:true}).click();
 await shifted.locator('#circular-cell-outer-0-0').focus();await shifted.locator('.digit-4').click();await shifted.getByRole('button',{name:'Add ↘ arrow',exact:true}).click();
 await shifted.getByRole('button',{name:'Rotate selected ring clockwise one orientation',exact:true}).click();
 await tab('Flower Sudoku');await tab('Shifted Sudoku');assert.equal(await shifted.locator('.outer-cell').count(),486);assert.match(await shifted.locator('#circular-cell-outer-0-0').getAttribute('aria-label'),/digit 4/);assert.equal(await shifted.locator('.diagonal-arrow').count(),1);
 await shifted.getByLabel('PDF scale',{exact:true}).selectOption('fit');await shifted.getByRole('button',{name:'Preview print pages',exact:true}).click();const dialog=page.getByRole('dialog');assert.equal(await dialog.locator('.paper').count(),8);assert.match(await dialog.textContent(),/93.1%/);await dialog.getByRole('button',{name:'Close preview',exact:true}).click();
 pending=page.waitForEvent('download');await shifted.getByRole('button',{name:'Download puzzles · A4 PDF',exact:true}).click();download=await pending;await download.saveAs('tmp/pdfs/shifted-fit-vector.pdf');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('wsc2026-tool-shifted')));assert.equal(saved.state.rotations[3],1);assert.equal(saved.state.arrows['circular-cell-outer-0-0'].length,1);
 assert.deepEqual(errors,[]);console.log('Autosave, refresh, JSON backups, validation, filled solutions, cancellation, selection outline and vector PDF preview verified.');
}catch(e){console.log('Statuses:',await page.locator('.status').allTextContents(),'Errors:',errors);throw e;}finally{await browser.close();}
