import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true}),page=await browser.newPage();
try{
 await page.goto('http://127.0.0.1:5180/wsc2026/?tab=pentagram');
 if(await page.getByLabel('Password',{exact:true}).count()){await page.getByLabel('Password',{exact:true}).fill('กู้ชาติ');await page.getByRole('button',{name:'Enter',exact:true}).click();}
 await page.getByRole('tab',{name:'Pentagram Sudoku',exact:true}).click();
 const tool=page.locator('.pentagram-tool');
 assert.equal(await tool.locator('.cell.related,.cell.selected').count(),0);
 for(const cell of [0,1]){await tool.locator(`#pentagram-${cell}`).focus();await tool.locator('.digit-1').click();}
 assert.ok(await tool.locator('.cell.conflict').count()>0);
 await tool.getByRole('button',{name:'Show conflict: On',exact:true}).click();
 assert.equal(await tool.locator('.cell.conflict').count(),0);
 await tool.getByRole('button',{name:'Show conflict: Off',exact:true}).click();
 assert.ok(await tool.locator('.cell.conflict').count()>0);
 assert.match(await tool.locator('#pentagram-0').getAttribute('aria-label'),/digit 1/);
 console.log('No selection highlights; conflict toggle hides/restores conflicts without changing digits.');
}finally{await browser.close();}

