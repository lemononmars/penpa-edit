import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true}),page=await browser.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:5180/wsc2026/');
 if(await page.getByLabel('Password',{exact:true}).count()){await page.getByLabel('Password',{exact:true}).fill('กู้ชาติ');await page.getByRole('button',{name:'Enter',exact:true}).click();}
 assert.equal(await page.locator('.blind-practice').count(),0);assert.ok(await page.getByRole('link',{name:'Open Blind Pips practice ↗',exact:true}).count());await page.getByRole('tab',{name:'Blind Pips',exact:true}).click();const blind=page.locator('.blind-practice');
 await blind.locator('.blind-grid').waitFor();await page.waitForFunction(()=>document.querySelector('.blind-practice .completion')?.textContent.includes('Generated a unique'));const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('wsc2026-tool-blind')).state);
 await page.getByRole('tab',{name:'Hundred Combinations',exact:true}).click();const hundred=page.locator('.hundred-tool');await hundred.getByRole('searchbox').fill('24');
 await page.getByRole('tab',{name:'Rules & examples',exact:true}).click();
 assert.equal(await page.locator('.blind-practice').count(),0);await page.getByRole('tab',{name:'Blind Pips',exact:true}).click();await blind.locator('.blind-grid').waitFor();assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('wsc2026-tool-blind')).state.clues),saved.clues);await page.reload();await blind.locator('.blind-grid').waitFor();assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('wsc2026-tool-blind')).state.clues),saved.clues);
 await page.getByRole('tab',{name:'Hundred Combinations',exact:true}).click();assert.equal(await hundred.getByRole('searchbox').inputValue(),'24');
 await page.reload();await hundred.waitFor();assert.equal(await hundred.getByRole('searchbox').inputValue(),'24');
 assert.deepEqual(errors,[]);console.log('Blind puzzle and Hundred Combinations filters survive tab changes and refresh.');
}finally{await browser.close();}
