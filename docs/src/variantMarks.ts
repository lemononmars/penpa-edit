import { variantMetadata, type Variation } from "./variationCatalog";

export type MarkPosition = "none" | "center" | "edge" | "corner" | "outside" | "multiple";

export type PenpaMark = {
    id: string;
    name: string;
    family: string;
    positions: MarkPosition[];
    penpaMode: string;
    description: string;
};

export type VariantMarkChoice = {
    position: MarkPosition;
    mark: string;
};

export type MarkConfig = {
    version: number;
    overrides: Record<string, VariantMarkChoice>;
};

export const positions: Array<{ id: MarkPosition; name: string; description: string }> = [
    { id: "none", name: "No placed mark", description: "The rule is global or is represented by the Sudoku grid itself." },
    { id: "center", name: "Cell center", description: "The mark is anchored to one cell or follows cell centers." },
    { id: "edge", name: "Cell edge", description: "The mark sits between two orthogonally adjacent cells." },
    { id: "corner", name: "Cell corner", description: "The mark sits at the intersection of four cells." },
    { id: "outside", name: "Outside grid", description: "The clue is entered in the margin beyond the Sudoku grid." },
    { id: "multiple", name: "Multiple / manual", description: "The variant needs more than one mark or placement; configure it manually." }
];

export const penpaMarks: PenpaMark[] = [
    { id: "none", name: "None", family: "Rule", positions: ["none"], penpaMode: "Sudoku", description: "No drawable clue; the CSP applies the rule globally." },
    { id: "multiple", name: "Multiple / manual", family: "Manual", positions: ["multiple"], penpaMode: "Multiple", description: "A deliberate placeholder for variants that combine marks, orientations, or clue types." },
    { id: "surface", name: "Cell shading", family: "Surface", positions: ["center"], penpaMode: "Surface", description: "A colored or shaded cell surface." },
    { id: "circle", name: "Circle", family: "Shape", positions: ["center", "edge", "corner"], penpaMode: "Shape · circle_L", description: "Large Penpa circle, with its style or color carrying the clue meaning." },
    { id: "square", name: "Square", family: "Shape", positions: ["center", "edge", "corner"], penpaMode: "Shape · square_L", description: "Large Penpa square, with its style or color carrying the clue meaning." },
    { id: "diamond", name: "Diamond", family: "Shape", positions: ["center", "edge", "corner"], penpaMode: "Shape · diamond", description: "Diamond symbol at a cell, edge midpoint, or corner." },
    { id: "triangle", name: "Triangle", family: "Shape", positions: ["center", "edge", "corner"], penpaMode: "Shape · tri*", description: "Directional triangle shape (up, down, left, or right)." },
    { id: "bars", name: "Bars", family: "Shape", positions: ["center", "edge"], penpaMode: "Shape · bars", description: "Bar symbol; orientation is chosen manually when horizontal and vertical forms differ." },
    { id: "math", name: "Math symbol", family: "Shape", positions: ["center", "edge", "corner"], penpaMode: "Shape · math", description: "Mathematical relation or operator symbol." },
    { id: "text", name: "Text / number", family: "Number", positions: ["center", "edge", "corner", "outside"], penpaMode: "Number", description: "Digits, letters, totals, inequalities, or other text clues." },
    { id: "line", name: "Center line", family: "Line", positions: ["center"], penpaMode: "Line", description: "A path drawn through cell centers." },
    { id: "edge-line", name: "Edge line", family: "Line", positions: ["edge"], penpaMode: "Edge", description: "A line drawn along cell boundaries or between cells." },
    { id: "wall", name: "Wall", family: "Line", positions: ["edge"], penpaMode: "Wall", description: "A heavy boundary segment on a cell edge." },
    { id: "thermo", name: "Thermometer", family: "Special", positions: ["center"], penpaMode: "Special · thermo", description: "A bulb and connected center-line stem." },
    { id: "arrow", name: "Arrow", family: "Special", positions: ["center", "outside"], penpaMode: "Special · arrows", description: "An arrow with a circular origin and shaft." },
    { id: "direction", name: "Direction arrow", family: "Special", positions: ["center", "outside"], penpaMode: "Special · direction", description: "A directional arrow without an arithmetic bulb." },
    { id: "frame", name: "Square frame", family: "Special", positions: ["center"], penpaMode: "Special · squareframe", description: "A frame enclosing one or more cells." },
    { id: "polygon", name: "Polygon", family: "Special", positions: ["center"], penpaMode: "Special · polygon", description: "A filled or outlined freeform polygon." },
    { id: "cage", name: "Cage", family: "Cage", positions: ["center"], penpaMode: "Cage", description: "An outlined group of cells, optionally with a corner total." }
];

export const bundledMarkConfig: MarkConfig = {
    version: 1,
    overrides: variantMetadata.markOverrides as MarkConfig["overrides"]
};

function has(text: string, pattern: RegExp) {
    return pattern.test(text);
}

/** Provides a conservative default that can be corrected through the dev-only editor. */
export function inferredMarkChoice(variation: Variation): VariantMarkChoice {
    const text = `${variation.name} ${variation.rule}`.toLowerCase();
    if (variation.inputType.categories.includes("shading")) return { position: "center", mark: "surface" };
    if (variation.inputType.categories.includes("cage")) return { position: "center", mark: "cage" };
    if (["anti king", "anti knight", "disjoint", "queen", "disparity", "liardiagonal", "magicsquares", "onefivenine"].includes(variation.value)) {
        return { position: "none", mark: "none" };
    }
    if (["biggestneighbours", "smallestneighbours", "eliminate", "pointtonext", "pointtoprevious", "search6", "search9", "sumdetector"].includes(variation.value)) {
        return { position: "center", mark: "direction" };
    }
    if (["quadmax", "quadmin"].includes(variation.value)) {
        return { position: "corner", mark: "direction" };
    }
    if (variation.value === "coded") return { position: "corner", mark: "text" };
    if (variation.value === "pencilmarks") return { position: "center", mark: "text" };
    if (["xydifference", "primesums", "twodigitprimenumbers"].includes(variation.value)) return { position: "edge", mark: "diamond" };
    if (variation.value === "xivi") return { position: "edge", mark: "text" };
    if (variation.value === "clock") return { position: "center", mark: "cage" };
    if (variation.value === "slotmachine") return { position: "center", mark: "surface" };
    if (["wheel", "pinnochio", "little killer", "product little killer", "bouncing x-sums", "czech outsider"].includes(variation.value)) {
        return { position: "multiple", mark: "multiple" };
    }
    if (variation.value === "mastermind") {
        return { position: "outside", mark: "multiple" };
    }
    if (["diagonal sum is nine", "diagonal tens"].includes(variation.value)) {
        return { position: "corner", mark: "bars" };
    }
    if (variation.value === "distances") {
        return { position: "outside", mark: "text" };
    }
    if (["productkiller", "solokiller"].includes(variation.value)) return { position: "center", mark: "cage" };
    if (variation.value === "consecutive" || variation.value === "evensumpairs") {
        return { position: "edge", mark: "circle" };
    }
    const multiSignals = [
        /horizontal.+vertical|vertical.+horizontal/, /black.+white|white.+black/,
        /circle.+square|square.+circle/, /circle.+cross|cross.+circle/, /different (?:symbols|marks)/, /one of (?:the )?following/
    ];
    if (multiSignals.some((pattern) => has(text, pattern))) return { position: "multiple", mark: "multiple" };
    if (variation.tags?.includes("region")) return { position: "center", mark: "cage" };
    if (variation.tags?.includes("outside") || has(text, /outside (?:the )?grid|outside clue/)) {
        return { position: "outside", mark: has(text, /arrow/) ? "arrow" : "text" };
    }
    if (has(text, /thermometer|thermo/)) return { position: "center", mark: "thermo" };
    if (has(text, /arrow/)) return { position: "center", mark: "arrow" };
    if (has(text, /cage|outlined region/)) return { position: "center", mark: "cage" };
    if (has(text, /line|path|renban|palindrome/)) return { position: "center", mark: "line" };
    if (has(text, /between (?:two )?(?:orthogonally )?adjacent cells|between adjacent cells|shared edge/)) {
        if (has(text, /bar/)) return { position: "edge", mark: "bars" };
        if (has(text, /circle|dot/)) return { position: "edge", mark: "circle" };
        return { position: "edge", mark: has(text, /number|digit|sum|difference|product|ratio/) ? "text" : "edge-line" };
    }
    if (has(text, /intersection|four cells|2x2 area/)) return { position: "corner", mark: has(text, /circle|dot/) ? "circle" : "text" };
    if (has(text, /shaded|colou?red|painted/)) return { position: "center", mark: "surface" };
    if (has(text, /circle|dot/)) return { position: "center", mark: "circle" };
    if (has(text, /square/)) return { position: "center", mark: "square" };
    if (has(text, /diamond/)) return { position: "center", mark: "diamond" };
    if (has(text, /triangle/)) return { position: "center", mark: "triangle" };
    if (has(text, /marked|symbol|clue|number/)) return { position: "center", mark: "text" };
    return { position: "none", mark: "none" };
}

