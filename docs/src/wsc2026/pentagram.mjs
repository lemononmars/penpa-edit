export const PENTAGRAM_CELL_COUNT = 80;
const cell = (point, u, v) => ((point + 5) % 5) * 16 + v * 4 + u;
export const PENTAGRAM_UNITS = [];
for (let point = 0; point < 5; point++) {
  for (let offset = 0; offset < 4; offset++) {
    PENTAGRAM_UNITS.push([
      ...Array.from({ length: 4 }, (_, u) => cell(point, u, offset)),
      ...Array.from({ length: 4 }, (_, v) => cell(point + 1, offset, v)),
    ]);
  }
}
for (let point = 0; point < 5; point++) {
  for (let half = 0; half < 2; half++) {
    PENTAGRAM_UNITS.push(Array.from({ length: 8 }, (_, i) => cell(point, half * 2 + i % 2, Math.floor(i / 2))));
  }
}
export const PENTAGRAM_CELL_UNITS = Array.from({ length: 80 }, (_, index) => PENTAGRAM_UNITS.map((unit, id) => unit.includes(index) ? id : -1).filter((id) => id >= 0));
const center = { x: 300, y: 305 };
const spoke = (point) => {
  const angle = (-126 + point * 72) * Math.PI / 180;
  return { x: 178 * Math.cos(angle), y: 178 * Math.sin(angle) };
};
export function pentagramPosition(point, u, v) {
  const left = spoke(point), right = spoke(point + 1);
  return { x: center.x + left.x * u + right.x * v, y: center.y + left.y * u + right.y * v };
}
export function pentagramGeometry(index) {
  const point = Math.floor(index / 16), u = index % 4, v = Math.floor(index % 16 / 4);
  const vertices = [[u, v], [u + 1, v], [u + 1, v + 1], [u, v + 1]].map(([a, b]) => pentagramPosition(point, a / 4, b / 4));
  return { point, u, v, path: vertices.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ') + ' Z', center: pentagramPosition(point, (u + .5) / 4, (v + .5) / 4) };
}
export function pentagramConflicts(values, omitted = 9) {
  const conflicts = new Set();
  values.forEach((digit, index) => { if (digit === omitted) conflicts.add(index); });
  for (const unit of PENTAGRAM_UNITS) {
    const seen = new Map();
    for (const index of unit) {
      const digit = values[index];
      if (!digit) continue;
      if (seen.has(digit)) { conflicts.add(index); conflicts.add(seen.get(digit)); }
      else seen.set(digit, index);
    }
  }
  return conflicts;
}
