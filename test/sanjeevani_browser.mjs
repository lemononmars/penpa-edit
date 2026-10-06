import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({args:['--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1500,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5180/wpc2026/?practice=sanjeevani');const tool=page.locator('.sanjeevani');await tool.locator('.bank button').first().waitFor();assert.equal(await tool.locator('.bank button').count(),5);assert.equal(await tool.locator('.stage canvas').count(),1);
 await tool.locator('[data-slot="0"]').click();assert.match(await tool.locator('.progress').textContent(),/1\/5/);await tool.getByRole('button',{name:'Rotate X forwards',exact:true}).click();await tool.getByRole('button',{name:'Return selected cube to bank',exact:true}).click();assert.match(await tool.locator('.progress').textContent(),/0\/5/);
 for(const view of ['Top','Bottom','Front','Right','Back','Left','3D'])await tool.getByRole('group',{name:'Pyramid view'}).getByRole('button',{name:view,exact:true}).click();
 await tool.getByLabel('Separate layers').fill('1');await tool.getByLabel('Visible layers',{exact:true}).selectOption('1');await tool.getByLabel('Visible layers',{exact:true}).selectOption('all');
 for(let i=0;i<5;i++)await tool.getByRole('button',{name:'Hint',exact:true}).click();await tool.getByRole('button',{name:'Check pyramid',exact:true}).click();await tool.getByRole('dialog').waitFor();await tool.getByRole('button',{name:'Continue',exact:true}).click();
 await tool.getByLabel('Pyramid size',{exact:true}).selectOption('3');await page.waitForFunction(()=>document.querySelectorAll('.sanjeevani .bank button').length===14);assert.equal(await tool.locator('[data-slot]').count(),14);await tool.getByRole('button',{name:'Reveal solution',exact:true}).click();await tool.getByRole('button',{name:'Check pyramid',exact:true}).click();await tool.getByRole('dialog').waitFor();await tool.getByRole('button',{name:'Continue',exact:true}).click();
 await page.screenshot({path:'test/sanjeevani-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'test/sanjeevani-mobile.png',fullPage:true});assert.deepEqual(errors,[]);console.log('Three.js rendering, placement, rotations, views, 5/14 cubes, completion, and mobile layout passed.');
}finally{await browser.close();}
