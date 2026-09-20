import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

const puzzles = [
  { id: "r01-01", variant: "classic",
    givens: ["000000000","009000800","080601040","002050900","000103000","003040500","060304010","005000200","000000000"],
    solution: ["346978152","129435876","587621349","812756934","954183627","673249581","268394715","495817263","731562498"] },
  { id: "r01-02", variant: "killer",
    cages: ["11 21","12 22","13 23","14 24","15 16 25 34 35","17 27","18 28","19 29","26 36 46","31 32","33 42 43","37 38 39","41 51 61","44 54","45 55 65","47 48","49 59 69","52 53","56 66","57 58","62 63","64 74 84","67 68 77","71 72 73","75 76 85 94 95","78 79","81 91","82 92","83 93","86 96","87 97","88 98","89 99"],
    givens: Array(9).fill("000000000"),
    solution: ["925634718","316827549","748519623","457391286","163285974","892476135","239158467","584762391","671943852"] },
  { id: "r01-03", variant: "irregular",
    regions: ["11 12 13 14 21 24 31 41 42","15 16 17 18 19 29 39 49 59","22 23 32 33 34 35 43 44 53","25 26 27 28 37 38 47 48 58","36 45 46 54 55 56 64 65 74","51 61 71 81 91 92 93 94 95","52 62 63 72 73 82 83 84 85","57 66 67 75 76 77 78 87 88","68 69 79 86 89 96 97 98 99"],
    givens: ["900040006","010000070","007000500","000804000","700050018","000607000","002000400","090000030","500060002"],
    solution: ["978142356","415283679","627938541","356814927","764359218","843627195","182795463","291576834","539461782"] },
  { id: "r01-04", variant: "toroidal",
    regions: ["11 12 13 22 23 24 33 34 35","14 15 16 82 83 84 93 94 95","17 18 19 21 28 29 96 97 98","25 26 27 36 37 38 47 48 49","31 32 39 41 42 43 52 53 54","44 45 46 55 56 57 66 67 68","51 58 59 61 62 69 71 72 73","63 64 65 74 75 76 85 86 87","77 78 79 81 88 89 91 92 99"],
    givens: ["027198650","150000089","200000007","600472008","700906002","300749005","800000004","570000036","086537420"],
    solution: ["427198653","153624789","249813567","635472198","718956342","362749815","891365274","574281936","986537421"] },
  { id: "r01-05", variant: "diagonal", diagonals: true,
    givens: ["040000150","800006007","700020000","050010000","006802500","000090070","000080002","600200005","082000030"],
    solution: ["243978156","891456327","765321894","359617248","476832519","128594673","534189762","617243985","982765431"] },
  { id: "r01-06", variant: "non consecutive",
    givens: ["008000400","090000000","400050000","000300000","005000600","000001000","000060007","000000060","004000500"],
    solution: ["758296413","296413758","413758296","641375829","375829641","829641375","582964137","137582964","964137582"] },
  { id: "r01-07", variant: "extraregion", surfaces: "16 17 18 19 22 23 24 26 29 32 34 35 39 42 43 48 49 53 57 61 62 67 68 71 75 76 78 81 84 86 87 88 91 92 93 94",
    givens: ["600130000","000040000","000009100","300000700","520000064","009000008","006800000","000020000","000094007"],
    solution: ["685137492","193248576","274659183","348962715","521783964","769415328","436871259","957326841","812594637"] },
  { id: "r01-08", variant: "odd even",
    odd: "23 32 34 42 44 52 54 63", even: "47 48 56 67 76 87 88",
    givens: ["000056789","100009230","000000100","000090007","500000002","700060000","001000000","075900001","962810000"],
    solution: ["423156789","157489236","698327145","214593867","536748912","789261453","341672598","875934621","962815374"] },
  { id: "r01-09", variant: "outside", margins: {t:2,b:2,l:3,r:2},
    outside: {
      top: [[4,5],[8,9],[1,2],[8,9],[1,3],[6,7],[5,6],[],[8,9]],
      bottom: [[6,7],[2,3],[8,9],[6,7],[8,9],[3,4],[7,8],[1,9],[2,3]],
      left: [[],[8,5],[7,6],[],[8,6],[4,3,2],[1],[],[4,3]],
      right: [[1,3],[],[4,5],[3,4],[5,7],[8,9],[],[4,5],[1,2]],
    },
    givens: Array(9).fill("000000000"),
    solution: ["492856371","581437629","367912548","975268134","816349257","243571986","158624793","729183465","634795812"] },
];

function assertGrid(puzzle) {
  const rows = puzzle.solution.map((row) => [...row].map(Number));
  for (let index = 0; index < 9; index += 1) {
    const row = new Set(rows[index]);
    const column = new Set(rows.map((entry) => entry[index]));
    if (row.size !== 9 || column.size !== 9) throw new Error(`${puzzle.id}: invalid solution at ${index + 1}`);
  }
  puzzle.givens.forEach((row, r) => [...row].forEach((digit, c) => {
    if (digit !== "0" && digit !== puzzle.solution[r][c]) throw new Error(`${puzzle.id}: given mismatch at r${r + 1}c${c + 1}`);
  }));
}

puzzles.forEach(assertGrid);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(process.env.SUDOTOKU_URL || "http://localhost:5174/", { waitUntil: "networkidle" });
await page.waitForFunction(() => window.pu?.centerlist?.length === 81);

