const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const {chromium} = require('playwright');
test('puzzle genre controls and parallel counts input', async () => {
  const {createServer} = await import('vite');
  const server = await createServer({configFile:path.resolve(__dirname,'../vite.config.js'),logLevel:'silent',server:{host:'127.0.0.1',port:0}});
  await server.listen(); let browser;
  try {
    browser = await chromium.launch({headless:true});
    const page = await browser.newPage({viewport:{width:1360,height:900}});
    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/puzzle`);
    await page.waitForFunction(() => window.penpaBoardReady && document.querySelector('.studio-shell.ready'));
    await page.getByRole('button',{name:'Genre'}).first().click();
    await page.locator('#puzzle-genre').selectOption('laxman-rekha');
    assert.equal(await page.locator('.genre-section').getByRole('button',{name:'Check puzzle'}).count(),1);
    assert.equal(await page.locator('.penpa-actions').getByRole('button',{name:'Check puzzle'}).count(),0);
    await page.evaluate(() => {pu.pu_q.number[pu.centerlist[14]]=['1',2,'1'];});
    for (const group of ['Myopia','Line of Sight','Polygraph','Parallel Counts','Sheep / Wolf','Kurarin']) {
      await page.getByRole('tab',{name:group,exact:true}).last().click();
      assert.equal(await page.locator('.desktop-input-panel').getByRole('button',{name:'Edge',exact:true}).count(),0);
    }
    await page.getByRole('tab',{name:'Polygraph'}).last().click();
    assert.deepEqual(await page.evaluate(() => [pu.mode.qa,pu.mode.pu_q.number[1],pu.pu_q.number[pu.centerlist[14]][1]]),['pu_q',3,3]);
    const polygraphCell=await page.evaluate(() => {const id=pu.centerlist[12];pu.mouse_mode='down_left';pu.mouse_number(0,0,id);return id;});
    await page.locator('.desktop-input-panel').getByRole('button',{name:'2',exact:true}).click();
    assert.deepEqual(await page.evaluate(id=>({question:pu.pu_q.number[id],answer:pu.pu_a.number[id] ?? null}),polygraphCell),{question:['2',3,'1'],answer:null});
    await page.getByRole('tab',{name:'Parallel Counts'}).last().click();
    const panel=page.locator('.desktop-input-panel .tool-input-panel');
    assert.equal(await panel.getByRole('button',{name:'Square'}).count(),0);
    assert.equal(await panel.getByRole('button',{name:'Edge'}).count(),0);
    const bareClick = await page.evaluate(() => {
      const mid=pu.point[pu.centerlist[Math.floor(pu.centerlist.length/2)]];
      const id=pu.point.findIndex(p=>p?.type===2&&p.use===1&&p.neighbor?.length===2&&Math.abs(p.x-mid.x)<60&&Math.abs(p.y-mid.y)<60);
      const canvas=document.querySelector('#canvas'), rect=canvas.getBoundingClientRect(),scale=rect.width/canvas.clientWidth;
      return {id,x:rect.left+pu.point[id].x*scale,y:rect.top+pu.point[id].y*scale};
    });
    await page.mouse.move(bareClick.x,bareClick.y); await page.mouse.down();
    assert.deepEqual(await page.evaluate(() => ({drawing:pu.drawing,lines:Object.keys(pu.pu_q.line).length})),{drawing:false,lines:0});
    await page.mouse.up();
    const id=await page.evaluate(() => {const id=pu.point.findIndex(p=>p?.type===2&&p.use===1&&p.neighbor?.length===2);pu.mouse_mode='down_left';pu.mouse_number(0,0,id);return id;});
    assert.equal(await page.evaluate(() => pu.drawing),false);
    await panel.getByRole('button',{name:'5',exact:true}).click();
    assert.deepEqual(await page.evaluate(id=>({number:pu.pu_q.number[id],symbol:pu.pu_q.symbol[id]}),id),{number:['5',1,'5'],symbol:[1,'square_S',2]});
    await panel.getByRole('button',{name:'Clear'}).click();
    assert.deepEqual(await page.evaluate(id=>({number:pu.pu_q.number[id] ?? null,symbol:pu.pu_q.symbol[id] ?? null}),id),{number:null,symbol:null});
    await page.keyboard.press('Digit7');
    assert.deepEqual(await page.evaluate(id=>({number:pu.pu_q.number[id],symbol:pu.pu_q.symbol[id]}),id),{number:['7',1,'5'],symbol:[1,'square_S',2]});
    await page.keyboard.press('Control+z');
    assert.deepEqual(await page.evaluate(id=>({number:pu.pu_q.number[id] ?? null,symbol:pu.pu_q.symbol[id] ?? null}),id),{number:null,symbol:null});
    await page.keyboard.press('Control+y');
    assert.deepEqual(await page.evaluate(id=>({number:pu.pu_q.number[id],symbol:pu.pu_q.symbol[id]}),id),{number:['7',1,'5'],symbol:[1,'square_S',2]});
    await page.keyboard.press('Backspace');
    assert.deepEqual(await page.evaluate(id=>({number:pu.pu_q.number[id] ?? null,symbol:pu.pu_q.symbol[id] ?? null}),id),{number:null,symbol:null});
    await page.keyboard.press('Digit0');
    assert.deepEqual(await page.evaluate(id=>({number:pu.pu_q.number[id],symbol:pu.pu_q.symbol[id]}),id),{number:['0',1,'5'],symbol:[1,'square_S',2]});
    await page.keyboard.press('Delete');
    assert.deepEqual(await page.evaluate(id=>({number:pu.pu_q.number[id] ?? null,symbol:pu.pu_q.symbol[id] ?? null}),id),{number:null,symbol:null});
    await page.getByRole('button',{name:'Solve'}).first().click();
    assert.deepEqual(await page.evaluate(() => [pu.mode.qa,pu.mode.pu_a.edit_mode,pu.mode.pu_a.combi[0]]),['pu_a','combi','edgex']);
    const drag=await page.evaluate(() => {
      const mid=pu.point[pu.centerlist[Math.floor(pu.centerlist.length/2)]];
      const a=pu.point.findIndex(p=>p?.type===1&&p.use===1&&Math.abs(p.x-mid.x)<20&&Math.abs(p.y-mid.y)<20&&p.adjacent.some(id=>pu.point[id]?.type===1&&pu.point[id].use===1));
      const b=pu.point[a].adjacent.find(id=>pu.point[id]?.type===1&&pu.point[id].use===1);
      const canvas=document.querySelector('#canvas'),rect=canvas.getBoundingClientRect(),scale=rect.width/canvas.clientWidth;
      const at=id=>({x:rect.left+pu.point[id].x*scale,y:rect.top+pu.point[id].y*scale});
      return [at(a),at(b)];
    });
    await page.mouse.move(drag[0].x,drag[0].y);await page.mouse.down();await page.mouse.move(drag[1].x,drag[1].y,{steps:4});await page.mouse.up();
    assert.equal(await page.evaluate(() => Object.keys(pu.pu_a.lineE).length),1);
    const canvasHash=()=>page.evaluate(() => {const c=document.querySelector('#canvas'),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let h=0;for(let i=0;i<d.length;i+=16)h=(h*31+d[i]+d[i+1]+d[i+2]+d[i+3])>>>0;return h;});
    const shownHash=await canvasHash();
    const toggle=page.getByRole('checkbox',{name:'Show solution'}).first();
    assert.equal(await toggle.isChecked(),true);
    await toggle.uncheck(); assert.equal(await page.evaluate(() => window.penpaEditorHideSolution),true); assert.notEqual(await canvasHash(),shownHash);
    await toggle.check(); assert.equal(await page.evaluate(() => window.penpaEditorHideSolution),false); assert.equal(await canvasHash(),shownHash);
  } finally {await browser?.close();await server.close();}
});

