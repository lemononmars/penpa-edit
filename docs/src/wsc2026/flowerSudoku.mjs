export const FLOWER_LAYERS = ['A', 'B', 'C', 'D', 'E'];
export const FLOWER_PETALS = 20;
export const FLOWER_CELL_COUNT = 90;

const mod20 = (n) => ((n - 1) % 20 + 20) % 20 + 1;
const labelIndex = new Map();
let next = 0;
for (const layer of ['A', 'B', 'C', 'D']) {
  for (let petal = 1; petal <= 20; petal++) labelIndex.set(`${layer}${petal}`, next++);
}
for (let petal = 1; petal <= 20; petal += 2) labelIndex.set(`E${petal}`, next++);

export function flowerCell(layer, petal) {
  return labelIndex.get(`${layer}${layer === 'E' ? mod20(petal) : mod20(petal)}`);
}
export const flowerCellIndex = flowerCell;
export function flowerLabel(index) {
  return [...labelIndex.entries()].find(([, cell]) => cell === index)?.[0] ?? 'A1';
}

const seq = (layer, start, offsets) => offsets.map((offset) => flowerCell(layer, start + offset));
const ccw = (a) => [
  flowerCell('A', a), flowerCell('A', a + 1), flowerCell('B', a + 1),
  flowerCell('B', a + 2), flowerCell('C', a + 2), flowerCell('C', a + 3),
  flowerCell('D', a + 3), flowerCell('D', a + 4), flowerCell('E', a + 4),
];
const cw = (a) => [
  flowerCell('A', a), flowerCell('A', a - 1), flowerCell('B', a - 1),
  flowerCell('B', a - 2), flowerCell('C', a - 2), flowerCell('C', a - 3),
  flowerCell('D', a - 3), flowerCell('D', a - 4), flowerCell('E', a - 4),
];

export function createFlowerUnits() {
  const units = [];
  for (const a of Array.from({ length: 10 }, (_, i) => 2 * i + 1)) units.push(ccw(a), cw(a));
  for (const k of [1, 5, 9, 13, 17]) {
    units.push([
      ...seq('A', k, [0, 1, 2, 3]),
      ...seq('B', k, [3, 4, 5, 6]),
      flowerCell('C', k + 6),
    ]);
  }
  for (const k of [8, 12, 16, 20, 4]) {
    units.push([
      ...seq('C', k, [0, 1, 2]),
      ...seq('D', k, [1, 2, 3, 4]),
      flowerCell('E', k + 1), flowerCell('E', k + 3),
    ]);
  }
  return units;
}

export const FLOWER_UNITS = createFlowerUnits();
export const FLOWER_CELL_UNITS = Array.from({ length: FLOWER_CELL_COUNT }, (_, cell) => FLOWER_UNITS.map((unit, id) => unit.includes(cell) ? id : -1).filter((id) => id >= 0));
export const FLOWER_PEERS = FLOWER_CELL_UNITS.map((unitIds, cell) => [...new Set(unitIds.flatMap((id) => FLOWER_UNITS[id]).filter((peer) => peer !== cell))]);

