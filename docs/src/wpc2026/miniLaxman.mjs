// A small, pure grid model for Laxman Rekha practice. A cell is inside (1) or
// outside (0); the boundary of the inside cells is the loop's edge set.
const directions = [[-1, 0, '↑'], [0, -1, '←'], [0, 1, '→'], [1, 0, '↓']];
const key = (r, c) => `${r},${c}`;
const h = (r, c) => `H:${r},${c}`;
const v = (r, c) => `V:${r},${c}`;
const at = (cells, n, r, c) => r < 0 || c < 0 || r >= n || c >= n ? 0 : cells[r * n + c];
const shuffle = (items, random) => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
};
function rng(seed) {
  let state = seed >>> 0;
  return () => { state = (state + 0x6d2b79f5) >>> 0; let x = Math.imul(state ^ state >>> 15, 1 | state); x ^= x + Math.imul(x ^ x >>> 7, 61 | x); return ((x ^ x >>> 14) >>> 0) / 4294967296; };
}

export function loopEdges(cells, n) {
  const edges = new Set();
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (cells[r * n + c]) {
    if (!at(cells, n, r - 1, c)) edges.add(h(r, c));
    if (!at(cells, n, r + 1, c)) edges.add(h(r + 1, c));
    if (!at(cells, n, r, c - 1)) edges.add(v(r, c));
    if (!at(cells, n, r, c + 1)) edges.add(v(r, c + 1));
  }
  return edges;
}

export function validRegion(cells, n) {
  const count = cells.reduce((sum, value) => sum + value, 0);
  if (count === 0) return false;
  // A diagonal-only touch would give the boundary four edges at one vertex.
  for (let r = 0; r < n - 1; r++) for (let c = 0; c < n - 1; c++) {
    const a = at(cells, n, r, c), b = at(cells, n, r, c + 1), d = at(cells, n, r + 1, c), e = at(cells, n, r + 1, c + 1);
    if (a === e && b === d && a !== b) return false;
  }
  const visit = (wanted, initial) => {
    const seen = new Set(initial), queue = [...initial];
    for (let i = 0; i < queue.length; i++) {
      const index = queue[i], r = Math.floor(index / n), c = index % n;
      for (const [dr, dc] of directions) {
        const rr = r + dr, cc = c + dc, next = rr * n + cc;
        if (rr >= 0 && cc >= 0 && rr < n && cc < n && cells[next] === wanted && !seen.has(next)) { seen.add(next); queue.push(next); }
      }
    }
    return seen.size;
  };
  if (count === n * n) return true;
  const firstInside = cells.indexOf(1);
  if (visit(1, [firstInside]) !== count) return false;
  const borderOutside = [];
  for (let i = 0; i < n * n; i++) if (!cells[i] && (i < n || i >= n * (n - 1) || i % n === 0 || i % n === n - 1)) borderOutside.push(i);
  return borderOutside.length > 0 && visit(0, borderOutside) === n * n - count;
}

function sight(edges, n, r, c, dir) {
  const [dr, dc] = directions[dir];
  for (let d = 0; d < n; d++) {
    const rr = r + dr * d, cc = c + dc * d;
    if (rr < 0 || cc < 0 || rr >= n || cc >= n) break;
    const edge = dir === 0 ? h(rr, cc) : dir === 3 ? h(rr + 1, cc) : dir === 1 ? v(rr, cc) : v(rr, cc + 1);
    if (edges.has(edge)) return { distance: d + 1, edge };
  }
  return null;
}
function segmentLength(edges, edge) {
  const axis = edge[0], [r, c] = edge.slice(2).split(',').map(Number);
  let length = 1;
  for (const sign of [-1, 1]) for (let step = 1; ; step++) {
    if (!edges.has(axis === 'H' ? h(r, c + sign * step) : v(r + sign * step, c))) break;
    length++;
  }
  return length;
}
function polygraph(cells, n, edges, r, c) {
  const used = [h(r, c), v(r, c), v(r, c + 1), h(r + 1, c)].filter(edge => edges.has(edge)).length;
  return at(cells, n, r, c) ? used : 4 - used;
}
function myopia(cells, n, edges, r, c) {
  const hits = directions.map((_, dir) => sight(edges, n, r, c, dir));
  const lengths = hits.map(hit => hit?.distance).filter(Boolean);
  if (!lengths.length) return '';
  const distance = at(cells, n, r, c) ? Math.min(...lengths) : Math.max(...lengths);
  return hits.map((hit, dir) => hit?.distance === distance ? directions[dir][2] : '').join('');
}
function parallel(cells, n, edges, axis, r, c) {
  const edge = axis === 'H' ? h(r, c) : v(r, c);
  if (edges.has(edge)) return null;
  const inside = axis === 'H' ? at(cells, n, r - 1, c) : at(cells, n, r, c - 1);
  const counts = [-1, 1].map(sign => {
    let count = 0;
    for (let step = 1; ; step++) {
      const rr = axis === 'V' ? r + sign * step : r, cc = axis === 'H' ? c + sign * step : c;
      if (axis === 'V' ? rr < 0 || rr >= n : cc < 0 || cc >= n) break;
      if (edges.has(axis === 'H' ? h(rr, cc) : v(rr, cc))) break;
      count++;
    }
    return count;
  });
  return { balanced: counts[0] === counts[1], inside: !!inside, total: counts[0] + counts[1] };
}