const links = {};
for (const puzzle of puzzles) {
  links[puzzle.id] = await page.evaluate((definition) => {
    location.hash = "";
    const board = window.pu;
    if (definition.margins) {
      for (const side of ["t", "b", "l", "r"]) {
        for (let count = 0; count < definition.margins[side]; count += 1) board.resize_board(side, 1, "white");
      }
    }
    const cells = board.centerlist.slice();
    if (cells.length !== 81) throw new Error(`${definition.id}: expected 81 cells, received ${cells.length}`);
    board.pu_q.number = {};
    board.pu_q.numberS = {};
    board.pu_q.surface = {};
    board.pu_q.symbol = {};
    board.pu_q.line = {};
    board.pu_q.lineE = {};
    board.pu_q.cage = {};
    board.pu_q.killercages = [];
    board.pu_a.number = {};
    const cell = (code) => cells[(Number(code[0]) - 1) * 9 + Number(code[1]) - 1];
    const cellList = (source) => String(source || "").trim().split(/\s+/).filter(Boolean).map(cell);
    definition.givens.forEach((row, r) => [...row].forEach((digit, c) => {
      if (digit !== "0") board.pu_q.number[cells[r * 9 + c]] = [Number(digit), 1, "1"];
    }));
    definition.solution.forEach((row, r) => [...row].forEach((digit, c) => {
      if (definition.givens[r][c] === "0") board.pu_a.number[cells[r * 9 + c]] = [digit, 9, "1"];
    }));
    board.activeSudokuVariants = [...new Set(["classic", definition.variant])];
    board.bg_image_data = {
      url: null, x: 0, y: 0, width: undefined, height: undefined,
      opacity: 100,
      foreground: true, mask_white: true,
    };
    if (definition.cages) {
      board.pu_q.killercages = definition.cages.map(cellList);
      for (const cage of board.pu_q.killercages) {
        const segments = board.cage_for_selection(cage);
        for (const key of [...segments[0], ...segments[1]]) board.pu_q.cage[key] = 10;
        const total = cage.reduce((sum, key) => {
          const index = cells.indexOf(key), row = Math.floor(index / 9), col = index % 9;
          return sum + Number(definition.solution[row][col]);
        }, 0);
        const labelCell = cage.reduce((best, key) => cells.indexOf(key) < cells.indexOf(best) ? key : best, cage[0]);
        board.pu_q.numberS[4 * (labelCell + board.nx0 * board.ny0)] = [String(total), 1];
      }
    }
    if (definition.regions) {
      const ids = Array(81).fill("");
      definition.regions.forEach((region, index) => String(region).split(/\s+/).forEach(code => {
        ids[(Number(code[0]) - 1) * 9 + Number(code[1]) - 1] = String(index + 1);
      }));
      board.pu_q.irregularRegions = ids;
      board.mode.grid = ["1", "1", "1"];
      for (const key of window.SudokuSolver.irregularBoundaryEdges(board, ids)) board.pu_q.lineE[key] = 2;
      if (definition.variant === "toroidal") {
        const base = board.nx0 * board.ny0, firstRow = 1 + board.space[0], firstCol = 1 + board.space[2];
        const vertical = (row, boundaryCol) => { const first = base + (firstRow + row) * board.nx0 + firstCol + boundaryCol; return `${first},${first + board.nx0}`; };
        const horizontal = (boundaryRow, col) => { const first = base + (firstRow + boundaryRow) * board.nx0 + firstCol + col; return `${first},${first + 1}`; };
        for (let row = 0; row < 9; row += 1) if (ids[row * 9] !== ids[row * 9 + 8]) {
          board.pu_q.lineE[vertical(row, 0)] = 2; board.pu_q.lineE[vertical(row, 9)] = 2;
        }
        for (let col = 0; col < 9; col += 1) if (ids[col] !== ids[72 + col]) {
          board.pu_q.lineE[horizontal(0, col)] = 2; board.pu_q.lineE[horizontal(9, col)] = 2;
        }
      }
    }
    if (definition.diagonals) {
      for (let index = 0; index < 8; index += 1) {
        const main = [cells[index * 10], cells[(index + 1) * 10]].sort((a,b) => a-b).join(',');
        const anti = [cells[index * 8 + 8], cells[(index + 1) * 8 + 8]].sort((a,b) => a-b).join(',');
        board.pu_q.line[main] = 11; board.pu_q.line[anti] = 11;
      }
    }
    for (const key of cellList(definition.surfaces)) board.pu_q.surface[key] = 1;
    for (const key of cellList(definition.odd)) board.pu_q.symbol[key] = [3, "circle_L", 2];
    for (const key of cellList(definition.even)) board.pu_q.symbol[key] = [3, "square_L", 2];
    if (definition.outside) {
      const first = cells[0], last = cells[80];
      const addClues = (lists, keyForDistance) => lists.forEach((values, index) => values.forEach((digit, offset) => {
        board.pu_q.number[keyForDistance(index, offset + 1)] = [String(digit), 1, "1"];
      }));
      addClues(definition.outside.top, (col, distance) => first + col - distance * board.nx0);
      addClues(definition.outside.bottom, (col, distance) => last - 8 + col + distance * board.nx0);
      addClues(definition.outside.left, (row, distance) => first + row * board.nx0 - distance);
      addClues(definition.outside.right, (row, distance) => first + row * board.nx0 + 8 + distance);
    }
    const title = document.getElementById("saveinfotitle");
    if (title) title.value = `WSC 2026 ${definition.id.toUpperCase()} official example`;
    const generated = board.maketext_solve_solution();
    const separator = generated.includes("?") ? "&" : generated.includes("#") ? "&" : "?";
    return generated + separator + "variants=" + encodeURIComponent([...new Set(["classic", definition.variant])].join(","));
  }, puzzle);
  await page.goto(process.env.SUDOTOKU_URL || "http://localhost:5174/", { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.pu?.centerlist?.length === 81);
}

await writeFile("docs/src/wsc2026/round1Playable.json", JSON.stringify(links, null, 2) + "\n");
console.log(`Wrote ${Object.keys(links).length} Round 1 links.`);
await browser.close();
