// Round 10 Laxman Rekha checker. Penpa point coordinates are converted to
// square-grid coordinates before applying the published clue rules.
export function checkLaxman(pu) {
  const rows = pu.ny, cols = pu.nx;
  const point = pu.point || [], centers = pu.centerlist || [];
  if (!rows || !cols || centers.length !== rows * cols) return { ok: false, message: 'Use a complete square grid.' };
  const unique = values => [...new Set(values.map(v => Math.round(v * 1000) / 1000))].sort((a,b) => a-b);
  const xs = unique(centers.map(id => point[id].x)), ys = unique(centers.map(id => point[id].y));
  if (xs.length !== cols || ys.length !== rows) return { ok: false, message: 'Cannot read grid coordinates.' };
  const dx = cols > 1 ? xs[1] - xs[0] : pu.size, dy = rows > 1 ? ys[1] - ys[0] : pu.size;
  const x0 = xs[0] - dx / 2, y0 = ys[0] - dy / 2;
  const vertex = id => ({ c: Math.round((point[id].x - x0) / dx), r: Math.round((point[id].y - y0) / dy) });
  const cell = id => ({ c: Math.round((point[id].x - xs[0]) / dx), r: Math.round((point[id].y - ys[0]) / dy) });
  const cellById = new Map(centers.map(id => [Number(id), cell(id)]));
  const h = (r,c) => `H:${r},${c}`, v = (r,c) => `V:${r},${c}`;
  const used = new Set(), graph = new Map();
  const fail = (message, pointId) => ({ ok: false, message, point: pointId });
  const add = (a,b) => { if (!graph.has(a)) graph.set(a, []); graph.get(a).push(b); };
  const entries = Object.entries(pu.pu_a?.lineE || {}).filter(([,style]) => style !== 98 && style !== 80);
  if (!entries.length) return fail('Draw a closed loop in Answer mode first.');
  for (const [key] of entries) {
    const [aId,bId] = key.split(',').map(Number);
    if (!point[aId] || !point[bId]) return fail('The loop has an invalid edge.', aId);
    const a = vertex(aId), b = vertex(bId), dr = Math.abs(a.r-b.r), dc = Math.abs(a.c-b.c);
    if (dr + dc !== 1 || Math.min(a.r,b.r)<0 || Math.max(a.r,b.r)>rows || Math.min(a.c,b.c)<0 || Math.max(a.c,b.c)>cols)
      return fail('The loop contains a non-grid edge.', aId);
    const edge = dr ? v(Math.min(a.r,b.r),a.c) : h(a.r,Math.min(a.c,b.c));
    if (used.has(edge)) return fail('The loop repeats an edge.', aId);
    used.add(edge);
    const aa=`${a.r},${a.c}`, bb=`${b.r},${b.c}`; add(aa,bb); add(bb,aa);
  }
  for (const [node, neighbors] of graph) if (neighbors.length !== 2) {
    const [r,c] = node.split(',').map(Number);
    const id = entries.flatMap(([key]) => key.split(',').map(Number)).find(id => { const p=vertex(id); return p.r===r&&p.c===c; });
    return fail(neighbors.length < 2 ? 'The loop has an open end.' : 'The loop branches at a vertex.', id);
  }
  const seen = new Set(), stack = [graph.keys().next().value];
  while (stack.length) { const a=stack.pop(); if (seen.has(a)) continue; seen.add(a); stack.push(...graph.get(a)); }
  if (seen.size !== graph.size) return fail('The answer contains more than one loop.');
  const inside = Array.from({length:rows},()=>Array(cols).fill(true));
  const flood = [], outside = (r,c) => { if (r>=0&&r<rows&&c>=0&&c<cols&&inside[r][c]) { inside[r][c]=false; flood.push([r,c]); } };
  for (let c=0;c<cols;c++) { if (!used.has(h(0,c))) outside(0,c); if (!used.has(h(rows,c))) outside(rows-1,c); }
  for (let r=0;r<rows;r++) { if (!used.has(v(r,0))) outside(r,0); if (!used.has(v(r,cols))) outside(r,cols-1); }
  while (flood.length) {
    const [r,c]=flood.pop();
    if (r>0&&!used.has(h(r,c))) outside(r-1,c);
    if (r<rows-1&&!used.has(h(r+1,c))) outside(r+1,c);
    if (c>0&&!used.has(v(r,c))) outside(r,c-1);
    if (c<cols-1&&!used.has(v(r,c+1))) outside(r,c+1);
  }
  const validCell = p => p.r>=0&&p.r<rows&&p.c>=0&&p.c<cols;
  const edgeAt = (r,c,dir) => dir==='up'?h(r,c):dir==='down'?h(r+1,c):dir==='left'?v(r,c):v(r,c+1);
  const directions = ['left','up','right','down'];
  const sight = (r,c,dir) => {
    for (let d=0; d<Math.max(rows,cols); d++) {
      const rr=r+(dir==='up'?-d:dir==='down'?d:0), cc=c+(dir==='left'?-d:dir==='right'?d:0);
      if (rr<0||rr>=rows||cc<0||cc>=cols) break;
      const edge=edgeAt(rr,cc,dir);
      if (used.has(edge)) return { distance:d+1,edge };
    }
    return null;
  };
  const segmentLength = edge => {
    const [axis,coords]=edge.split(':'), [r,c]=coords.split(',').map(Number);
    let length=1;
    for (const sign of [-1,1]) for (let n=1;;n++) {
      const rr=axis==='V'?r+sign*n:r, cc=axis==='H'?c+sign*n:c;
      if (!used.has(axis==='H'?h(rr,cc):v(rr,cc))) break;
      length++;
    }
    return length;
  };
  const symbols = pu.pu_q?.symbol || {}, numbers = pu.pu_q?.number || {};
  const ids = [...new Set([...Object.keys(symbols),...Object.keys(numbers)].map(Number))].sort((a,b)=>a-b);
  for (const id of ids) {
    const symbol=symbols[id], number=numbers[id], p=cell(id), label=`Clue at row ${p.r+1}, column ${p.c+1}`;
    if (symbol && !['arrow_cross','circle_SS','square_S'].includes(symbol[1]))
      return fail(`Unsupported question mark at point ${id}.`,id);
    if (symbol?.[1]==='arrow_cross') {
      if (Array.isArray(symbol[0]) && symbol[0].slice(4).some(Boolean)) return fail('Myopia arrows must be orthogonal.',id);
      if (!validCell(p)) return fail('Myopia arrow is outside the grid.',id);
      const distances=directions.map(dir=>sight(p.r,p.c,dir)?.distance || null).filter(Boolean);
      if (!distances.length) return fail(`${label}: no loop segment is visible.`,id);
      const target=inside[p.r][p.c]?Math.min(...distances):Math.max(...distances);
      const expected=directions.map(dir=>sight(p.r,p.c,dir)?.distance===target?1:0);
      const actual=Array.isArray(symbol[0])?symbol[0].slice(0,4).map(Boolean):[];
      if (actual.length!==4||expected.some((n,i)=>Boolean(n)!==actual[i])) return fail(`${label}: Myopia arrows point in the wrong direction.`,id);
    }
    if (symbol?.[1]==='circle_SS') {
      const touching=(point[id]?.neighbor||[]).map(Number).filter(cellById.has.bind(cellById)).map(cid=>cellById.get(cid));
      if (touching.length!==2&&touching.length!==4) return fail('Kurarin dot must touch two or four cells.',id);
      const inCount=touching.filter(q=>inside[q.r][q.c]).length, outCount=touching.length-inCount;
      const expected=inCount>outCount?1:inCount===outCount?5:2;
      if (Number(symbol[0])!==expected) return fail(`Kurarin dot near row ${p.r+1}, column ${p.c+1} has the wrong color.`,id);
    }
    if (symbol?.[1]==='square_S') {
      // Edge midpoint coordinates distinguish horizontal from vertical.
      const rf=(point[id].y-y0)/dy, cf=(point[id].x-x0)/dx;
      const isV=Math.abs(cf-Math.round(cf))<0.25;
      const er=isV?Math.floor(rf):Math.round(rf), ec=isV?Math.round(cf):Math.floor(cf);
      const key=isV?v(er,ec):h(er,ec);
      if (used.has(key)) return fail('The loop passes through a Parallel Counts square.',id);
      const touching=(point[id]?.neighbor||[]).map(Number).filter(cellById.has.bind(cellById)).map(cid=>cellById.get(cid));
      if (touching.length!==2) return fail('Parallel Counts square must be between two cells.',id);
      const counts=[];
      for (const sign of [-1,1]) {
        let n=0;
        for (let step=1;;step++) {
          const rr=isV?er:er+sign*step, cc=isV?ec+sign*step:ec;
          if (isV?(cc<0||cc>cols):(rr<0||rr>rows)) break;
          if (used.has(isV?v(rr,cc):h(rr,cc))) break;
          n++;
        }
        counts.push(n);
      }
      const isInside=inside[touching[0].r][touching[0].c];
      if ((counts[0]===counts[1])!==isInside) return fail('Parallel Counts square has the wrong balance.',id);
      if (number && Number(String(number[0]).replace(/_.*/,''))!==counts[0]+counts[1]) return fail('Parallel Counts square has the wrong total.',id);
    }
    if (number) {
      const raw=String(number[0]), mode=String(number[2]);
      if (symbol?.[1]==='square_S'&&mode==='5') continue;
      if (mode==='5') return fail('Parallel Counts number needs a square.',id);
      if (!validCell(p)) return fail('Number clue is outside the grid.',id);
      if (raw==='S'||raw==='W') {
        if ((raw==='S')!==inside[p.r][p.c]) return fail(`${label}: ${raw} is on the wrong side of the loop.`,id);
      } else if (mode==='2'&&raw.includes('_')) {
        const [value,arrow]=raw.split('_'), dir=({0:'up',1:'left',2:'right',3:'down'})[Number(arrow)];
        if (!dir) return fail(`${label}: Line of Sight arrow must be orthogonal.`,id);
        const hit=sight(p.r,p.c,dir);
        if (!hit) return fail(`${label}: Line of Sight sees no segment.`,id);
        const actual=segmentLength(hit.edge), given=Number(value);
        if (inside[p.r][p.c]?actual!==given:Math.abs(actual-given)!==1) return fail(`${label}: Line of Sight length is wrong.`,id);
      } else if (mode==='2') {
        return fail(`${label}: Line of Sight needs an orthogonal arrow.`,id);
      } else if (mode==='1'&&Number(number[1])===2) {
        const usedCount=directions.filter(dir=>used.has(edgeAt(p.r,p.c,dir))).length;
        const actual=inside[p.r][p.c]?usedCount:4-usedCount;
        if (Number(raw)!==actual) return fail(`${label}: Polygraph count should be ${actual}.`,id);
      } else {
        return fail(`${label}: unrecognized number clue.`,id);
      }
    }
  }
  return { ok: true, message: `Correct: one closed loop and ${ids.length} clue locations checked.` };
}
