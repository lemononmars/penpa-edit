import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true}),page=await browser.newPage({acceptDownloads:true});
try{
 await page.goto('http://127.0.0.1:5180/wsc2026/');
 if(await page.getByLabel('Password',{exact:true}).count()){await page.getByLabel('Password',{exact:true}).fill('กู้ชาติ');await page.getByRole('button',{name:'Enter',exact:true}).click();}
 await page.getByRole('tab',{name:'Shifted Sudoku',exact:true}).click();const tool=page.locator('.circular-tool');
 await tool.getByRole('button',{name:'Add outer ring · 6 grids',exact:true}).click();
 for(const cell of ['core-0-0','core-3-0','core-6-0','outer-0-0']){await tool.locator(`#circular-cell-${cell}`).focus();await tool.locator('.digit-1').click();}
 await tool.getByRole('button',{name:'Add ↘ arrow',exact:true}).click();
 await tool.getByRole('button',{name:'Solve mode',exact:true}).click();
 await tool.locator('#circular-cell-outer-0-1').focus();await tool.locator('.digit-2').click();
 const plan=await page.evaluate(async()=>{const {shiftedPrintPages}=await import('/src/wsc2026/downloadShiftedPdf.mjs');return shiftedPrintPages(document.querySelector('.circular-tool svg'));});
 assert.equal(plan.length,8);assert.equal(plan[6].pieces.length,2);assert.equal(plan[7].pieces.length,1);
 assert.ok(plan[0].pieces[0].svg.includes('given-digit'));assert.ok(!plan[0].pieces[0].svg.includes('>2</text>'));
 mkdirSync('tmp/pdfs',{recursive:true});writeFileSync('tmp/pdfs/shifted-print-plan.json',JSON.stringify(plan));
 const pending=page.waitForEvent('download');await tool.getByRole('button',{name:'Download puzzles · A4 PDF',exact:true}).click();const download=await pending;await download.saveAs('tmp/pdfs/shifted-puzzles.pdf');
 assert.match(await tool.locator('.status').textContent(),/8 A4 pages/);
 console.log('Eight-page PDF downloaded; givens retained, solution digits excluded.');
}finally{await browser.close();}
