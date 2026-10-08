import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1400,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5180/wsc2026/?tab=shifted');
 if(await page.getByLabel('Password',{exact:true}).count()){await page.getByLabel('Password',{exact:true}).fill('กู้ชาติ');await page.getByRole('button',{name:'Enter',exact:true}).click();}
 assert.equal(await page.getByRole('link',{name:'Go to Puzzle'}).getAttribute('href'),'/wpc2026/');assert.equal(await page.getByRole('button',{name:'Your profile',exact:true}).count(),0);
 const tool=page.locator('.circular-tool'),grid=await tool.locator('svg').boundingBox(),tabs=await page.getByRole('tablist').boundingBox(),layout=await tool.locator('.layout-controls').boundingBox(),keypad=await tool.locator('.sudoku-keypad').boundingBox(),row=await tool.locator('.practice-layout').boundingBox();
 assert.ok(tabs.y<grid.y);assert.ok(layout.x>grid.x+grid.width&&layout.y<keypad.y);assert.ok(Math.abs(grid.y-row.y)<2);
 await page.getByRole('tab',{name:'Flower Sudoku',exact:true}).click();const flower=page.locator('.flower-tool');assert.ok(Math.abs((await flower.locator('svg').boundingBox()).y-(await flower.locator('.flower-layout').boundingBox()).y)<2);
 await page.getByRole('tab',{name:'Rules & examples',exact:true}).click();await page.getByLabel('Round type',{exact:true}).selectOption('team');assert.deepEqual(await page.getByLabel('Round',{exact:true}).locator('option').evaluateAll(items=>items.slice(1).map(o=>Number(o.value))),[8,9,13,14,15]);assert.equal(await page.locator('.round-section').count(),5);
 await page.getByLabel('Round',{exact:true}).selectOption('15');await page.getByLabel('Round type',{exact:true}).selectOption('individual');assert.equal(await page.getByLabel('Round',{exact:true}).inputValue(),'');assert.equal(await page.locator('.round-section').count(),11);
 assert.deepEqual(errors,[]);console.log('Top tabs, WPC link, anonymous room, grid alignment, right layout controls and round filters passed.');
}finally{await browser.close();}
