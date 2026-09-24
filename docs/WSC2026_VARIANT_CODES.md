# WSC 2026 variant code review

This document lists the variant IDs added for the WSC 2026 booklet and the saved-puzzle clue payloads accepted by the solver. It is intended for code review; coordinates are zero-based `{ "row": 0, "col": 0 }` values.

The main solver no longer shows a dedicated WSC clue editor. Variants that can be inferred from ordinary Penpa marks still use those marks. Structured clues can be stored in `pu_q.wsc2026Clues`, keyed by variant ID:

```json
{
  "wsc2026Clues": {
    "trishula": [
      {
        "cells": [{ "row": 4, "col": 3 }, { "row": 4, "col": 4 }],
        "tips": [{ "row": 2, "col": 4 }, { "row": 4, "col": 6 }, { "row": 6, "col": 4 }]
      }
    ]
  }
}
```

## New rule IDs

### Team-round additions (booklet v2)

Round 8's `pips` uses the Classic 6x6 solver; count the pips in each cell and enter that digit. Existing solver IDs cover most of the standard-grid variants in rounds 9 and 13–15. These new IDs use the WSC rule verifier:

| Variant ID | Clue shape |
| --- | --- |
| `division` | `{ "cells": [cell, cell], "value": quotient }` |
| `nonconsecutiveonline` | `{ "cells": [ordered line cells...] }` |
| `weightedkiller` | `{ "cells": [cage cells...], "shaded": [shaded cage cells...], "value": weighted total }` |
| `258` | Global; all 81 cells are supplied automatically |
| `differences` | `{ "cells": [cell, cell], "value": absolute difference }` |
| `entropiclines` | `{ "cells": [ordered line cells...] }` |
| `insideskyscraper` | `{ "cells": [arrow cell, ray cells...] }` |
| `pointingdigits` | `{ "cells": [arrow cell, ray cells...] }` |
| `threeup` | `{ "cells": [arrow cell, next cell, third cell] }` |

The Layout solver tab accepts explicit cells and units for Flower, Pentagram and Shifted layouts. For an eight-digit Pentagram, set `digitCount` to 9, make each row, column and region an eight-cell unit, and list their unit indices in `sharedDigitSetGroups`. Team-wide transfers, rotations and variant matching still require author-supplied linking information; booklet illustrations are not automatically transcribed.

| Variant ID | Display name | Accepted clue shape |
| --- | --- | --- |
| `hundred` | Hundred | `{ "groups": [[cell, ...], ...] }` |
| `flamepath` | Flame Path | Global; all 81 cells are supplied automatically |
| `fractal` | Fractal | Global; all 81 cells are supplied automatically |
| `disguisedqueen` | Disguised Queen | Global; all 81 cells are supplied automatically |
| `antiwindoku` | Anti Windoku | Global; all 81 cells are supplied automatically |
| `nothreeinaline` | No Three in A Line | `{ "cells": [cell, ...] }`, at least three ordered cells |
| `clonealongline` | Clone Along Line | `{ "cells": [...], "other": [...] }`, equal lengths |
| `tunnel` | Tunnel | `{ "cells": [cell, ...] }`, at least three ordered cells |
| `number5stillalive` | Number 5 Still Alive | `{ "cells": [cell, ...] }` |
| `missingarrow` | Missing Arrow | `{ "cells": [circle, shaft1, ...] }` |
| `missingthermo` | Missing Thermo | `{ "cells": [...], "paths": [[...], ...] }`; `paths` is optional for an unbranched thermo |
| `transparentkropkipairs` | Transparent Kropki Pairs | `{ "cells": [cell, cell] }` |
| `unordereddistances` | Unordered Distances | `{ "cells": [...], "x": 2, "y": 7, "distance": 4 }` |
| `nexttox` | Next to x | `{ "clues": [{ "cells": [...], "value": "35" }] }` |
| `anticlone` | Anti Clone | `{ "cells": [...], "other": [...] }`, equal lengths |
| `friends` | Friends | `{ "cells": [cell, ...] }` |
| `enemies` | Enemies | `{ "cells": [cell, ...] }` |
| `antioutside` | Anti Outside | `{ "cells": [sightline...], "digits": [2, 6] }` |
| `sudokuwithnames` | Sudoku with Names | `{ "cells": [sightline...], "digits": [mapped letters...] }` |
| `sforsudoku` | S for | `{ "cells": [...], "allowed": [2, 3, 6, 7] }` |
| `attacktheleader` | Attack the Leader | `{ "origin": cell, "directions": ["up", "right"], "cells": [all 81 cells] }` |
| `trishula` | Trishula | `{ "cells": [handle...], "tips": [cell, cell, cell] }` |
| `divisorsumpairs` | Divisor Sum Pairs | `{ "cells": [cell, cell], "value": 3 }` |
| `magicsword` | Magic Sword | `{ "clues": [{ "cells": [sightline...], "value": 4 }] }` |
| `neighbouringdisparity` | Neighbouring Disparity | `{ "origin": cell, "cells": [indicated neighbours...] }` |
| `indextoone` | Index to One | `{ "cells": [sightline...], "value": 4 }` |
| `primerunsum` | Prime Run Sum | `{ "cells": [sightline...], "value": 17 }` |
| `even` | Even | `{ "cells": [cell, ...] }` |
| `odd` | Odd | `{ "cells": [cell, ...] }` |
| `wscescape` | Escape (WSC 2026) | Global; all 81 cells are supplied automatically |