export function markChoiceFor(variation: Variation, config: MarkConfig = bundledMarkConfig) {
    return config.overrides[variation.value] || inferredMarkChoice(variation);
}

export function inputModesFor(variation: Variation) {
    if (variation.inputType.instructions.length) return variation.inputType.instructions;
    const choice = markChoiceFor(variation);
    if (choice.position === "none") return ["No placed input", "The constraint is generated from grid geometry."];
    return [`${choice.position} · ${choice.mark}`, penpaMarks.find((mark) => mark.id === choice.mark)?.penpaMode || choice.mark];
}

/** Human-readable source shown on each generated variant reference page. */
function cspImplementationFor(variation: Variation) {
    const implementations: Record<string, string> = {
        classic: `validatePartial(board) {\n  return rows(board).every(assignedDigitsAreDistinct)\n    && columns(board).every(assignedDigitsAreDistinct)\n    && boxes(board).every(assignedDigitsAreDistinct);\n}`,
        "anti diagonal": `validatePartial(board, diagonal) {\n  const counts = digitCounts(board, diagonal);\n  return Object.keys(counts).length <= 3 && Object.values(counts).every(count => count <= 3);\n}\nvalidateComplete(board, diagonal) {\n  return Object.values(digitCounts(board, diagonal)).sort().join() === "3,3,3";\n}`,
        nothreeinarow: `validatePartial(board, triple) {\n  const values = triple.map(cell => cellValue(board, cell));\n  return values.some(value => !value) || new Set(values.map(value => value % 2)).size > 1;\n}`,
        arithmetic: `validatePartial(board, clue) {\n  const [a, b] = clue.cells.map(cell => cellValue(board, cell));\n  if (!a || !b) return true;\n  return a + b === clue.value || Math.abs(a - b) === clue.value || a * b === clue.value\n    || (a % b === 0 && a / b === clue.value) || (b % a === 0 && b / a === clue.value);\n}`,
        starproduct: `validatePartial(board, clue, helpers) {\n  const starValues = clue.cells.filter(c => helpers.isStarCell(c, clue.starCells)).map(c => cellValue(board, c));\n  const product = starValues.reduce((total, value) => total * (value || 1), 1);\n  const open = starValues.filter(value => !value).length;\n  return product <= clue.value && clue.value % product === 0 && (open > 0 || product === clue.value);\n}`,
        productframe: `validatePartial(board, clue) {\n  const values = clue.cells.slice(0, 3).map(cellValue);\n  const product = values.filter(Boolean).reduce((total, value) => total * value, 1);\n  return product <= clue.value && clue.value % product === 0 && (values.some(value => !value) || product === clue.value);\n}`,
        rossini: `validatePartial(board, clue) {\n  const [a, b, c] = clue.cells.map(cellValue);\n  if (!a || !b || !c) return true;\n  const ascending = a < b && b < c, descending = a > b && b > c;\n  return clue.direction === "ascending" ? ascending : clue.direction === "descending" ? descending : !ascending && !descending;\n}`,
        edgedifference: `validatePartial(board, clue) {\n  const first = cellValue(board, clue.cells[0]);\n  const last = cellValue(board, clue.cells.at(-1));\n  return !first || !last || Math.abs(first - last) === clue.value;\n}`,
        fullrank: `validatePartial(board, lines) {\n  const numbers = lines.map(line => line.cells.map(cellValue).join(""));\n  if (numbers.some(number => number.includes("0"))) return true;\n  const ordered = numbers.slice().sort((a, b) => Number(a) - Number(b));\n  return lines.every((line, index) => line.rank == null || numbers[index] === ordered[line.rank - 1]);\n}`,
        outsideparity: `validatePartial(board, clue) {\n  const values = clue.cells.map(cellValue), prefix = values.slice(0, clue.value).filter(Boolean);\n  return prefix.every(value => value % 2 === prefix[0] % 2)\n    && (!values[clue.value] || !prefix.length || values[clue.value] % 2 !== prefix[0] % 2);\n}`,
        parityparty: `validatePartial(board, clue) {\n  return prefixThroughFirstParityCanSum(board, clue.cells, 0, clue.value)\n    || prefixThroughFirstParityCanSum(board, clue.cells, 1, clue.value);\n}`,
        serbianframe: `validatePartial(board, clue) {\n  const indexes = clue.axis === "row" ? [1, 2] : [2, 3];\n  const values = indexes.map(index => cellValue(board, clue.cells[index]));\n  return values.some(value => !value) || values[0] + values[1] === clue.value;\n}`,
        median: `validatePartial(board, clue) {\n  const values = clue.cells.slice(0, 3).map(cellValue);\n  return values.some(value => !value) || values.sort((a, b) => a - b)[1] === clue.value;\n}`,
        xydifference: `validatePartial(board, clue) {\n  const [a, b] = clue.cells.map(cellValue), reference = cellValue(board, clue.reference);\n  return !a || !b || !reference || Math.abs(a - b) === reference;\n}`,
        primesums: `validatePartial(board, clue) {\n  const [a, b] = clue.cells.map(cellValue);\n  if (!a || !b) return true;\n  const sum = a + b;\n  const isPrime = [2, 3, 5, 7, 11, 13, 17].includes(sum);\n  return clue.marked ? isPrime : !isPrime;\n}`,
        twodigitprimenumbers: `validatePartial(board, clue) {\n  const [a, b] = clue.cells.map(cellValue);\n  if (!a || !b) return true;\n  const value = 10 * a + b;\n  const isPrime = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97].includes(value);\n  return clue.marked ? isPrime : !isPrime;\n}`,
        average: `validatePartial(board, clue) {\n  const center = cellValue(board, clue.center), ends = clue.ends.map(cellValue);\n  if (!center || ends.some(value => !value)) return true;\n  return clue.marked === (center * 2 === ends[0] + ends[1]);\n}`,
        fortress: `validatePartial(board, clue) {\n  const shaded = cellValue(board, clue.shaded), unshaded = cellValue(board, clue.unshaded);\n  return !shaded || !unshaded || shaded > unshaded;\n}`,
        inequality: `validatePartial(board, clue) {\n  const [a, b] = clue.cells.map(cellValue);\n  return !a || !b || (clue.sign === "<" ? a < b : a > b);\n}`,
        trio: `validatePartial(board, clue) {\n  const value = cellValue(board, clue.cell);\n  return !value || (value >= clue.minimum && value <= clue.maximum);\n}`,
        perfectsquares: `validatePartial(board, clue) {\n  const [a, b] = clue.cells.map(cellValue);\n  if (!a || !b) return true;\n  const perfect = [16, 25, 36, 49, 64, 81].includes(10 * a + b);\n  return clue.marked ? perfect : !perfect;\n}`,
        clockfaces: `validateComplete(board, clue) {\n  const clockwise = clockwiseCells(clue.cells).map(cellValue);\n  const increasingClockwise = circularDescentCount(clockwise) === 1;\n  const increasingCounterclockwise = circularDescentCount(clockwise.toReversed()) === 1;\n  return clue.kind === "white" ? increasingClockwise : clue.kind === "black" ? increasingCounterclockwise\n    : !increasingClockwise && !increasingCounterclockwise;\n}`,
        exclusion: `validatePartial(board, clue) {\n  const values = clue.cells.map(cellValue).filter(Boolean);\n  return clue.digits.every(digit => !values.includes(digit));\n}`,
        groupsum: `validatePartial(board, clue) {\n  const values = clue.cells.map(cellValue), sum = values.reduce((total, value) => total + value, 0);\n  const blanks = values.filter(value => !value).length;\n  return sum <= clue.total && sum + blanks * board.length >= clue.total && (blanks || sum === clue.total);\n}`,
        coded: `function differentCodesUseDifferentDigits(board, groups) {\n  const assignedDigits = groups.map(group => group.map(cell => cellValue(board, cell)).find(Boolean)).filter(Boolean);\n  return new Set(assignedDigits).size === assignedDigits.length;\n}\nvalidatePartial(board, clue) {\n  const eachCodeUsesOneDigit = clue.groups.every(group => {\n    const values = group.map(cell => cellValue(board, cell)).filter(Boolean);\n    return values.every(value => value === values[0]);\n  });\n  return eachCodeUsesOneDigit && differentCodesUseDifferentDigits(board, clue.groups);\n}`,
        mirror: `validatePartial(board, group) {\n  const values = group.map(cellValue).filter(Boolean);\n  return values.every(value => value === values[0]);\n}`,
        pencilmarks: `validatePartial(board, clue) {\n  const value = cellValue(board, clue.cell);\n  return !value || clue.allowed.includes(value);\n}`,
        symmetricunequal: `validatePartial(board, pair) {\n  const [a, b] = pair.map(cellValue);\n  return !a || !b || a !== b;\n}`,
        smallestneighbours: `validatePartial(board, clue) {\n  return clue.targets.every(target => everyNeighbourIsAtLeast(board, target));\n}`,
        stretchedthermo: `validatePartial(board, path) {\n  return assignedDigitsAreNonDecreasing(board, path);\n}`,
        productkiller: `validatePartial(board, cage) {\n  return digitsDoNotRepeat(board, cage.cells) && productBoundsContain(board, cage.cells, cage.total);\n}`,
        solokiller: `validatePartial(board, cages) {\n  return completedCageSumsAgree(board, cages) && partialSumsCanReachTheCommonTotal(board, cages);\n}`,
        bust: `validatePartial(board, clue) {\n  return firstPrefixExceeding(board, clue.cells, 21) === clue.value || prefixIsStillOpen(board, clue);\n}`,
        xsums: `validatePartial(board, clue) {\n  const x = cellValue(board, clue.cells[0]);\n  return !x || prefixSumCanEqual(board, clue.cells, x, clue.value);\n}`,
        numberedrooms: `validatePartial(board, clue) {\n  const x = cellValue(board, clue.cells[0]);\n  return !x || !cellValue(board, clue.cells[x - 1]) || cellValue(board, clue.cells[x - 1]) === clue.value;\n}`,
        sumframe: `validatePartial(board, clue) {\n  return sumBoundsContain(board, clue.cells, clue.value);\n}`,
        "little killer": `validatePartial(board, clue) {\n  return sumBoundsContain(board, clue.cells, clue.value);\n}`,
        "product little killer": `validatePartial(board, clue) {\n  return productBoundsContain(board, clue.cells, clue.value);\n}`,
        descriptivepairs: `validatePartial(board, clue) {\n  const x = Math.floor(clue.value / 10), y = clue.value % 10;\n  return cellCanEqual(board, clue.cells[y - 1], x) || cellCanEqual(board, clue.cells[x - 1], y);\n}`,
        outside: `validatePartial(board, clue) {\n  const values = clue.cells.map(cellValue).filter(Boolean);\n  return clue.clues.every(digit => values.includes(digit) || values.length < clue.cells.length);\n}`,
        outside234: `validatePartial(board, clue) {\n  const values = clue.cells.map(cellValue).filter(Boolean);\n  return clue.clues.every(digit => values.includes(digit) || values.length < clue.cells.length);\n}`,
        maximin: `validatePartial(board, clue) {\n  const values = clue.cells.slice(0, 3).map(cellValue);\n  return values.some(value => !value) || Math.max(...values) - Math.min(...values) === clue.value;\n}`,
        minimax: `validatePartial(board, clue) {\n  const values = clue.cells.slice(0, 3).map(cellValue);\n  return values.some(value => !value) || Math.max(...values) + Math.min(...values) === clue.value;\n}`,
        diagonallyconsecutive: `validatePartial(board, clue) {\n  const [a, b] = clue.cells.map(cellValue);\n  return !a || !b || clue.marked === (Math.abs(a - b) === 1);\n}`,
        multiplication: `validatePartial(board, cage) {\n  const factors = cage.top.map(cellValue), result = cage.bottom.map(cellValue);\n  return incomplete(factors.concat(result)) || factors.reduce((product, value) => product * value, 1) === Number(result.join(""));\n}`
        ,evensandwich: `validateComplete(board, clue) {\n  const values = clue.cells.map(cellValue);\n  const found = values.filter((value, index) => index > 0 && index < values.length - 1\n    && values[index - 1] % 2 === 0 && values[index + 1] % 2 === 0);\n  return sameDigits(found, clue.clues);\n}`,
        oddsandwich: `validateComplete(board, clue) {\n  const values = clue.cells.map(cellValue);\n  const found = values.filter((value, index) => index > 0 && index < values.length - 1\n    && values[index - 1] % 2 === 1 && values[index + 1] % 2 === 1);\n  return sameDigits(found, clue.clues);\n}`,
        clock: `validateComplete(board, cage) {\n  if (cage.cells.length !== 4 || !cellsFormOneHorizontalRun(cage.cells)) return true;\n  const [h1, h2, m1, m2] = cage.cells.map(cellValue);\n  return 10 * h1 + h2 < 24 && 10 * m1 + m2 < 60;\n}`,
        lc: `validatePartial(board, clue) {
  const [a, b, c, d] = clue.cells.map(cellValue);
  if (a && b && c && d) {
    const sum = (a * 10 + b) + (c * 10 + d);
    if (clue.kind === "L") return sum === 50;
    if (clue.kind === "C") return sum === 100;
    return sum !== 50 && sum !== 100;
  }
  return true;
}`,
        hiddenclone: `validateComplete(board, check) {
  const component = check.component;
  const assigned = [];
  for (let i = 0; i < component.length; i++) {
    assigned.push(cellValue(board, component[i]));
  }
  const SIZE = board.length;
  for (let dr = -SIZE + 1; dr < SIZE; dr++) {
    for (let dc = -SIZE + 1; dc < SIZE; dc++) {
      if (dr === 0 && dc === 0) continue;
      let match = true;
      for (let i = 0; i < component.length; i++) {
        const cell = component[i];
        const tr = cell.row + dr, tc = cell.col + dc;
        if (tr < 0 || tr >= SIZE || tc < 0 || tc >= SIZE) { match = false; break; }
        const tval = cellValue(board, { row: tr, col: tc });
        if (tval !== assigned[i]) { match = false; break; }
      }
      if (match) return true;
    }
  }
  return false;
}`,
        xivi: `validatePartial(board, clue) {\n  const [a, b] = clue.cells.map(cellValue);\n  if (!a || !b) return true;\n  const sum = a + b;\n  return clue.kind === "VI" ? sum === 6 : clue.kind === "XI" ? sum === 11 : sum !== 6 && sum !== 11;\n}`,
        slotmachine: `validatePartial(board, clue) {\n  return clue.columns.slice(1).every(column => someCyclicShiftMatchesAssignedDigits(board, clue.columns[0], column));\n}`,
        wheel: `validatePartial(board, clue) {\n  return someRotationMatchesAssignedDigits(board, clue.cells, clue.digits);\n}`,
        pinnochio: `validatePartial(board, clue) {\n  const comparisons = clue.clues.map(item => !cellValue(board, item.cell) ? "open"\n    : cellValue(board, item.cell) === item.value ? "true" : "false");\n  return comparisons.filter(value => value === "false").length <= 1\n    && (comparisons.includes("false") || comparisons.includes("open"));\n}`,
        sumdetector: `validatePartial(board, group) {\n  return range(1, board.length).some(n => group.clues.every(clue =>\n    clue.rays.every(ray => firstNDigitsCanSumTo(board, ray, n, cellValue(board, clue.origin)))));\n}`,
        "meandering diagonals": `validatePartial(board, path) {\n  const values = path.map(cellValue);\n  return assignedDigitsAreDistinct(values);\n}`,
        alternatingstripes: `validatePartial(board, path) {\n  const values = path.map(cellValue);\n  return assignedDigitsAreDistinct(values) && everyAssignedTripleAlternates(values);\n}`,
        between: `validatePartial(board, path) {\n  const values = path.map(cellValue), low = Math.min(values[0], values.at(-1)), high = Math.max(values[0], values.at(-1));\n  return !values[0] || !values.at(-1) || values.slice(1, -1).every(value => !value || (value > low && value < high));\n}`,
        blocksumrelations: `validatePartial(board, clue) {\n  const sums = clue.groups.map(group => group.map(cellValue));\n  return sums.some(incomplete) || compare(sums[0].sum(), clue.sign, sums[1].sum());\n}`,
        clonedstrands: `validatePartial(board, clue) {\n  return clue.strands.every(path => path.length === clue.strands[0].length)\n    && correspondingAssignedDigitsAgree(board, clue.strands);\n}`,
        codedpairs: `validatePartial(board, clue) {\n  const signatures = clue.pairs.map(pair => pair.map(cellValue).filter(Boolean).sort().join(","));\n  return signatures.some(signature => signature.split(",").length < 2) || signatures.every(signature => signature === signatures[0]);\n}`,
        crosssums: `validatePartial(board, clue) {\n  const [tl, tr, bl, br] = clue.cells.map(cellValue);\n  return [tl, tr, bl, br].some(value => !value) || tl + br === tr + bl;\n}`,
        detection: `validatePartial(board, clue) {\n  const digit = cellValue(board, clue.origin);\n  return !digit || clue.rays.every(ray => rayCanContain(board, ray, digit))\n    && clue.unmarkedRays.every(ray => !rayContains(board, ray, digit));\n}`,
        determinant: `validatePartial(board, clue) {\n  const [tl, tr, bl, br] = clue.cells.map(cellValue);\n  return [tl, tr, bl, br].some(value => !value) || tl * br - tr * bl === clue.total;\n}`,
        divisor: `validatePartial(board, clue) {\n  const [a, b] = clue.cells.map(cellValue);\n  return !a || !b || (10 * a + b) % clue.target === 0;\n}`,
        eitheror: `validatePartial(board, clue) {\n  const [a, b] = clue.cells.map(cellValue);\n  return !a || !b || a === clue.target || b === clue.target;\n}`,
        "bouncing x-sums": `validatePartial(board, clue) {\n  const x = cellValue(board, clue.cells[0]);\n  if (!x) return true;\n  const sum = clue.cells.slice(0, x).map(cellValue).reduce((t, v) => t + v, 0);\n  const blanks = clue.cells.slice(0, x).filter(v => !cellValue(board, v)).length;\n  return sum <= clue.value && sum + blanks * board.length >= clue.value && (!blanks || sum === clue.value);\n}`,
        "czech outsider": `validatePartial(board, clue) {\n  const digits = String(clue.value).split("").map(Number);\n  const counts = {};\n  digits.forEach(d => counts[d] = (counts[d] || 0) + 1);\n  const values = clue.cells.map(cellValue);\n  const blanks = values.filter(v => !v).length;\n  return Object.entries(counts).every(([d, target]) => {\n    const current = values.filter(v => v === Number(d)).length;\n    return current + blanks >= target && (blanks || current >= target);\n  });\n}`,
        "diagonal sum is nine": `validatePartial(board, clue) {\n  const [a, b] = clue.cells.map(cellValue);\n  return !a || !b || clue.marked === (a + b === 9);\n}`,
        "diagonal tens": `validatePartial(board, clue) {\n  const [a, b] = clue.cells.map(cellValue);\n  return !a || !b || clue.marked === (a + b === 10);\n}`,
        "disparity": `validatePartial(board, pair) {\n  const [a, b] = pair.map(cellValue);\n  return !a || !b || (a % 2) !== (b % 2);\n}`,
        "distances": `validatePartial(board, clue) {\n  const { x, y, z } = clue.value;\n  const values = clue.cells.map(cellValue);\n  const idxX = values.indexOf(x), idxY = values.indexOf(y);\n  if (idxX !== -1 && idxY !== -1) return idxX < idxY && idxY - idxX === z;\n  if (idxX !== -1) return idxX + z < values.length && (!values[idxX + z] || values[idxX + z] === y);\n  if (idxY !== -1) return idxY - z >= 0 && (!values[idxY - z] || values[idxY - z] === x);\n  return range(0, values.length - z).some(i => (!values[i] || values[i] === x) && (!values[i+z] || values[i+z] === y));\n}`,
        "faded kropki": `validatePartial(board, dot) {\n  const [a, b] = dot.cells.map(cellValue);\n  if (!a || !b) return true;\n  const consecutive = Math.abs(a - b) === 1, double = a === 2 * b || b === 2 * a;\n  return dot.kind === "white" ? consecutive || double : !consecutive && !double;\n}`,
        "first seen odd/even": `validatePartial(board, clue) {\n  const values = clue.cells.map(cellValue), isOddClue = (clue.value % 2) !== 0;\n  for (let i = 0; i < values.length; i++) {\n    if (!values[i]) break;\n    if (((values[i] % 2) !== 0) === isOddClue) return values[i] === clue.value;\n  }\n  const idxOfClue = values.indexOf(clue.value);\n  if (idxOfClue !== -1) {\n    return values.slice(0, idxOfClue).every(v => !v || ((v % 2) !== 0) !== isOddClue);\n  }\n  return !values.some(v => v && ((v % 2) !== 0) === isOddClue) && !values.every(v => v);\n}`,
        mastermind: `validatePartial(board, clue) {
  const dimensions = boxDimensions(board.length);
  const centerTriplet = clue.cells.map(cell => {
    let { row: r, col: c } = cell;
    r = r < dimensions.height ? r + dimensions.height : (r >= board.length - dimensions.height ? r - dimensions.height : r);
    c = c < dimensions.width ? c + dimensions.width : (c >= board.length - dimensions.width ? c - dimensions.width : c);
    return { row: r, col: c };
  });
  const cornerValues = clue.cells.map(cell => cellValue(board, cell));
  const centerValues = centerTriplet.map(cell => cellValue(board, cell));
  if (cornerValues.some(v => !v) || centerValues.some(v => !v)) return true;

  const blackCount = clue.clues.filter(c => c === "black").length;
  const whiteCount = clue.clues.filter(c => c === "white").length;
  const hasCross = clue.clues.includes("cross");

  let actualBlack = 0, actualWhite = 0;
  const cornerCounts = {}, centerCounts = {};
  for (let i = 0; i < cornerValues.length; i++) {
    if (cornerValues[i] === centerValues[i]) {
      actualBlack++;
    } else {
      cornerCounts[cornerValues[i]] = (cornerCounts[cornerValues[i]] || 0) + 1;
      centerCounts[centerValues[i]] = (centerCounts[centerValues[i]] || 0) + 1;
    }
  }
  Object.keys(cornerCounts).forEach(digit => {
    actualWhite += Math.min(cornerCounts[digit], centerCounts[digit] || 0);
  });

  if (hasCross) return actualBlack === 0 && actualWhite === 0;
  return actualBlack === blackCount && actualWhite === whiteCount;
}`,
        "max ascending": `validatePartial(board, clue) {\n  const values = clue.cells.map(cellValue);\n  let maxGuaranteed = 0, currentGuaranteed = 0;\n  for (let i = 0; i < values.length; i++) {\n    if (i === 0 || (values[i] && values[i-1] && values[i] > values[i-1])) {\n      currentGuaranteed = values[i] ? currentGuaranteed + 1 : 0;\n    } else {\n      maxGuaranteed = Math.max(maxGuaranteed, currentGuaranteed);\n      currentGuaranteed = values[i] ? 1 : 0;\n    }\n  }\n  maxGuaranteed = Math.max(maxGuaranteed, currentGuaranteed);\n  if (maxGuaranteed > clue.value) return false;\n  let maxPossible = 0, currentPossible = 0;\n  for (let i = 0; i < values.length; i++) {\n    if (i === 0 || !values[i] || !values[i-1] || values[i] > values[i-1]) currentPossible++;\n    else {\n      maxPossible = Math.max(maxPossible, currentPossible);\n      currentPossible = 1;\n    }\n  }\n  maxPossible = Math.max(maxPossible, currentPossible);\n  if (maxPossible < clue.value) return false;\n  return !values.every(v => v) || maxGuaranteed === clue.value;\n}`,
        "fives": `validatePartial(board, clue) {\n  const [a, b] = clue.cells.map(cellValue);\n  if (!a || !b) return true;\n  const isFive = a + b === 5 || Math.abs(a - b) === 5;\n  return clue.marked ? isFive : !isFive;\n}`,
        "frame-diagonal": `validatePartial(board, clue) {\n  return sumBoundsContain(board, clue.cells.slice(0, 3), clue.value);\n}`,
        "odd labyrinth": `validatePartial(board) {\n  return hasOddPath(board, board.length);\n}`,
        "even passage": `validatePartial(board) {\n  return hasEvenPath(board, board.length);\n}`,
        "equal sum line": `validatePartial(board, clue) {\n  const groups = {};\n  clue.cells.forEach(cell => {\n    const box = boxIndex(cell.row, cell.col, board.length);\n    (groups[box] || (groups[box] = [])).push(cell);\n  });\n  let minPossible = -Infinity, maxPossible = Infinity;\n  for (const box of Object.keys(groups)) {\n    const cells = groups[box], sum = cells.map(cellValue).reduce((t, v) => t + v, 0);\n    const blanks = cells.filter(cell => !cellValue(board, cell)).length;\n    let minS = sum + blanks, maxS = sum + blanks * board.length;\n    if (blanks === 0) { minS = sum; maxS = sum; }\n    minPossible = Math.max(minPossible, minS);\n    maxPossible = Math.min(maxPossible, maxS);\n  }\n  return minPossible <= maxPossible;\n}`,
        "german whispers": `validatePartial(board, line) {\n  const values = line.cells.map(cellValue);\n  for (let i = 0; i < values.length - 1; i++) {\n    if (values[i] && values[i+1] && Math.abs(values[i] - values[i+1]) < 5) return false;\n  }\n  return true;\n}`,
        "factor lines": `validatePartial(board, line) {\n  const values = line.cells.map(cellValue);\n  for (let i = 0; i < values.length - 1; i++) {\n    if (values[i] && values[i+1] && values[i] % values[i+1] !== 0 && values[i+1] % values[i] !== 0) return false;\n  }\n  return true;\n}`,
        innerframesum: `validatePartial(board, clue) {\n  const values = clue.cells.slice(1, 4).map(cellValue);\n  return sumBoundsContain(board, clue.cells.slice(1, 4), clue.value);\n}`,
        missingdigit: `validatePartial(board, clue) {\n  const digits = String(clue.value).split("").map(Number);\n  const values = clue.cells.slice(0, 3).map(cellValue);\n  return values.every(value => !digits.includes(value));\n}`,
        nextto9: `validatePartial(board, clue) {\n  const digits = String(clue.value).split("").map(Number);\n  const values = clue.cells.map(cellValue), nine = values.indexOf(9);\n  if (nine !== -1) {\n    const neighbors = [values[nine - 1], values[nine + 1]].filter(Boolean);\n    return neighbors.every(n => digits.includes(n));\n  }\n  return true;\n}`,
        outsideconsecutive: `validatePartial(board, clue) {\n  const values = clue.cells.map(cellValue);\n  let min = 0, max = 0;\n  for (let i = 0; i < values.length - 1; i++) {\n    if (values[i] && values[i+1]) {\n      if (Math.abs(values[i] - values[i+1]) === 1) { min++; max++; }\n    } else {\n      max++;\n    }\n  }\n  return clue.value >= min && clue.value <= max;\n}`,
        outsidegreaterthan: `validatePartial(board, clue) {\n  const values = clue.cells.map(cellValue);\n  let min = 0, max = 0;\n  for (let i = 0; i < values.length - 1; i++) {\n    if (values[i] && values[i+1]) {\n      if (values[i] > values[i+1]) { min++; max++; }\n    } else {\n      max++;\n    }\n  }\n  return clue.value >= min && clue.value <= max;\n}`,
        outsidekiller: `validatePartial(board, clue) {\n  const values = clue.cells.map(cellValue);\n  for (let i = 0; i < values.length - 1; i++) {\n    const a = values[i], b = values[i+1];\n    if (a && b && a + b === clue.value) return true;\n    if ((a || b) && clue.value - (a || b) >= 1 && clue.value - (a || b) <= board.length && clue.value - (a || b) !== (a || b)) return true;\n    if (!a && !b && clue.value >= 3 && clue.value <= board.length * 2 - 1) return true;\n  }\n  return false;\n}`,
        parityskyscrapers: `validatePartial(board, clue) {\n  const values = clue.cells.map(cellValue);\n  if (values.includes(0)) return true;\n  const visible = [];\n  let max = 0;\n  for (const val of values) {\n    if (val > max) { visible.push(val); max = val; }\n  }\n  const odd = visible.filter(v => v % 2 !== 0).length, even = visible.filter(v => v % 2 === 0).length;\n  return clue.value === odd || clue.value === even;\n}`,
        pointingdifferents: `validatePartial(board, clue) {\n  const values = clue.cells.map(cellValue).filter(Boolean);\n  const blanks = clue.cells.length - values.length;\n  const unique = new Set(values).size;\n  return unique <= clue.value && unique + blanks >= clue.value;\n}`
    };
    if (implementations[variation.value]) return implementations[variation.value];

    const functionName = `validate${variation.value.replace(/[^a-z0-9]+(.)?/gi, (_, letter = "") => letter.toUpperCase())
        .replace(/^[a-z]/, (letter) => letter.toUpperCase())}`;
    const rule = variation.rule.replace(/\s+/g, " ").replace(/\*\//g, "* /");
    const edgeRelations: Record<string, string> = {
        difference: "Math.abs(a - b) === clue.value",
        sum: "a + b === clue.value",
        product: "a * b === clue.value",
        greater: "Math.max(a, b) === clue.value",
        lesser: "Math.min(a, b) === clue.value",
        consecutive: "Math.abs(a - b) === 1",
        evensumpairs: "(a + b) % 2 === 0",
        oddsumpairs: "(a + b) % 2 === 1"
    };
    if (edgeRelations[variation.value]) {
        return `function ${functionName}(board, clue) {\n  const [a, b] = clue.cells.map(cell => cellValue(board, cell));\n  return !a || !b || ${edgeRelations[variation.value]};\n}`;
    }
    const pairRelations: Record<string, string> = {
        "anti king": "a !== b", "anti knight": "a !== b", knightmare: "a + b !== 5 && a + b !== 15",
        "non consecutive": "Math.abs(a - b) !== 1", diagonallynonconsecutive: "Math.abs(a - b) !== 1",
        noevenneighbours: "a % 2 !== 0 || b % 2 !== 0", queen: "a !== size || b !== size"
    };
    if (pairRelations[variation.value]) {
        return `function ${functionName}(board, pair, size) {\n  // ${rule}\n  const [a, b] = pair.map(cell => cellValue(board, cell));\n  return !a || !b || ${pairRelations[variation.value]};\n}`;
    }
    if (variation.value === "touchy") {
        return `function ${functionName}(board, clue) {\n  const value = cellValue(board, clue.cell);\n  if (!value) return true;\n  const neighbours = clue.neighbours.map(cell => cellValue(board, cell));\n  return neighbours.some(neighbour => !neighbour || Math.abs(value - neighbour) === 1);\n}`;
    }
    if (["diagonal", "disjoint", "windoku", "extraregion", "deficit", "surplus"].includes(variation.value)) {
        return `function ${functionName}(board, region) {\n  // ${rule}\n  return assignedDigitsAreDistinct(board, region) && regionCanStillContainEveryDigit(board, region);\n}`;
    }
    const lineBodies: Record<string, string> = {
        renban: `const assigned = values.filter(Boolean);\n  return new Set(assigned).size === assigned.length\n    && (!assigned.length || Math.max(...assigned) - Math.min(...assigned) < values.length);`,
        paritylines: `const assigned = values.filter(Boolean);\n  return assigned.length < 2 || assigned.every(value => value % 2 === assigned[0] % 2);`,
        creasing: `return assignedValuesAreStrictlyMonotonic(values);`,
        sequence: `return incomplete(values) || values.slice(2).every((value, index) => value - values[index + 1] === values[1] - values[0]);`,
        palindrome: `return values.every((value, index) => !value || !values.at(-index - 1) || value === values.at(-index - 1));`,
        thermo: `return values.every((value, index) => index === 0 || !value || !values[index - 1] || values[index - 1] < value);`
    };
    if (lineBodies[variation.value]) {
        return `function ${functionName}(board, path) {\n  // ${rule}\n  const values = path.map(cell => cellValue(board, cell));\n  ${lineBodies[variation.value]}\n}`;
    }
    if (["clone", "consecutiveclone", "alloddalleven"].includes(variation.value)) {
        if (variation.value === "clone") {
            return `function ${functionName}(board, correspondingCells) {\n  const values = correspondingCells.map(cell => cellValue(board, cell)).filter(Boolean);\n  return values.every(value => value === values[0]);\n}`;
        }
        if (variation.value === "consecutiveclone") {
            return `function ${functionName}(board, correspondingCells) {\n  const values = correspondingCells.map(cell => cellValue(board, cell)).filter(Boolean);\n  return new Set(values).size === values.length\n    && (values.length < 2 || Math.max(...values) - Math.min(...values) < correspondingCells.length);\n}`;
        }
        return `function ${functionName}(board, shadedBoxCells) {\n  const values = shadedBoxCells.map(cell => cellValue(board, cell)).filter(Boolean);\n  return values.length < 2 || values.every(value => value % 2 === values[0] % 2);\n}`;
    }
    if (variation.value === "arrow") {
        return `function ${functionName}(board, clue) {\n  const circle = cellValue(board, clue.circle);\n  const shaft = clue.shaft.map(cell => cellValue(board, cell));\n  const sum = shaft.reduce((total, value) => total + value, 0);\n  const blanks = shaft.filter(value => !value).length;\n  return !circle || (sum <= circle && sum + blanks * board.length >= circle && (blanks || sum === circle));\n}`;
    }
    if (variation.value === "killer") {
        return `function ${functionName}(board, cage) {\n  const values = cage.cells.map(cell => cellValue(board, cell));\n  const assigned = values.filter(Boolean);\n  const sum = assigned.reduce((total, value) => total + value, 0);\n  return new Set(assigned).size === assigned.length && sum <= cage.total\n    && (values.some(value => !value) || sum === cage.total);\n}`;
    }
    if (variation.value === "sandwich") {
        return `validateComplete(board, clue) {\n  const values = clue.cells.map(cell => cellValue(board, cell));\n  const [start, end] = [values.indexOf(1), values.indexOf(6)].sort();\n  return values.slice(start + 1, end).reduce((sum, value) => sum + value, 0) === clue.total;\n}`;
    }
    if (variation.value === "skyscraper") {
        return `validateComplete(board, clue) {\n  let tallest = 0, visible = 0;\n  clue.cells.map(cell => cellValue(board, cell)).forEach(value => {\n    if (value > tallest) { tallest = value; visible++; }\n  });\n  return visible === clue.count;\n}`;
    }
    const directionalBodies: Record<string, string> = {
        biggestneighbours: `const neighbours = arrow.neighbours.map(cell => cellValue(board, cell)).filter(Boolean);\n  return arrow.targets.every(cell => { const value = cellValue(board, cell); return !value || neighbours.every(other => value >= other); });`,
        eliminate: `const value = cellValue(board, arrow.origin);\n  return !value || arrow.targets.every(cell => cellValue(board, cell) !== value);`,
        pointtonext: `const value = cellValue(board, arrow.origin);\n  const targets = arrow.targets.map(cell => cellValue(board, cell));\n  return !value || targets.some(target => !target || target === value + 1);`,
        pointtoprevious: `const value = cellValue(board, arrow.origin);\n  const targets = arrow.targets.map(cell => cellValue(board, cell));\n  return !value || targets.some(target => !target || target === value - 1);`,
        quadmax: `const target = cellValue(board, arrow.target);\n  return !target || arrow.cells.every(cell => cell === arrow.target || !cellValue(board, cell) || cellValue(board, cell) < target);`,
        quadmin: `const target = cellValue(board, arrow.target);\n  return !target || arrow.cells.every(cell => cell === arrow.target || !cellValue(board, cell) || cellValue(board, cell) > target);`,
        search6: `const distance = cellValue(board, arrow.origin);\n  if (!distance) return true;\n  return arrow.rays.every(ray => firstKnownDistanceOf(board, ray, 6) === distance || rayHasOpenCellBefore(board, ray, distance));`,
        search9: `const distance = cellValue(board, arrow.origin);\n  if (!distance) return true;\n  const target = board.length;\n  return arrow.rays.every(ray => firstKnownDistanceOf(board, ray, target) === distance || rayHasOpenCellBefore(board, ray, distance));`
    };
    if (directionalBodies[variation.value]) {
        return `function ${functionName}(board, arrow) {\n  // ${rule}\n  ${directionalBodies[variation.value]}\n}`;
    }
    const markBodies: Record<string, string> = {
        "odd even": `const value = cellValue(board, mark.cell);\n  return !value || value % 2 === (mark.parity === "odd" ? 1 : 0);`,
        kropki: `const [a, b] = mark.cells.map(cell => cellValue(board, cell));\n  if (!a || !b) return true;\n  return mark.kind === "white" ? Math.abs(a - b) === 1 : Math.max(a, b) === 2 * Math.min(a, b);`,
        xv: `const [a, b] = mark.cells.map(cell => cellValue(board, cell));\n  return !a || !b || a + b === (mark.kind === "V" ? 5 : 10);`,
        battenburg: `const parity = mark.cells.map(cell => { const value = cellValue(board, cell); return value ? value % 2 : null; });\n  return parity.some(value => value === null) || (parity[0] === parity[3] && parity[1] === parity[2] && parity[0] !== parity[1]);`,
        quadruple: `const values = mark.cells.map(cell => cellValue(board, cell));\n  return mark.digits.every(digit => values.includes(digit) || values.some(value => !value));`,
        quadro: `const values = mark.cells.map(cell => cellValue(board, cell)).filter(Boolean);\n  return values.length < 4 || !values.every(value => value % 2 === values[0] % 2);`,
        equalsums: `const [a, b, c, d] = mark.cells.map(cell => cellValue(board, cell));\n  return !a || !b || !c || !d || a + d === b + c;`,
        equaldifferences: `const [a, b, c, d] = mark.cells.map(cell => cellValue(board, cell));\n  return !a || !b || !c || !d || Math.abs(a - d) === Math.abs(b - c);`,
        equalproducts: `const [a, b, c, d] = mark.cells.map(cell => cellValue(board, cell));\n  return !a || !b || !c || !d || a * d === b * c;`,
        equalratios: `const [a, b, c, d] = mark.cells.map(cell => cellValue(board, cell));\n  return !a || !b || !c || !d || Math.max(a, d) * Math.min(b, c) === Math.max(b, c) * Math.min(a, d);`,
        consecutivequads: `const values = mark.cells.map(cell => cellValue(board, cell));\n  if (values.some(value => !value)) return true;\n  const pairs = values.flatMap((a, i) => values.slice(i + 1).map(b => Math.abs(a - b) === 1)).filter(Boolean).length;\n  return mark.kind === "black" ? pairs >= 2 : pairs === 1;`
    };
    if (markBodies[variation.value]) {
        return `function ${functionName}(board, mark) {\n  // ${rule}\n  ${markBodies[variation.value]}\n}`;
    }
    const reason = variation.status === "available"
        ? `The runtime supports ${variation.name}, but its validator source has not been documented yet.`
        : automaticBlockerFor(variation);
    return `// ${reason}\nfunction validatePartial() {\n  return true; // No documented automatic validator.\n}\nfunction validateComplete() {\n  return true; // No documented automatic validator.\n}`;
}

/** Partial and full validator source shown on each generated variant reference page. */
export function cspConstraintFunctionsFor(variation: Variation) {
    let source = cspImplementationFor(variation)
        .replace(/(^|\n)validatePartial\(/g, "$1function validatePartial(")
        .replace(/(^|\n)validateComplete\(/g, "$1function validateComplete(");
    if (!source.includes("function validatePartial(")) {
        const generatedName = `validate${variation.value.replace(/[^a-z0-9]+(.)?/gi, (_, letter = "") => letter.toUpperCase())
            .replace(/^[a-z]/, (letter) => letter.toUpperCase())}`;
        source = source.replace(`function ${generatedName}(`, "function validatePartial(");
    }
    if (!source.includes("function validatePartial(")) {
        source = `function validatePartial() {\n  return true;\n}\n${source}`;
    }
    if (!source.includes("function validateComplete(")) {
        source += `\n\nfunction validateComplete(board, clue) {\n  return validatePartial(board, clue);\n}`;
    }
    return {
        partial: source.slice(0, source.indexOf("function validateComplete(")).trim(),
        full: source.slice(source.indexOf("function validateComplete(")).trim()
    };
}

/** Kept for callers that want both functions in one code block. */
export function cspConstraintFunctionFor(variation: Variation) {
    const validators = cspConstraintFunctionsFor(variation);
    return `${validators.partial}\n\n${validators.full}`;
}

/** Executable-style regression examples displayed on every variant detail page. */
export function solverTestCasesFor(variation: Variation) {
    const cases: Record<string, string> = {
        fullrank: `test("ranks complete n-digit numbers", () => {\n  const lines = [\n    { rank: 1, cells: rowCells(1) },\n    { rank: 2, cells: rowCells(2) }\n  ];\n  assert.equal(solve(boardWithRows("123456789", "234567891"), { fullRankGroups: [lines] }).solved, true);\n});`,
        evensandwich: `test("2,4,6 satisfies an outside 4 clue", () => {\n  const board = boardWith({ r1c1: 2, r1c2: 4, r1c3: 6 });\n  const clue = { relation: "evensandwich", cells: rowCells(1), clues: [4] };\n  assert.equal(solve(board, { outsideRelations: [clue] }).solved, true);\n  assert.equal(readConstraints(puzzleWithNoOutsideClues("evensandwich")).outsideRelations.every(clue => clue.clues.length === 0), true);\n});`,
        coded: `test("Coded reads the upper-left numberS corner", () => {\n  const constraints = readConstraints(codedPuzzle({ r1c1: "A", r1c2: "A", r2c1: "B" }));\n  assert.deepEqual(constraints.codedGroups[0].groups, [[r1c1, r1c2], [r2c1]]);\n});`,
        pencilmarks: `test("one Pencilmark remains a candidate clue", () => {\n  const clue = { cell: r1c1, allowed: [4] };\n  assert.equal(solve(boardWith({ r1c1: 4 }), { pencilmarkCells: [clue] }).solved, true);\n  assert.equal(solve(boardWith({ r1c1: 5 }), { pencilmarkCells: [clue] }).solved, false);\n});`,
        sumdetector: `test("every arrow uses the same n", () => {\n  const group = sumDetectorGroupWithTwoArrows();\n  assert.equal(solve(boardWhereBothArrowsUseN(2), { sumDetectorGroups: [group] }).solved, true);\n  assert.equal(solve(boardWhereArrowsNeedDifferentN(), { sumDetectorGroups: [group] }).solved, false);\n});`,
        windoku: `test("four generated cages become extra regions", () => {\n  const constraints = readConstraints(windokuPuzzleWithGeneratedCages());\n  assert.equal(constraints.regionAllDifferent.length, 4);\n  assert.equal(constraints.regionAllDifferent.every(region => region.length === 9), true);\n});`,
        creasing: `test("a no-bulb thermo is only a Creasing line", () => {\n  const constraints = readConstraints(creasingPuzzle([[r1c1, r1c2, r1c3]]));\n  assert.equal(constraints.catalogLines[0].relation, "creasing");\n  assert.equal(constraints.thermos.length, 0);\n});`,
        rossini: `test("Rossini reads a cardinal thin-black arrow", () => {\n  const constraints = readConstraints(rossiniPuzzle({ top1: "down" }, "arrow_N_B"));\n  assert.equal(constraints.rossiniLines[0].direction, "ascending");\n  assert.equal(constraints.rossiniLines.slice(1).every(clue => clue.direction === "none"), true);\n});`,
        ascendingstarters: `test("5 satisfies an outside ascending starter sum clue", () => {\n  const board = boardWith({ r1c1: 5, r1c2: 3, r1c3: 4 });\n  const clue = { relation: "ascendingstarters", cells: rowCells(1), value: 5 };\n  assert.equal(solve(board, { outsideRelations: [clue] }).solved, true);\n  assert.equal(solve(board, { outsideRelations: [{ ...clue, value: 6 }] }).solved, false);\n});`,
        before9: `test("16 satisfies an outside sum before 9 clue", () => {\n  const board = boardWith({ r1c1: 3, r1c2: 5, r1c3: 8, r1c4: 9 });\n  const clue = { relation: "before9", cells: rowCells(1), value: 16 };\n  assert.equal(solve(board, { outsideRelations: [clue] }).solved, true);\n  assert.equal(solve(board, { outsideRelations: [{ ...clue, value: 17 }] }).solved, false);\n});`
    };
    if (cases[variation.value]) return cases[variation.value];
    if (variation.status !== "available") return `test.todo("${variation.name}: add a concrete solver fixture before enabling CSP support");`;
    const text = `${variation.name} ${variation.rule}`.toLowerCase();
    const values = /product/.test(text)
        ? { valid: [2, 3], invalid: [2, 4], clue: { value: 6 } }
        : /difference/.test(text)
            ? { valid: [2, 4], invalid: [2, 5], clue: { value: 2 } }
            : /sum|total/.test(text)
                ? { valid: [2, 3], invalid: [2, 4], clue: { value: 5 } }
                : /ratio|double|half/.test(text)
                    ? { valid: [2, 4], invalid: [2, 5], clue: { value: 2 } }
                    : { valid: [1, 2, 3, 4, 5, 6, 7, 8, 9], invalid: [1, 1, 3, 4, 5, 6, 7, 8, 9], clue: {} };
    return `test("${variation.name}: concrete valid and invalid values", () => {\n  const clue = ${JSON.stringify({ relation: variation.value, ...values.clue })};\n  const validValues = ${JSON.stringify(values.valid)};\n  const invalidValues = ${JSON.stringify(values.invalid)};\n  assert.equal(validateComplete(boardWithValues(validValues), clue), true);\n  assert.equal(validateComplete(boardWithValues(invalidValues), clue), false);\n});`;
}

/** Summarizes the constraint shape so the wiki remains useful before every CSP is implemented. */
export function cspApproachFor(variation: Variation) {
    const text = `${variation.name} ${variation.rule}`.toLowerCase();
    if (has(text, /sum|total/)) return "Arithmetic sum constraint over the marked cells; include converse checks when every possible mark is given.";
    if (has(text, /product/)) return "Arithmetic product constraint over the marked cells or adjacent pair.";
    if (has(text, /difference/)) return "Absolute-difference relation on the cells selected by the mark.";
    if (has(text, /ratio|double|half/)) return "Pairwise ratio relation, optionally with a negative/converse rule on unmarked pairs.";
    if (has(text, /consecutive/)) return "Pairwise consecutive/non-consecutive relation on the relevant neighboring cells.";
    if (has(text, /line|path|thermo|arrow|palindrome|renban/)) return "Ordered sequence constraint over the cells traversed by the mark.";
    if (has(text, /cage|region|box/)) return "All-different and/or aggregate constraint over each extracted cell group.";
    if (has(text, /knight|king|queen|touch|neighbour/)) return "Global neighborhood constraint generated from board geometry.";
    return "Variant-specific partial-board validator registered in the CSP registry.";
}

/** Explains why a backlog item cannot be safely inferred by the generic CSP families. */
export function automaticBlockerFor(variation: Variation) {
    if (variation.status === "infeasible") {
        return "This variant requires a non-standard grid size, overlapping boards, split cells, or custom layout. It is not implementable on a standard 9x9 board and is kept for wiki reference only.";
    }
    const text = `${variation.name} ${variation.rule}`.toLowerCase();
    const choice = markChoiceFor(variation);
    if (choice.position === "multiple" || choice.mark === "multiple") {
        return `${variation.name} combines multiple clue meanings or orientations, so the parser cannot identify one unambiguous Penpa object automatically.`;
    }
    if (variation.tags?.includes("outside") || /outside (?:the )?grid/.test(text)) {
        return `${variation.name} requires a custom sightline extractor (e.g., diagonal sightlines) or a dedicated outside-clue validator tailored to its sequence/clue matching rule.`;
    }
    if (/all possible|every unmarked|all such/.test(text)) {
        return `${variation.name} has a negative/converse rule; automatic support must enumerate every eligible unmarked location without confusing marks owned by another variant.`;
    }
    if (/arrow|line|path/.test(text)) {
        return `${variation.name} needs a dedicated path extractor because generic Penpa lines do not encode this variant's ordering or endpoint semantics.`;
    }
    if (/sum|difference|product|ratio|average/.test(text)) {
        return `${variation.name} needs a normalized arithmetic clue reader and partial-domain bounds tailored to its exact operation.`;
    }
    if (/circle|square|diamond|triangle|mark|symbol/.test(text)) {
        return `${variation.name} does not yet have a unique Penpa symbol signature, so its marks cannot be separated reliably from other active variants.`;
    }
    if (choice.position === "none") {
        return `${variation.name} is a global rule, but no dedicated geometry generator and partial-board CSP validator has been registered yet.`;
    }
    return `${variation.name} has no normalized clue extractor and regression fixture yet; implementing it automatically would guess at variant-specific semantics.`;
}
