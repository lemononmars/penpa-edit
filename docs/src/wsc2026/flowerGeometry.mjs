import { FLOWER_CELL_COUNT, FLOWER_LAYERS, FLOWER_CELL_UNITS, flowerLabel } from './flowerSudoku.mjs';
export const FLOWER_CENTER = 400;
export function flowerPolar(radius, angle) {
  const rad = angle * Math.PI / 180;
  return { x: FLOWER_CENTER + radius * Math.cos(rad), y: FLOWER_CENTER + radius * Math.sin(rad) };
}
const normalize = (angle) => (angle + 360) % 360;
export function flowerGeometry(index) {
  const label = flowerLabel(index), layer = FLOWER_LAYERS.indexOf(label[0]), petal = Number(label.slice(1));
  const angle = -90 + (petal - 1) * 18, start = angle - 9, end = angle + 9;
  const inner = 100 + layer * 52, outer = inner + 52;
  const a = flowerPolar(outer,start), b = flowerPolar(outer,end), c = flowerPolar(inner,end), d = flowerPolar(inner,start);
  const edges = [
    { key:`arc:${outer}:${normalize(start)}`, path:`M${a.x},${a.y} A${outer},${outer} 0 0 1 ${b.x},${b.y}` },
    { key:`radial:${inner}:${normalize(end)}`, path:`M${b.x},${b.y} L${c.x},${c.y}` },
    { key:`arc:${inner}:${normalize(start)}`, path:`M${c.x},${c.y} A${inner},${inner} 0 0 0 ${d.x},${d.y}` },
    { key:`radial:${inner}:${normalize(start)}`, path:`M${d.x},${d.y} L${a.x},${a.y}` },
  ];
  return { center:flowerPolar((inner+outer)/2,angle), angleWidth:18, edges,
    path:`M${a.x},${a.y} A${outer},${outer} 0 0 1 ${b.x},${b.y} L${c.x},${c.y} A${inner},${inner} 0 0 0 ${d.x},${d.y} Z` };
}
export const FLOWER_GEOMETRIES = Array.from({length:FLOWER_CELL_COUNT},(_,i)=>flowerGeometry(i));
const edgeOwners = new Map();
FLOWER_GEOMETRIES.forEach((geometry,cell)=>{
  const region = FLOWER_CELL_UNITS[cell].find((id)=>id>=20);
  for (const edge of geometry.edges) {
    const owners = edgeOwners.get(edge.key) || [];
    owners.push({cell,region,path:edge.path}); edgeOwners.set(edge.key,owners);
  }
});
export const FLOWER_REGION_BORDERS = [...edgeOwners.values()].filter((owners)=>owners.length===1 || owners[0].region!==owners[1].region).map((owners)=>owners[0].path);
export function flowerHighlightMask(selected, cell) {
  const selectedUnits = FLOWER_CELL_UNITS[selected], units = FLOWER_CELL_UNITS[cell];
  let mask = 0;
  for (const unit of selectedUnits) if (units.includes(unit)) mask |= unit>=20 ? 4 : unit%2 ? 2 : 1;
  return mask;
}
