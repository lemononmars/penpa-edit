import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({acceptDownloads:true});await page.goto('http://127.0.0.1:5180/wsc2026/?tab=flower');
 if(await page.getByLabel('Password',{exact:true}).count()){await page.getByLabel('Password',{exact:true}).fill('กู้ชาติ');await page.getByRole('button',{name:'Enter',exact:true}).click();}
 const tool=page.locator('.flower-tool');await tool.getByRole('button',{name:'Reset',exact:true}).click();
 await tool.getByRole('button',{name:'Set mode',exact:true}).click();await tool.locator('#flower-cell-0').focus();await tool.locator('.digit-1').click();
 await tool.getByRole('button',{name:'Solve mode',exact:true}).click();await tool.locator('#flower-cell-1').focus();await tool.locator('.digit-2').click();
 await tool.locator('#flower-cell-1').evaluate(cell=>cell.classList.add('multi-selected'));
 const exported=await page.evaluate(async()=>{const {puzzleSvg}=await import('/src/wsc2026/downloadSudokuSvg.mjs');const svg=new DOMParser().parseFromString(puzzleSvg(document.querySelector('.flower-tool svg'),true),'image/svg+xml');return [...svg.querySelectorAll('.cell')].map(cell=>({fill:cell.style.getPropertyValue('fill'),priority:cell.style.getPropertyPriority('fill'),selected:cell.classList.contains('multi-selected')}));});
 assert.ok(exported.every(cell=>['#fff','rgb(255, 255, 255)'].includes(cell.fill)&&cell.priority==='important'&&!cell.selected));
 mkdirSync('tmp/pdfs',{recursive:true});
 for(const kind of ['puzzle','solution']){
  const pending=page.waitForEvent('download');await tool.getByRole('button',{name:`Download ${kind} · ${kind==='solution'?'PNG':'A4 PDF'}`,exact:true}).click();const download=await pending;
  assert.equal(download.suggestedFilename(),kind==='solution'?'flower-sudoku-solution.png':'flower-sudoku-puzzle-a4.pdf');await download.saveAs(`tmp/pdfs/flower-${kind}.${kind==='solution'?'png':'pdf'}`);
 }
 await page.getByRole('tab',{name:'Pentagram Sudoku',exact:true}).click();
 const pentagram=page.locator('.pentagram-tool');await pentagram.getByRole('button',{name:'Reset',exact:true}).click();
 await pentagram.getByRole('button',{name:'Set mode',exact:true}).click();await pentagram.locator('#pentagram-0').focus();await pentagram.locator('.digit-1').click();
 await pentagram.getByRole('button',{name:'Solve mode',exact:true}).click();await pentagram.locator('#pentagram-1').focus();await pentagram.locator('.digit-2').click();
 await pentagram.getByRole('button',{name:'Set mode',exact:true}).click();
 await pentagram.getByRole('button',{name:'● Black dot',exact:true}).click();await pentagram.locator('.decoration-hit').first().click();
 await pentagram.getByLabel('Pentagram genre').selectOption('arithmetic');await pentagram.getByRole('button',{name:'○ Number dot',exact:true}).click();await pentagram.getByRole('textbox').first().fill('12');await pentagram.locator('.decoration-hit').nth(1).click();
 assert.equal(await pentagram.locator('.edge-dot').count(),1);
 await pentagram.getByLabel('Pentagram genre').selectOption('perfect');assert.equal(await pentagram.locator('.edge-dot').count(),1);assert.equal(await pentagram.locator('.direction-arrow').count(),5);
 const directions=await pentagram.locator('.direction-arrow').evaluateAll(paths=>paths.map(path=>{const first=path.getPointAtLength(0),last=path.getPointAtLength(path.getTotalLength());return {dx:last.x-first.x,dy:last.y-first.y};}));
 assert.ok(directions[2].dx>0,'Bottom arrow reads left to right');assert.ok(directions[3].dy>0,'Left arrow reads top to bottom');
 assert.equal(await pentagram.getByRole('button',{name:/Show arrows/}).count(),0);
 const perfectBox=await pentagram.locator('svg').getAttribute('viewBox');await pentagram.getByLabel('Pentagram genre').selectOption('division');assert.equal(await pentagram.locator('svg').getAttribute('viewBox'),perfectBox);assert.equal(await pentagram.locator('.direction-arrow').count(),0);assert.equal(await pentagram.locator('.edge-dot').count(),1);assert.equal(await pentagram.locator('.black-dot').count(),0);
 await pentagram.getByLabel('Pentagram genre').selectOption('product');
 await pentagram.getByRole('button',{name:'Cage',exact:true}).click();
 for(const [cell,clue] of [[0,'123'],[16,'24'],[32,'144'],[48,'72'],[64,'216']]){
  await pentagram.locator(`#pentagram-${cell}`).click();await pentagram.getByLabel('Cage number',{exact:true}).fill(clue);await pentagram.getByRole('button',{name:'Save cage',exact:true}).click();
 }
 assert.equal(await pentagram.locator('.cage-number').count(),5);
 for(const [label,file] of [['Download puzzle · A4 PDF','product-killer.pdf'],['Download solution · PNG','product-killer.png']]){
  const pending=page.waitForEvent('download');await pentagram.getByRole('button',{name:label,exact:true}).click();await (await pending).saveAs(`tmp/pdfs/${file}`);
 }
 console.log('Product Killer cage clues exported in PDF and PNG across all five petals.');
}finally{await browser.close();}