`creasing`, `palindrome`, and `multidiagonal` use the same `{ "cells": [...] }` payload and were promoted into the WSC set from existing rule concepts.

## Composite Hundred IDs

These IDs combine the existing base constraint with `hundred`; they do not introduce another clue schema.

```text
disjointhundred
edgedifferencehundred
antidiagonalhundred
outside234hundred
inequalityhundred
sequencehundred
skyscraperhundred
```

## Non-square layout IDs

These route to the WSC layout solver and use explicit cells, rows, columns, regions, givens, and optional clone-line geometry rather than the normal 9x9 parser.

```text
expanded
samurai
star
```

## Representative structured payloads

```json
{
  "clonealongline": [{
    "cells": [{ "row": 1, "col": 1 }, { "row": 1, "col": 2 }],
    "other": [{ "row": 6, "col": 7 }, { "row": 6, "col": 8 }]
  }],
  "missingthermo": [{
    "cells": [{ "row": 4, "col": 4 }, { "row": 3, "col": 4 }, { "row": 2, "col": 3 }, { "row": 2, "col": 5 }],
    "paths": [
      [{ "row": 4, "col": 4 }, { "row": 3, "col": 4 }, { "row": 2, "col": 3 }],
      [{ "row": 3, "col": 4 }, { "row": 2, "col": 5 }]
    ]
  }],
  "unordereddistances": [{
    "cells": [{ "row": 0, "col": 0 }, { "row": 0, "col": 1 }, { "row": 0, "col": 2 }],
    "x": 2,
    "y": 7,
    "distance": 2
  }],
  "attacktheleader": [{
    "origin": { "row": 4, "col": 4 },
    "directions": ["up", "left"],
    "cells": [{ "row": 0, "col": 0 }]
  }]
}
```

For `attacktheleader`, production data supplies all 81 cells in `cells`; the shortened array above keeps the example readable but is not a valid final payload.

## Solver and verifier code

The executable implementations are in `docs/js/sudoku_variants/parsers/wsc_descriptor.js` and `docs/js/sudoku_variants/wsc_rules.js`. The parser converts ordinary Penpa marks into normalized clues; the verifier runs during search and on the completed board.

```js
// arrow_eight stores one bit per direction, preserving several arrows in one cell.
const names = ['left', 'up-left', 'up', 'up-right', 'right',
  'down-right', 'down', 'down-left'];
const directions = bits
  .map((enabled, index) => enabled === 1 ? names[index] : null)
  .filter(Boolean);
```

```js
// Attack the Leader checks the first higher digit on all eight rays and
// requires arrows for every ray tied at the shortest distance.
const rays = [
  ['left', 0, -1], ['up-left', -1, -1], ['up', -1, 0],
  ['up-right', -1, 1], ['right', 0, 1], ['down-right', 1, 1],
  ['down', 1, 0], ['down-left', 1, -1]
];
const minimum = Math.min(...Object.values(distances));
return Object.entries(distances).every(([direction, distance]) =>
  clue.directions.includes(direction) ===
    (distance === minimum && distance !== Infinity));
```

```js
// Neighbouring Disparity converts the two allowed symbols into neighbour sets.
const offsets = symbol === 'square_L'
  ? [[-1,-1], [-1,1], [1,-1], [1,1]]       // diagonal
  : [[-1,0], [0,1], [1,0], [0,-1]];         // rotated square: orthogonal
return neighbours.every(cell =>
  !digit(cell) || digit(cell) % 2 !== digit(origin) % 2);
```

```js
// Trishula accepts min, average, and max at its three tips in any order.
const expected = [Math.min(...handle), average(handle), Math.max(...handle)]
  .sort((a, b) => a - b);
return tips.slice().sort((a, b) => a - b)
  .every((digit, index) => digit === expected[index]);
```

The remaining WSC cases are in the same `validate(board, clue)` switch. Regression coverage lives in `test/wsc2026.test.js`; shared 8-way directional parsing is covered in `test/sudoku_solver.test.js`.
