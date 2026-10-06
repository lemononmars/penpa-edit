import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1600,height:1600}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5180/wpc2026/?practice=vibhishana');
 const tool=page.locator('.practice');
 const first=tool.locator('.puzzle-card').first();
 await first.locator('svg').waitFor();
 await tool.getByRole('checkbox',{name:'Reveal solution'}).check();
 assert.equal(await tool.locator('.puzzle-card').count(),4);
 assert.equal(await tool.locator('.rule-card svg[role=img]').count(),4);
 assert.equal(await tool.getByLabel('Grid size').inputValue(),'6');
 const traitor=Number((await first.locator('.puzzle-actions').textContent()).match(/Traitor: Rule (\d)/)[1]);
 const lines=await first.locator('line.answer').evaluateAll(lines=>lines.map(el=>['x1','y1','x2','y2'].map(k=>Number(el.getAttribute(k)))));
 await tool.getByRole('checkbox',{name:'Reveal solution'}).uncheck();
 const svg=first.locator('svg');await svg.scrollIntoViewIfNeeded();
 const box=await svg.boundingBox(),view=await svg.getAttribute('viewBox'),scale=box.width/Number(view.split(' ')[2]);
 const [ax,ay,bx,by]=lines[0];await page.mouse.click(box.x+(ax+bx)/2*scale,box.y+(ay+by)/2*scale,{button:'right'});assert.equal(await first.locator('.edge-cross').count(),1);
 for(const [x1,y1,x2,y2] of lines){await page.mouse.move(box.x+x1*scale,box.y+y1*scale);await page.mouse.down();await page.mouse.move(box.x+x2*scale,box.y+y2*scale,{steps:3});await page.mouse.up();}
 assert.equal(await first.locator('.edge-cross').count(),0);
 await first.getByRole('button',{name:'Rule '+traitor,exact:true}).click();
 await first.getByRole('button',{name:'Check puzzle',exact:true}).click();
 await tool.getByRole('dialog').waitFor();
 await tool.getByRole('button',{name:'Continue',exact:true}).click();
 assert.match(await first.locator('h3').textContent(),/✓/);
 const second=tool.locator('.puzzle-card').nth(1);
 await second.getByRole('button',{name:'Rule 1',exact:true}).click();
 assert.equal(await second.getByRole('button',{name:'Rule 1',exact:true}).getAttribute('aria-pressed'),'true');
 assert.equal(await first.getByRole('button',{name:'Rule '+traitor,exact:true}).getAttribute('aria-pressed'),'true');
 await tool.getByLabel('Grid size').selectOption('8');
 await page.waitForFunction(()=>!document.querySelector('.practice .controls select').disabled,null,{timeout:120000});
 await page.waitForFunction(()=>document.querySelector('.practice .puzzle-card svg')?.getAttribute('viewBox')?.split(' ')[2]==='544',null,{timeout:120000});
 for(const type of ['shading','numbers','objects']){
  await tool.getByLabel('Practice set').selectOption(type);
  await page.waitForFunction(()=>!document.querySelector('.practice .controls select').disabled,null,{timeout:120000});
  await tool.getByRole('checkbox',{name:'Reveal solution'}).check();
  assert.ok(await first.locator('svg').isVisible());
  if(type==='objects'){for(const shape of ['head','middle','single'])assert.ok(await tool.locator('.puzzle-card .ship-glyph .'+shape).count()>0);}
  assert.equal(await tool.locator('.puzzle-card').count(),4);
  await tool.getByRole('checkbox',{name:'Reveal solution'}).uncheck();
  if(type==='shading'){
   const free=await first.locator('rect.cell').evaluateAll(cells=>cells.findIndex(cell=>!Array.from(cell.parentElement.querySelectorAll('.circle')).some(circle=>Number(circle.getAttribute('cx'))===Number(cell.getAttribute('x'))+29&&Number(circle.getAttribute('cy'))===Number(cell.getAttribute('y'))+29)));
   const cell=first.locator('rect.cell').nth(free);await cell.click({button:'right'});assert.match(await cell.getAttribute('class'),/unshaded-note/);assert.equal(await first.locator('.cross').count(),0);await cell.click();assert.match(await cell.getAttribute('class'),/filled/);await cell.click({button:'right'});assert.match(await cell.getAttribute('class'),/unshaded-note/);await cell.click({button:'right'});assert.doesNotMatch(await cell.getAttribute('class'),/unshaded-note/);
  }
  if(type==='numbers'){
   await first.locator('rect.cell').first().click();await tool.getByRole('button',{name:'Center marks',exact:true}).click();await tool.locator('.keypad').getByRole('button',{name:'1',exact:true}).click();await tool.locator('.keypad').getByRole('button',{name:'3',exact:true}).click();assert.equal(await first.locator('.center-marks').textContent(),'13');assert.equal(await first.locator('.digit').count(),0);await tool.locator('.keypad').getByRole('button',{name:'1',exact:true}).click();assert.equal(await first.locator('.center-marks').textContent(),'3');await tool.getByRole('button',{name:'Answer',exact:true}).click();await tool.locator('.keypad').getByRole('button',{name:'2',exact:true}).click();assert.equal(await first.locator('.digit').textContent(),'2');assert.equal(await first.locator('.center-marks').count(),0);
  }
  if(type==='objects')assert.ok(await tool.getByRole('img',{name:'Fleet: one length 4, one length 3, two length 2, three length 1 ships',exact:true}).isVisible());
 }
 await page.setViewportSize({width:390,height:844});
 assert.ok(await tool.getByRole('button',{name:'New set · 4 puzzles',exact:true}).isVisible());
 assert.deepEqual(errors,[]);
 console.log('Round 19 navigation, loop entry, completion, all set generators, and mobile controls passed.');
}finally{await browser.close();}
