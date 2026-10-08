import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1400,height:1000}});await page.goto('http://127.0.0.1:5180/wpc2026/?practice=laxman');await page.locator('.board .square').first().waitFor({timeout:120000});
 const endpoints=await page.locator('.board').evaluate(svg=>{const clue=svg.querySelector('.square'),x=Number(clue.getAttribute('x'))+8,y=Number(clue.getAttribute('y'))+8,horizontal=Math.abs((y-35)/54-Math.round((y-35)/54))<.01;return [-1,1].map(sign=>{const p=svg.createSVGPoint();p.x=x+(horizontal?sign*27:0);p.y=y+(horizontal?0:sign*27);const s=p.matrixTransform(svg.getScreenCTM());return {x:s.x,y:s.y};});});
 await page.mouse.move(endpoints[0].x,endpoints[0].y);await page.mouse.down();await page.mouse.move(endpoints[1].x,endpoints[1].y,{steps:8});await page.mouse.up();assert.equal(await page.locator('.board .answer').count(),0,'Parallel square edge must stay unused');console.log('Parallel square blocks a loop segment on its edge.');
}finally{await browser.close();}
