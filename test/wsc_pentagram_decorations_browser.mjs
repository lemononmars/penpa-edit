import {chromium} from 'playwright';
import {readFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1280,height:1100}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:5180/wsc2026/');
 if(await page.getByLabel('Password',{exact:true}).count()){await page.getByLabel('Password',{exact:true}).fill('กู้ชาติ');await page.getByRole('button',{name:'Enter',exact:true}).click();}
 await page.getByRole('tab',{name:'Pentagram Sudoku',exact:true}).click();const tool=page.locator('.pentagram-tool');
 await tool.getByRole('button',{name:'● Black dot',exact:true}).click();
 await tool.locator('.decoration-hit').first().focus();await tool.locator('.decoration-hit').first().press('Enter');
 assert.equal(await tool.locator('.black-dot').count(),1);
 await tool.getByRole('button',{name:'○ Number dot',exact:true}).click();await tool.getByLabel('Dot number',{exact:true}).fill('19');
 await tool.locator('.decoration-hit').nth(1).focus();await tool.locator('.decoration-hit').nth(1).press('Enter');
 assert.equal(await tool.locator('.dot-number').textContent(),'19');
 await tool.getByRole('button',{name:'Cage',exact:true}).click();
 await tool.locator('#pentagram-0').click();await tool.locator('#pentagram-1').click();
 await tool.getByLabel('Cage number',{exact:true}).fill('24');await tool.getByRole('button',{name:'Save cage',exact:true}).click();
 assert.equal(await tool.locator('.killer-cage').count(),1);assert.equal(await tool.locator('.cage-number').textContent(),'24');
 assert.ok(await tool.locator('.killer-cage').evaluate(el=>getComputedStyle(el).strokeDasharray!=='none'));
 await tool.getByRole('button',{name:'Solve mode',exact:true}).click();await tool.getByRole('button',{name:'Clear solution',exact:true}).click();assert.equal(await tool.locator('.edge-dot').count(),2);assert.equal(await tool.locator('.killer-cage').count(),1);
 const pending=page.waitForEvent('download');await tool.getByRole('button',{name:'Download puzzle',exact:true}).click();const source=readFileSync(await (await pending).path(),'utf8');
 const exported=await page.evaluate(source=>{const doc=new DOMParser().parseFromString(source,'image/svg+xml');return {dots:doc.querySelectorAll('.edge-dot').length,cages:doc.querySelectorAll('.killer-cage').length,clues:[...doc.querySelectorAll('.decoration-clue')].map(el=>el.textContent),hits:doc.querySelectorAll('.decoration-hit').length};},source);
 assert.deepEqual(exported,{dots:2,cages:1,clues:['24','19'],hits:0});
 await tool.getByRole('button',{name:'Set mode',exact:true}).click();await tool.getByRole('button',{name:'Cage',exact:true}).click();await tool.locator('#pentagram-0').focus();await tool.getByRole('button',{name:'Remove cage',exact:true}).click();assert.equal(await tool.locator('.killer-cage').count(),0);
 await tool.getByRole('button',{name:'Undo',exact:true}).click();assert.equal(await tool.locator('.killer-cage').count(),1);
 mkdirSync('output/screenshots',{recursive:true});await tool.screenshot({path:'output/screenshots/pentagram-decorations.png'});assert.deepEqual(errors,[]);
 console.log('Pentagram edge dots, numbered white dots, connected killer cages, Undo, mode protection and SVG export verified.');
}finally{await browser.close();}