export function clueHolds(clue, cells, n, edges = loopEdges(cells, n)) {
  const { type, r, c } = clue;
  if (type === 'sheep') return !!at(cells, n, r, c) === (clue.value === 'S');
  if (type === 'polygraph') return polygraph(cells, n, edges, r, c) === clue.value;
  if (type === 'myopia') return myopia(cells, n, edges, r, c) === clue.value;
  if (type === 'sight') {
    const hit = sight(edges, n, r, c, clue.dir);
    if (!hit) return false;
    const actual = segmentLength(edges, hit.edge);
    return at(cells, n, r, c) ? actual === clue.value : Math.abs(actual - clue.value) === 1;
  }
  if (type === 'kurarin') {
    const count = at(cells, n, r - 1, c - 1) + at(cells, n, r - 1, c) + at(cells, n, r, c - 1) + at(cells, n, r, c);
    return (count > 2 ? 'white' : count < 2 ? 'black' : 'grey') === clue.value;
  }
  if (type === 'parallel') {
    const result = parallel(cells, n, edges, clue.axis, r, c);
    return !!result && result.balanced === result.inside && (clue.value === null || result.total === clue.value);
  }
  return false;
}

export function validateDrawnLoop(edgeList, n) {
  const edges = new Set(edgeList), graph = new Map();
  if (!edges.size) return { ok: false, message: 'Draw a loop first.' };
  const link = (a, b) => { if (!graph.has(a)) graph.set(a, []); graph.get(a).push(b); };
  for (const edge of edges) {
    const match = /^(H|V):(\d+),(\d+)$/.exec(edge);
    if (!match) return { ok: false, message: 'The loop has an invalid edge.' };
    const axis = match[1], r = Number(match[2]), c = Number(match[3]);
    if (axis === 'H' ? r > n || c >= n : r >= n || c > n) return { ok: false, message: 'The loop leaves the grid.' };
    const a = key(r, c), b = axis === 'H' ? key(r, c + 1) : key(r + 1, c);
    link(a, b); link(b, a);
  }
  if ([...graph.values()].some(neighbors => neighbors.length !== 2)) return { ok: false, message: 'The line has an open end or a branch.' };
  const seen = new Set(), queue = [graph.keys().next().value];
  while (queue.length) { const node = queue.pop(); if (seen.has(node)) continue; seen.add(node); queue.push(...graph.get(node)); }
  if (seen.size !== graph.size) return { ok: false, message: 'Draw a single loop.' };
  const cells = Array(n * n).fill(1), queueOutside = [];
  const outside = (r, c) => { const i = r * n + c; if (r >= 0 && c >= 0 && r < n && c < n && cells[i]) { cells[i] = 0; queueOutside.push([r, c]); } };
  for (let c = 0; c < n; c++) { if (!edges.has(h(0, c))) outside(0, c); if (!edges.has(h(n, c))) outside(n - 1, c); }
  for (let r = 0; r < n; r++) { if (!edges.has(v(r, 0))) outside(r, 0); if (!edges.has(v(r, n))) outside(r, n - 1); }
  while (queueOutside.length) {
    const [r, c] = queueOutside.pop();
    if (!edges.has(h(r, c))) outside(r - 1, c);
    if (!edges.has(h(r + 1, c))) outside(r + 1, c);
    if (!edges.has(v(r, c))) outside(r, c - 1);
    if (!edges.has(v(r, c + 1))) outside(r, c + 1);
  }
  const boundary = loopEdges(cells, n);
  if (!validRegion(cells, n) || boundary.size !== edges.size || [...edges].some(edge => !boundary.has(edge))) return { ok: false, message: 'The loop must enclose one connected region.' };
  return { ok: true, cells, edges };
}

