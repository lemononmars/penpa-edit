import {chromium} from 'playwright';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true}),page=await browser.newPage();
try{
 await page.goto('http://127.0.0.1:5180/wsc2026/');
 if(await page.getByLabel('Password',{exact:true}).count()){await page.getByLabel('Password',{exact:true}).fill('กู้ชาติ');await page.getByRole('button',{name:'Enter',exact:true}).click();}
 for(const [tab,filename,count,outer] of [['Flower Sudoku','flower-sudoku.svg',90,false],['Pentagram Sudoku','pentagram-sudoku.svg',80,false],['Shifted Sudoku','shifted-sudoku.svg',81,false],['Shifted Sudoku','circular-sudoku.svg',567,true]]){
  await page.getByRole('tab',{name:tab,exact:true}).click();
  if(outer)await page.getByRole('button',{name:'4 rings · 6 outer grids',exact:true}).click();
  await page.getByRole('button',{name:'Reset',exact:true}).click();
  const board=page.locator('svg[role="group"]').last();
  await page.getByRole('button',{name:'Set mode',exact:true}).click();
  await board.locator('[role="button"]').first().focus();await page.locator('.sudoku-keypad .digit-9').click();
  assert.equal(await board.locator('.given-digit').evaluate(el=>getComputedStyle(el).fill),'rgb(0, 0, 0)');
  await page.getByRole('button',{name:'Solve mode',exact:true}).click();
  await page.locator('.sudoku-keypad .digit-4').click();
  assert.equal(await board.locator('.given-digit').textContent(),'9');
  await board.locator('[role="button"]').nth(1).focus();await page.locator('.sudoku-keypad .digit-4').click();
  assert.equal(await board.locator('.solved-digit').evaluate(el=>getComputedStyle(el).fill),'rgb(36, 105, 191)');
  await page.getByRole('button',{name:'Undo',exact:true}).click();assert.equal(await board.locator('.solved-digit').count(),0);
  await page.locator('.sudoku-keypad .digit-4').click();
  if(tab==='Shifted Sudoku'){
   await page.getByRole('button',{name:'Set mode',exact:true}).click();
   await page.getByRole('button',{name:'Add ↗ arrow',exact:true}).click();
   assert.equal(await board.locator('.diagonal-arrow').count(),1);
   await page.getByRole('button',{name:'Add → arrow',exact:true}).click();
   assert.equal(await board.locator('.diagonal-arrow').count(),1);
   assert.match(await board.locator('.arrow-mark:not(.diagonal-arrow)').getAttribute('d'),/^M-4,-7 L4,-7/);
   await page.getByRole('button',{name:'Add ↓ arrow',exact:true}).click();
   assert.equal(await board.locator('.arrow-mark:not(.diagonal-arrow)').count(),2);
   await page.getByRole('button',{name:'Add ↖ arrow',exact:true}).click();
   assert.equal(await board.locator('.diagonal-arrow').count(),1);
   assert.equal(await board.locator('.arrow-mark:not(.diagonal-arrow)').count(),2);
   await page.getByRole('button',{name:'Add ↖ arrow',exact:true}).click();
   assert.equal(await board.locator('.diagonal-arrow').count(),0);
   await page.getByRole('button',{name:'Add ↓ arrow',exact:true}).click();
   assert.equal(await board.locator('.arrow-mark').count(),1);
   assert.equal(await page.getByRole('button',{name:'Add → arrow',exact:true}).evaluate(el=>getComputedStyle(el).color),'rgb(0, 0, 0)');
   assert.equal(await page.getByRole('button',{name:'Add ↖ arrow',exact:true}).evaluate(el=>getComputedStyle(el).color),'rgb(153, 153, 153)');
   await page.getByRole('button',{name:'Remove arrow',exact:true}).click();
   assert.equal(await board.locator('.arrow-mark').count(),0);
   await page.getByRole('button',{name:'Undo',exact:true}).click();
   assert.equal(await board.locator('.arrow-mark').count(),1);
   await page.getByRole('button',{name:'Solve mode',exact:true}).click();
   assert.ok(await page.getByRole('button',{name:'Add → arrow',exact:true}).isDisabled());
  }
  const before=await board.innerHTML();
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download puzzle',exact:true}).click();const download=await pending;
  assert.equal(download.suggestedFilename(),filename.replace('.svg','-puzzle.svg'));
  const source=readFileSync(await download.path(),'utf8');
  const details=await page.evaluate(source=>{const doc=new DOMParser().parseFromString(source,'image/svg+xml');return {errors:doc.querySelectorAll('parsererror').length,cells:doc.querySelectorAll('.cell,.sudoku-cell').length,digits:doc.querySelectorAll('text:not(.grid-letter)').length,givens:doc.querySelector('.given-digit')?.textContent,white:[...doc.querySelectorAll('.cell,.sudoku-cell')].every(cell=>cell.style.fill==='rgb(255, 255, 255)'),interactive:doc.querySelectorAll('[tabindex],[role],[aria-label]').length,strokes:[...doc.querySelectorAll('path,line,circle')].some(el=>el.style.stroke!=='none'&&parseFloat(el.style.strokeWidth)>0)};},source);
  assert.deepEqual(details,{errors:0,cells:count,digits:1,givens:'9',white:true,interactive:0,strokes:true});
  const solutionPending=page.waitForEvent('download');await page.getByRole('button',{name:'Download solution',exact:true}).click();const solutionDownload=await solutionPending;
  assert.equal(solutionDownload.suggestedFilename(),filename.replace('.svg','-solution.svg'));
  if(tab==='Shifted Sudoku')assert.equal(await page.evaluate(source=>new DOMParser().parseFromString(source,'image/svg+xml').querySelectorAll('.arrow-mark').length,source),1);
  const solutionSource=readFileSync(await solutionDownload.path(),'utf8');
  const solutionDetails=await page.evaluate(source=>{const doc=new DOMParser().parseFromString(source,'image/svg+xml');return {given:doc.querySelector('.given-digit')?.textContent,answer:doc.querySelector('.solved-digit')?.textContent,black:doc.querySelector('.given-digit')?.style.fill,blue:doc.querySelector('.solved-digit')?.style.fill,notes:doc.querySelectorAll('.notes,.note').length};},solutionSource);
  assert.deepEqual(solutionDetails,{given:'9',answer:'4',black:'rgb(0, 0, 0)',blue:'rgb(36, 105, 191)',notes:0});
  if(tab==='Shifted Sudoku'){
   const dimensions=await page.evaluate(source=>{const svg=new DOMParser().parseFromString(source,'image/svg+xml').documentElement,scale=Number(svg.getAttribute('data-units-per-cm'));return {width:svg.getAttribute('width'),hub:Number(svg.querySelector('.hub').getAttribute('r'))/scale,outer:Math.max(...[...svg.querySelectorAll('.grid-circle')].map(circle=>Number(circle.getAttribute('r'))))/scale};},source);
   assert.deepEqual(dimensions,{width:outer?'42cm':'20.8cm',hub:1,outer:outer?20:10});
  }
  assert.equal(await board.innerHTML(),before);
  await page.getByRole('button',{name:'Clear solution',exact:true}).click();
  assert.equal(await board.locator('.given-digit').textContent(),'9');
  assert.equal(await board.locator('.solved-digit').count(),0);
  await page.getByRole('button',{name:'Undo',exact:true}).click();
  assert.equal(await board.locator('.solved-digit').textContent(),'4');
 }
 console.log('Puzzle and solution SVG downloads verified for all four layouts; black givens, blue answers and editor state preserved.');
}finally{await browser.close();}
