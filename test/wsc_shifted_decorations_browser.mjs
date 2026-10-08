import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true}),page=await browser.newPage();
try{
 await page.goto('http://127.0.0.1:5180/wsc2026/');
 if(await page.getByLabel('Password',{exact:true}).count()){await page.getByLabel('Password',{exact:true}).fill('กู้ชาติ');await page.getByRole('button',{name:'Enter',exact:true}).click();}
 await page.getByRole('tab',{name:'Shifted Sudoku',exact:true}).click();const tool=page.locator('.circular-tool');
 await tool.getByRole('button',{name:'4 rings · 6 outer grids',exact:true}).click();
 assert.equal(await tool.getByLabel('Outer-grid rule',{exact:true}).count(),0);
 assert.equal(await tool.getByRole('group',{name:'Black orthogonal arrows',exact:true}).getByRole('button').count(),4);
 assert.equal(await tool.getByRole('group',{name:'Gray diagonal arrows',exact:true}).getByRole('button').count(),4);
 await tool.locator('#circular-cell-outer-0-0').focus();await tool.locator('.digit-1').click();await tool.getByRole('button',{name:'Add ↖ arrow',exact:true}).click();
 assert.equal(await tool.locator('.diagonal-arrow').count(),1);
 await tool.getByRole('button',{name:'Solve',exact:true}).click();
 assert.match(await tool.locator('.status').textContent(),/Solved/);
 assert.equal(await tool.locator('.diagonal-arrow').count(),1);
 console.log('Shifted arrows remain decorative: off-grid arrow does not prevent solving.');
}finally{await browser.close();}