export function flowerConflicts(values, units = FLOWER_UNITS) {
  const conflicts = new Set();
  for (const unit of units) {
    const seen = new Map();
    for (const cell of unit) {
      const digit = values[cell];
      if (!digit) continue;
      if (seen.has(digit)) { conflicts.add(cell); conflicts.add(seen.get(digit)); }
      else seen.set(digit, cell);
    }
  }
  return conflicts;
}
export function flowerCandidates(values, cell) {
  const used = new Set(FLOWER_PEERS[cell].map((peer) => values[peer]).filter(Boolean));
  return Array.from({ length: 9 }, (_, i) => i + 1).filter((digit) => !used.has(digit));
}
export function solveFlower(values, { maxNodes = 500_000, randomize = false, rng = Math.random, limitSolutions = 1 } = {}) {
  if (!Array.isArray(values) || values.length !== FLOWER_CELL_COUNT || values.some((v) => !Number.isInteger(v) || v < 0 || v > 9)) throw new Error('Enter exactly 90 cells using digits 1–9 or 0 for empty.');
  if (flowerConflicts(values).size) return { status: 'invalid', solution: null, solutions: [], nodes: 0 };
  // Exact cover: a placement fills one cell and one digit slot in each of
  // its three units. Branch on the slot with the fewest remaining placements,
  // including unit/digit slots (hidden singles), rather than only on cells.
  const columnCount = FLOWER_CELL_COUNT + FLOWER_UNITS.length * 9;
  const left = [], right = [], up = [], down = [], column = [], row = [], sizes = [];
  for (let id = 0; id <= columnCount; id++) {
    left[id] = id - 1; right[id] = id + 1;
    up[id] = down[id] = id; sizes[id] = 0;
  }
  left[0] = columnCount; right[columnCount] = 0;
  for (let cell = 0; cell < FLOWER_CELL_COUNT; cell++) {
    const digits = values[cell] ? [values[cell]] : flowerCandidates(values, cell);
    for (const digit of digits) {
      const headers = [cell + 1, ...FLOWER_CELL_UNITS[cell].map((unit) => FLOWER_CELL_COUNT + unit * 9 + digit)];
      const nodes = [];
      for (const header of headers) {
        const node = up.length;
        up[node] = up[header]; down[node] = header;
        down[up[header]] = node; up[header] = node;
        column[node] = header; row[node] = cell * 9 + digit - 1; sizes[header]++;
        nodes.push(node);
      }
      nodes.forEach((node, i) => { left[node] = nodes[(i + 3) % 4]; right[node] = nodes[(i + 1) % 4]; });
    }
  }
  function cover(header) {
    right[left[header]] = right[header]; left[right[header]] = left[header];
    for (let i = down[header]; i !== header; i = down[i]) {
      for (let j = right[i]; j !== i; j = right[j]) {
        down[up[j]] = down[j]; up[down[j]] = up[j]; sizes[column[j]]--;
      }
    }
  }
  function uncover(header) {
    for (let i = up[header]; i !== header; i = up[i]) {
      for (let j = left[i]; j !== i; j = left[j]) {
        sizes[column[j]]++; down[up[j]] = j; up[down[j]] = j;
      }
    }
    right[left[header]] = header; left[right[header]] = header;
  }
  const placements = [], solutions = [];
  let nodes = 0, limited = false;
  function search() {
    if (solutions.length >= limitSolutions) return;
    if (!right[0]) {
      const solution = Array(FLOWER_CELL_COUNT).fill(0);
      for (const placement of placements) solution[Math.floor(placement / 9)] = placement % 9 + 1;
      solutions.push(solution); return;
    }
    let target = right[0];
    for (let header = right[target]; header; header = right[header]) {
      if (sizes[header] < sizes[target]) target = header;
      if (sizes[target] <= 1) break;
    }
    if (!sizes[target]) return;
    const options = [];
    for (let node = down[target]; node !== target; node = down[node]) options.push(node);
    if (randomize) {
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
    }
    cover(target);
    for (const node of options) {
      if (nodes >= maxNodes) { limited = true; break; }
      nodes++;
      placements.push(row[node]);
      for (let j = right[node]; j !== node; j = right[j]) cover(column[j]);
      search();
      for (let j = left[node]; j !== node; j = left[j]) uncover(column[j]);
      placements.pop();
      if (solutions.length >= limitSolutions || limited) break;
    }
    uncover(target);
  }
  search();
  return { status: limited ? 'limit' : solutions.length ? 'solved' : 'unsatisfiable', solution: solutions[0] || null, solutions, nodes };
}
export function randomFlowerSolution(options = {}) {
  const { maxNodes = 500_000, rng = Math.random } = options;
  const fallbackBudget = Math.min(1_000, Math.floor(maxNodes / 10));
  const randomizedBudget = maxNodes - fallbackBudget;
  let nodes = 0, result;
  // Sparse randomized searches can spend their whole budget in one unlucky
  // branch. Restart with new choices while retaining one total search budget.
  do {
    result = solveFlower(Array(FLOWER_CELL_COUNT).fill(0), {
      ...options, maxNodes: Math.min(10_000, randomizedBudget - nodes), randomize: true, limitSolutions: 1,
    });
    nodes += result.nodes;
    if (result.status !== 'limit') break;
  } while (nodes < randomizedBudget);
  if (result.status === 'limit' && fallbackBudget) {
    // Digit names do not affect any Flower constraint. A deterministic finish
    // with a random digit permutation provides a valid randomized fallback.
    result = solveFlower(Array(FLOWER_CELL_COUNT).fill(0), { maxNodes: maxNodes - nodes });
    nodes += result.nodes;
    if (result.solution) {
      const digits = Array.from({ length: 9 }, (_, i) => i + 1);
      for (let i = 8; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [digits[i], digits[j]] = [digits[j], digits[i]];
      }
      result.solution = result.solution.map((digit) => digits[digit - 1]);
      result.solutions = [result.solution];
    }
  }
  return { ...result, nodes };
}
export function generateFlowerPuzzle({ clues = 36, rng = Math.random, maxNodes = 2_000_000 } = {}) {
  const solved = randomFlowerSolution({ rng, maxNodes });
  if (!solved.solution) return { ...solved, puzzle: null, solution: null, clues: 0 };
  const puzzle = solved.solution.slice();
  const order = Array.from({ length: FLOWER_CELL_COUNT }, (_, i) => i).sort(() => rng() - 0.5);
  for (const cell of order) {
    if (puzzle.filter(Boolean).length <= clues) break;
    const digit = puzzle[cell]; puzzle[cell] = 0;
    const check = solveFlower(puzzle, { maxNodes, limitSolutions: 2 });
    if (check.status !== 'solved' || check.solutions.length !== 1) puzzle[cell] = digit;
  }
  return { status: 'solved', puzzle, solution: solved.solution, clues: puzzle.filter(Boolean).length };
}

// Guard the data model from accidental regressions: all 90 cells must exist,
// and every Sudoku cell must belong to one column in each direction and one region.
if (FLOWER_UNITS.length !== 30 || FLOWER_UNITS.some((unit) => unit.length !== 9 || new Set(unit).size !== 9) || FLOWER_CELL_UNITS.some((ids) => ids.length !== 3)) {
  throw new Error('Flower Sudoku topology must contain 90 cells, 30 nine-cell units, and three units per cell.');
}
