import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const browser=await chromium.launch({headless:true}),page=await browser.newPage({acceptDownloads:true});
try{
 await page.goto('http://127.0.0.1:5180/wsc2026/');
 if(await page.getByLabel('Password',{exact:true}).count()){await page.getByLabel('Password',{exact:true}).fill('กู้ชาติ');await page.getByRole('button',{name:'Enter',exact:true}).click();}
 await page.getByRole('tab',{name:'Shifted Sudoku',exact:true}).click();const tool=page.locator('.circular-tool');
 await tool.getByRole('button',{name:'4 rings · 6 outer grids',exact:true}).click();
 for(const cell of ['core-0-0','core-3-0','core-6-0','outer-0-0']){await tool.locator(`#circular-cell-${cell}`).focus();await tool.locator('.digit-1').click();}
 await tool.getByRole('button',{name:'Add ↘ arrow',exact:true}).click();
 await tool.getByRole('button',{name:'Solve mode',exact:true}).click();
 await tool.locator('#circular-cell-outer-0-1').focus();await tool.locator('.digit-2').click();
 await tool.getByRole('tab',{name:'Pointing Digits · B',exact:true}).click();
 await tool.getByRole('button',{name:'Set mode',exact:true}).click();await tool.locator('#variant-circular-cell-outer-1-10').focus();await tool.locator('.digit-4').click();
 await tool.getByLabel('Pointing Digits grid matching',{exact:true}).selectOption('3');
 assert.equal(await tool.getByLabel('Point to Next grid matching',{exact:true}).inputValue(),'1');
 await tool.getByRole('tab',{name:'Whole puzzle',exact:true}).click();
 assert.equal(await tool.locator('#circular-cell-outer-1-10').getAttribute('aria-label'),'Grid B, row 2, cell 2, digit 4');
 assert.equal(await tool.locator('.grid-letter').count(),6);
 const plan=await page.evaluate(async()=>{const {shiftedPrintPages}=await import('/src/wsc2026/downloadShiftedPdf.mjs');return shiftedPrintPages(document.querySelector('.circular-tool svg'));});
 assert.equal(plan.length,8);assert.equal(plan[6].pieces.length,2);assert.equal(plan[7].pieces.length,1);
 assert.ok(plan[0].pieces[0].svg.includes('given-digit'));assert.ok(!plan[0].pieces[0].svg.includes('>2</text>'));
 for(const page of plan)for(const piece of page.pieces){assert.ok(piece.svg.includes('dominant-baseline: alphabetic'));}
 assert.ok(!plan[7].pieces[0].svg.includes('connector-spoke'),'Ring 3 must not retain clipped spoke tips');
 mkdirSync('tmp/pdfs',{recursive:true});writeFileSync('tmp/pdfs/shifted-print-plan.json',JSON.stringify(plan));
 const pending=page.waitForEvent('download');await tool.getByRole('button',{name:'Download puzzles & solution · A4 PDF',exact:true}).click();const download=await pending;await download.saveAs('tmp/pdfs/shifted-puzzles.pdf');
 assert.match(await tool.locator('.status').textContent(),/10 A4 pages/);
 assert.equal(await tool.getByRole('button',{name:/^Download/}).count(),1);
 assert.equal(await page.getByRole('tab',{name:'Pentagram Sudoku',exact:true}).count(),0);
 const {execFileSync}=await import('node:child_process');
 const text=execFileSync('pdftotext',['-f','9','-l','10','tmp/pdfs/shifted-puzzles.pdf','-'],{encoding:'utf8'});
 const [puzzle,solution]=text.split('\f');
 assert.ok(!puzzle.includes('Skyscraper')&&!puzzle.includes('Pointing Digits'));
 assert.ok(solution.includes('Solution')&&solution.replace(/\s/g,'').includes('Digits'));
 console.log('Combined ten-page PDF downloaded; printable puzzle parts followed by solution.');
}finally{await browser.close();}
