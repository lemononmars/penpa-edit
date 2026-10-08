import {pentagramPosition} from './pentagram.mjs';
// With the Pentagram's 600-unit canvas printed 190 mm wide, the centres
// of columns 2 and 7 on its bottom edges are these two attachment points.
const left=pentagramPosition(3,1,3/8),right=pentagramPosition(2,3/8,1);
const attachmentMm=(right.x-left.x)*190/600;
const flowerTipSpan=2*360*Math.sin(18*Math.PI/180);
export const FLOWER_PRINT_WIDTH_MM=attachmentMm/flowerTipSpan*800;
