import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1400,height:1000},acceptDownloads:true});
 await page.goto('http://127.0.0.1:5180/wsc2026/?tab=flower');
 if(await page.getByLabel('Password',{exact:true}).count()){await page.getByLabel('Password',{exact:true}).fill('กู้ชาติ');await page.getByRole('button',{name:'Enter',exact:true}).click();}
 const overview=page.locator('.overview');await overview.locator('svg > svg').first().waitFor();
 assert.equal(await overview.locator('svg > svg').count(),6);
 assert.equal(await overview.locator('svg > line').count(),10);
 assert.equal(await overview.locator('svg > text').count(),5);
 await overview.locator('[data-board="2"][data-cell="0"]').click();
 const tool=page.locator('.pentagram-tool:visible');
 assert.equal(await tool.getByLabel('Pentagram genre').inputValue(),'arithmetic');
 await tool.getByRole('button',{name:'Set mode',exact:true}).click();await tool.locator('.digit-3').click();
 await page.getByRole('tab',{name:'1. Perfect Squares Sudoku',exact:true}).click();
 assert.equal(await page.locator('.pentagram-tool:visible').getByLabel('Pentagram genre').inputValue(),'perfect');
 mkdirSync('tmp/pdfs',{recursive:true});
 await page.getByRole('tab',{name:'Whole puzzle',exact:true}).click();
 await page.getByLabel('Variant at position 2',{exact:true}).selectOption('4');
 assert.equal(await page.getByLabel('Variant at position 5',{exact:true}).inputValue(),'1');
 assert.match(await overview.locator('svg > text').nth(1).textContent(),/Killer Sudoku/);
 await page.getByLabel('Variant at position 2',{exact:true}).selectOption('1');
 await overview.screenshot({path:'tmp/pdfs/flower-round.png'});
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download puzzles & solution · A4 PDF',exact:true}).click();
 const download=await pending;await download.saveAs('tmp/pdfs/flower-round.pdf');
 assert.equal(download.suggestedFilename(),'round-9-flower-puzzles-and-solution.pdf');
 console.log('Combined round layout, board switching, independent genres, and PDF export passed.');
}finally{await browser.close();}
