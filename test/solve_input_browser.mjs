import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1400,height:1000}});
 await page.goto('http://127.0.0.1:5180/');
 await page.waitForFunction(()=>window.pu);
 await page.keyboard.press('F3');
 await page.evaluate(()=>{pu.selection=[pu.centerlist[0]];pu.cursol=pu.centerlist[0];});
 await page.keyboard.press('a');
 assert.equal(await page.evaluate(()=>Object.keys(pu.pu_a.number).length),0,'Letters must not enter Sudoku answers');
 await page.evaluate(()=>pu.key_number('b',true));
 assert.equal(await page.evaluate(()=>Object.keys(pu.pu_a.number).length),0,'Direct answer entry must reject letters too');
 const active=async mode=>{await page.waitForFunction(mode=>[...document.querySelectorAll('.sudoku-keypad')].some(k=>k.offsetWidth&&k.querySelector(`.mode-${mode}.active`)),mode);};
 for(const [key,mode] of [['x','center'],['c','corner'],['z','normal']]){await page.keyboard.press(key);await active(mode);}
 const keypad=page.locator('.sudoku-keypad:visible').first();
 for(const mode of ['center','corner','normal']){await keypad.locator(`.mode-${mode}`).click();await active(mode);}
 await page.keyboard.down('Shift');await active('corner');await page.keyboard.up('Shift');await active('normal');
 await page.keyboard.down('Control');await active('center');await page.keyboard.up('Control');await active('normal');
 await page.keyboard.press('4');assert.equal(await page.evaluate(()=>pu.pu_a.number[pu.centerlist[0]][0]),'4');
 console.log('Sudoku letters, mode shortcuts and held-key highlights passed.');
}finally{await browser.close();}
