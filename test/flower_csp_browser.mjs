import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5180/wsc2026/?tab=flower');
 if(await page.getByLabel('Password',{exact:true}).count()){await page.getByLabel('Password',{exact:true}).fill('กู้ชาติ');await page.getByRole('button',{name:'Enter',exact:true}).click();}
 const tool=page.locator('.flower-tool');await tool.getByRole('button',{name:'Reset',exact:true}).click();
 await page.evaluate(()=>{window.NativeWorker=Worker;window.Worker=class{constructor(url){window.analysisWorker=this;this.url=url;}postMessage(data){this.data=data;}terminate(){this.stopped=true;}};});
 await tool.getByRole('button',{name:'Solve',exact:true}).click();await tool.getByRole('button',{name:'Stop',exact:true}).waitFor();
 await page.waitForTimeout(1100);assert.match(await tool.locator('.search-status').textContent(),/Solving… 1s/);
 assert.match(await page.evaluate(()=>analysisWorker.url),/sudoku_solver_worker_bundle/);
 await tool.getByRole('button',{name:'Stop',exact:true}).click();assert.equal(await page.evaluate(()=>analysisWorker.stopped),true);assert.equal(await tool.locator('.notes').count(),0);
 await page.evaluate(()=>window.Worker=NativeWorker);
 await tool.getByRole('button',{name:'Random solution',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.flower-tool .status').textContent.includes('Complete'));
 await tool.locator('#flower-cell-0').focus();await tool.getByRole('button',{name:'Delete selected cell'}).click();
 await tool.getByRole('button',{name:'Solve',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.flower-tool .status').textContent.includes('Complete'));
 assert.equal(await tool.locator('svg .digit').count(),90);assert.equal(await tool.locator('svg .notes').count(),0);
 assert.equal(await tool.getByRole('button',{name:'Set mode',exact:true}).getAttribute('aria-pressed'),'true');
 assert.equal(await tool.locator('svg .solved-digit').count(),90,'Solver digits must remain answers even in Set mode');
 console.log('Flower exact CSP pencilmarks, elapsed timer and Stop passed.');
}finally{await browser.close();}