// The search branches on inside/outside cells. Local clues prune partial maps;
// all six clue types are checked again on every complete candidate loop.
export function findAlternative(n, clues, target, maxNodes = 100000) {
  const cells = Array(n * n).fill(-1), fixed = new Map(), local = clues.filter(clue => clue.type === 'polygraph' || clue.type === 'kurarin');
  for (const clue of clues) if (clue.type === 'sheep') fixed.set(clue.r * n + clue.c, clue.value === 'S' ? 1 : 0);
  for (const [index, value] of fixed) cells[index] = value;
  const incidence = Array.from({ length: n * n }, () => []);
  const constraints = local.map(clue => {
    const locations = clue.type === 'kurarin'
      ? [[clue.r - 1, clue.c - 1], [clue.r - 1, clue.c], [clue.r, clue.c - 1], [clue.r, clue.c]]
      : [[clue.r, clue.c], [clue.r - 1, clue.c], [clue.r, clue.c - 1], [clue.r, clue.c + 1], [clue.r + 1, clue.c]];
    const indices = locations.map(([r, c]) => r < 0 || c < 0 || r >= n || c >= n ? -1 : r * n + c).filter(index => index >= 0);
    const allowed = [];
    for (let mask = 0; mask < 1 << indices.length; mask++) {
      const valueAt = index => index < 0 ? 0 : (mask >> indices.indexOf(index)) & 1;
      let holds;
      if (clue.type === 'kurarin') {
        const count = locations.reduce((sum, [r, c]) => sum + valueAt(r * n + c), 0);
        holds = (count > 2 ? 'white' : count < 2 ? 'black' : 'grey') === clue.value;
      } else {
        const center = valueAt(clue.r * n + clue.c);
        const used = locations.slice(1).filter(([r, c]) => center !== valueAt(r < 0 || c < 0 || r >= n || c >= n ? -1 : r * n + c)).length;
        holds = (center ? used : 4 - used) === clue.value;
      }
      if (holds) allowed.push(mask);
    }
    const constraint = { indices, allowed };
    for (const index of indices) incidence[index].push(constraint);
    return constraint;
  });
  const possible = constraint => constraint.allowed.some(mask => constraint.indices.every((index, bit) => cells[index] < 0 || cells[index] === (mask >> bit & 1)));
  if (constraints.some(constraint => !possible(constraint))) return { alternate: null, proven: true, nodes: 0 };
  const order = Array.from({ length: n * n }, (_, index) => index).filter(index => cells[index] < 0);
  order.sort((a, b) => incidence[b].length - incidence[a].length);
  let nodes = 0, alternate = null, timeout = false;
  const search = depth => {
    if (++nodes > maxNodes) { timeout = true; return; }
    if (depth === order.length) {
      if (target && cells.every((value, index) => value === target[index])) return;
      if (!validRegion(cells, n)) return;
      const edges = loopEdges(cells, n);
      if (clues.every(clue => clueHolds(clue, cells, n, edges))) alternate = [...cells];
      return;
    }
    const index = order[depth], r = Math.floor(index / n), c = index % n;
    for (const value of [target?.[index] ?? 0, 1 - (target?.[index] ?? 0)]) {
      cells[index] = value;
      if (r > 0 && c > 0) {
        const a = cells[(r - 1) * n + c - 1], b = cells[(r - 1) * n + c], d = cells[r * n + c - 1];
        if (a >= 0 && b >= 0 && d >= 0 && a === value && b === d && a !== b) { cells[index] = -1; continue; }
      }
      if (incidence[index].every(possible)) search(depth + 1);
      if (alternate || timeout) break;
    }
    cells[index] = -1;
  };
  search(0);
  return { alternate, proven: !timeout, nodes };
}

