import { FLOWER_CELL_COUNT, FLOWER_LAYERS, FLOWER_CELL_UNITS, flowerLabel } from './flowerSudoku.mjs';
export const FLOWER_CENTER = 400;
export const FLOWER_OUTER_RADIUS = 360;
const isOuterArc = (key) => key.startsWith(`arc:${FLOWER_OUTER_RADIUS}:`);
export function flowerPolar(radius, angle) {
  const rad = angle * Math.PI / 180;
  return { x: FLOWER_CENTER + radius * Math.cos(rad), y: FLOWER_CENTER + radius * Math.sin(rad) };
}
const normalize = (angle) => (angle + 360) % 360;
function edgeSegment(from, to, layout) {
  if (layout !== 'petals') return `L${to.x},${to.y}`;
  const dx = to.x-from.x, dy = to.y-from.y;
  const mx = (from.x+to.x)/2, my = (from.y+to.y)/2;
  // Choose the chord normal facing away from the hub. Reversing the
  // endpoints produces the same curve for the neighbouring cell.
  const direction = (-dy*(mx-FLOWER_CENTER)+dx*(my-FLOWER_CENTER)) >= 0 ? 1 : -1;
  return `Q${mx-dy*0.16*direction},${my+dx*0.16*direction} ${to.x},${to.y}`;
}
export function flowerCircleRotation(circle, layout = 'circular') {
  return layout === 'petals' && circle % 2 === 1 ? -18 : 0;
}
export function flowerGeometry(index, layout = 'circular') {
  const label = flowerLabel(index), layer = FLOWER_LAYERS.indexOf(label[0]), petal = Number(label.slice(1));
  const angle = -90 + (petal - 1) * 18, start = angle - 9, end = angle + 9;
  const inner = 100 + layer * 52, outer = inner + 52;
  const innerOffset = flowerCircleRotation(layer + 1, layout), outerOffset = flowerCircleRotation(layer + 2, layout);
  // Alternating triangles use every other intersection on each circle.
  // Odd A/C/E cells close outward; odd B/D cells open outward. Their even
  // neighbours reverse direction and share the very same diagonal edge.
  const opensOutward = (layer + petal) % 2 === 0;
  const innerStart = layout==='petals' ? angle-(opensOutward?0:18) : start;
  const innerEnd = layout==='petals' ? angle+(opensOutward?0:18) : end;
  const outerStart = layout==='petals' ? angle-(opensOutward?18:0) : start;
  const outerEnd = layout==='petals' ? angle+(opensOutward?18:0) : end;
  const a = flowerPolar(outer,outerStart), b = flowerPolar(outer,outerEnd), c = flowerPolar(inner,innerEnd), d = flowerPolar(inner,innerStart);
  const edges = [
    ...(outerStart===outerEnd?[]:[{ key:`arc:${outer}:${normalize(outerStart)}:${outerEnd-outerStart}`, path:`M${a.x},${a.y} A${outer},${outer} 0 0 1 ${b.x},${b.y}` }]),
    { key:`radial:${inner}:${normalize(innerEnd)}:${normalize(outerEnd)}`, path:`M${b.x},${b.y} ${edgeSegment(b,c,layout)}` },
    ...(innerStart===innerEnd?[]:[{ key:`arc:${inner}:${normalize(innerStart)}:${innerEnd-innerStart}`, path:`M${c.x},${c.y} A${inner},${inner} 0 0 0 ${d.x},${d.y}` }]),
    { key:`radial:${inner}:${normalize(innerStart)}:${normalize(outerStart)}`, path:`M${d.x},${d.y} ${edgeSegment(d,a,layout)}` },
  ];
  const innerCenter=flowerPolar(inner,angle), outerCenter=flowerPolar(outer,angle);
  const center = layout==='petals'
    ? flowerPolar(inner+(outer-inner)*(opensOutward?2/3:1/3),angle)
    : {x:(innerCenter.x+outerCenter.x)/2,y:(innerCenter.y+outerCenter.y)/2};
  return { center, angleWidth:18, edges, innerOffset, outerOffset, vertices:[a,b,c,d], leftTurn:outerStart-innerStart, rightTurn:outerEnd-innerEnd,
    outline:edges.filter(edge=>!isOuterArc(edge.key)).map(edge=>edge.path).join(' '),
    path:`M${a.x},${a.y} ${outerStart===outerEnd?'':`A${outer},${outer} 0 0 1 ${b.x},${b.y}`} ${edgeSegment(b,c,layout)} ${innerStart===innerEnd?'':`A${inner},${inner} 0 0 0 ${d.x},${d.y}`} ${edgeSegment(d,a,layout)} Z` };
}
function createLayout(layout) {
 const geometries = Array.from({length:FLOWER_CELL_COUNT},(_,i)=>flowerGeometry(i,layout));
 const edgeOwners = new Map();
 geometries.forEach((geometry,cell)=>{
  const region = FLOWER_CELL_UNITS[cell].find((id)=>id>=20);
  for (const edge of geometry.edges) {
    const owners = edgeOwners.get(edge.key) || [];
    owners.push({cell,region,path:edge.path}); edgeOwners.set(edge.key,owners);
  }
 });
 const borders = [...edgeOwners.entries()].filter(([key,owners])=>!isOuterArc(key) && (owners.length===1 || owners[0].region!==owners[1].region)).map(([,owners])=>owners[0].path);
 return {geometries,borders};
}
export const FLOWER_LAYOUTS = { circular:createLayout('circular'), petals:createLayout('petals') };
export const FLOWER_GEOMETRIES = FLOWER_LAYOUTS.circular.geometries;
export const FLOWER_REGION_BORDERS = FLOWER_LAYOUTS.circular.borders;
export function flowerHighlightMask(selected, cell) {
  const selectedUnits = FLOWER_CELL_UNITS[selected], units = FLOWER_CELL_UNITS[cell];
  let mask = 0;
  for (const unit of selectedUnits) if (units.includes(unit)) mask |= unit>=20 ? 4 : unit%2 ? 2 : 1;
  return mask;
}
