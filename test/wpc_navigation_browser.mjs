import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1400,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5180/wpc2026/?page=97');
 assert.equal(await page.locator('header,h1').count(),0);assert.equal(await page.getByRole('link',{name:'Go to Sudoku'}).getAttribute('href'),'/wsc2026/');assert.ok((await page.getByRole('tablist',{name:'WPC 2026 sections'}).boundingBox()).y<80);assert.equal(await page.locator('.page-header .team-badge').textContent(),'TEAM ROUND');assert.equal(await page.locator('.nav-group .team-badge').count(),6);
 await page.getByRole('tab',{name:'Practice',exact:true}).click();assert.equal(await page.getByRole('tablist',{name:'Practice rounds'}).locator('.team-badge').count(),2);
 await page.goto('http://127.0.0.1:5180/wsc2026/');if(await page.getByLabel('Password',{exact:true}).count()){await page.getByLabel('Password',{exact:true}).fill('กู้ชาติ');await page.getByRole('button',{name:'Enter',exact:true}).click();}assert.equal(await page.getByRole('button',{name:'Print / Save PDF',exact:true}).count(),0);assert.equal(await page.locator('.toolbar').getByRole('link',{name:'Open booklet'}).getAttribute('href'),'/wsc2026/WSC2026IB.pdf');assert.equal(await page.getByText('Team rounds: booklet v2',{exact:false}).count(),0);assert.deepEqual(errors,[]);console.log('Compact WPC navigation, team badges, and WSC booklet link passed.');
}finally{await browser.close();}