function randomLoop(n, random) {
  const cells = Array(n * n).fill(0), low = Math.floor(n / 4), high = Math.ceil(3 * n / 4);
  for (let r = low; r < high; r++) for (let c = low; c < high; c++) cells[r * n + c] = 1;
  for (let attempt = 0; attempt < n * n * 8; attempt++) {
    const index = Math.floor(random() * cells.length), old = cells[index];
    cells[index] = 1 - old;
    const area = cells.reduce((sum, value) => sum + value, 0);
    if (!validRegion(cells, n) || area < n || area > n * n * 0.7 || random() < 0.18) cells[index] = old;
  }
  return cells;
}

function candidates(cells, n, random) {
  const edges = loopEdges(cells, n), list = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    list.push({ type: 'sheep', r, c, value: cells[r * n + c] ? 'S' : 'W' });
    list.push({ type: 'polygraph', r, c, value: polygraph(cells, n, edges, r, c) });
    const arrows = myopia(cells, n, edges, r, c);
    if (arrows) list.push({ type: 'myopia', r, c, value: arrows });
    for (let dir = 0; dir < 4; dir++) {
      const hit = sight(edges, n, r, c, dir);
      if (!hit) continue;
      const actual = segmentLength(edges, hit.edge), given = cells[r * n + c] ? actual : actual + (random() < 0.5 ? -1 : 1);
      if (given > 0) list.push({ type: 'sight', r, c, dir, value: given });
    }
  }
  for (let r = 1; r < n; r++) for (let c = 1; c < n; c++) {
    const count = at(cells, n, r - 1, c - 1) + at(cells, n, r - 1, c) + at(cells, n, r, c - 1) + at(cells, n, r, c);
    list.push({ type: 'kurarin', r, c, value: count > 2 ? 'white' : count < 2 ? 'black' : 'grey' });
  }
  for (let r = 1; r < n; r++) for (let c = 0; c < n; c++) {
    const result = parallel(cells, n, edges, 'H', r, c);
    if (result && result.balanced === result.inside) list.push({ type: 'parallel', axis: 'H', r, c, value: result.total });
  }
  for (let r = 0; r < n; r++) for (let c = 1; c < n; c++) {
    const result = parallel(cells, n, edges, 'V', r, c);
    if (result && result.balanced === result.inside) list.push({ type: 'parallel', axis: 'V', r, c, value: result.total });
  }
  return list;
}

export function generateMiniLaxman(n, seed = Math.floor(Math.random() * 0xffffffff)) {
  if (![5, 8, 10].includes(n)) throw new Error('Choose a 5×5, 8×8, or 10×10 grid.');
  const random = rng(seed);
  let target, pool, clues;
  for (let attempt = 0; attempt < 12; attempt++) {
    target = randomLoop(n, random);
    pool = candidates(target, n, random);
    clues = pool.filter(clue => clue.type === 'polygraph');
    const result = findAlternative(n, clues, target, 150000);
    if (result.proven && !result.alternate) break;
    if (attempt === 11) throw new Error('Could not find a uniquely clued loop. Try again.');
  }
  const extras = shuffle(pool.filter(clue => clue.type === 'kurarin' || clue.type === 'parallel'), random);
  for (const type of ['kurarin', 'parallel']) {
    const eligible = extras.filter(clue => clue.type === type);
    clues.push(...eligible.slice(0, Math.min(Math.ceil(n / 2), eligible.length)));
  }
  // Replace some counts with the other cell clue styles, retaining uniqueness.
  for (const type of ['sheep', 'myopia', 'sight']) {
    let added = 0;
    for (const clue of shuffle(pool.filter(item => item.type === type), random)) {
      if (!clues.some(item => item.type === 'polygraph' && item.r === clue.r && item.c === clue.c)) continue;
      const next = clues.filter(item => !(item.type === 'polygraph' && item.r === clue.r && item.c === clue.c)).concat(clue);
      const result = findAlternative(n, next, target, 30000);
      if (result.proven && !result.alternate) { clues = next; added++; }
      if (added >= (n === 5 ? 1 : 2)) break;
    }
  }
  // Remove clues only after a complete search proves uniqueness survives.
  let unsuccessful = 0;
  for (const clue of shuffle(clues.filter(item => item.type === 'polygraph'), random)) {
    const next = clues.filter(item => item !== clue);
    const result = findAlternative(n, next, target, n === 5 ? 30000 : 25000);
    if (result.proven && !result.alternate) { clues = next; unsuccessful = 0; }
    else unsuccessful++;
    if (unsuccessful >= n + 10) break;
  }
  return { size: n, seed, clues, solution: [...loopEdges(target, n)], uniqueness: 'proven' };
}
