import fs from "node:fs";

// Load resolved URLs and final catalog
const resolved = JSON.parse(fs.readFileSync("scratch/resolved_all_exact.json", "utf8"));
const resMap = new Map(resolved.map(r => [r.orig, r.final]));

const finalCatalog = JSON.parse(fs.readFileSync("scratch/final_catalog.json", "utf8"));
const catalogByUrl = new Map();
for (const item of finalCatalog) {
  catalogByUrl.set(item.origUrl, item);
  catalogByUrl.set(item.finalUrl, item);
}

// Map of canonical rules by genre / section
const rulesDb = {
  "twilight_canal_view": `* Shade some cells so that all shaded cells form an orthogonally connected area.
* There cannot be a 2x2 area of shaded cells.
* An unshaded clue indicates the number of shaded cells in a contiguous line starting from that cell in the four cardinal directions.
* A shaded clue indicates the number of unshaded cells in a contiguous line starting from that cell in the four cardinal directions.`,

  "twilight_kurodoko": `* Shade some cells so that all unshaded cells form an orthogonally connected area.
* Shaded cells cannot be orthogonally adjacent.
* An unshaded clue indicates the number of unshaded cells seen in a straight line vertically or horizontally, including itself.
* A shaded clue indicates the number of shaded cells seen in a straight line diagonally, including itself.`,

  "l_voxas": `Divide the grid into regions of orthogonally connected cells. Each region must be an L shape with a width of one cell, and with leg lengths of two or three cells. Borders must separate two different regions. Borders with white dots separate legs with the same size and orientation. Borders with black dots separate legs with neither the same size nor the same orientation. Borders with grey dots separate legs with either the same size or the same orientation, but not both. (For the corner cell of a region, take the leg that is parallel to the border.)`,

  "l_dots": `Divide the grid into regions of orthogonally connected cells. Each region must be an L shape with a width of one cell. Each dot marks the middle of the region it belongs to.`,

  "skyscrapers": `Place a number from 1 to 6 (1 to 4 in the example) into each cell so that each row and column contains every number from that range with no repeats. A clue outside the grid represents how many cells in the corresponding row or column contain a larger number than all cells before it in that row or column from the direction of the clue. Four grids next to each side of the center grid represent possible clue candidates (1-6 for the puzzle and 1-4 for the example) for that side. Shade all invalid clue candidates, and unshade the correct ones. Whenever you shade a cell and reveal an arrow, also shade the neighboring cell toward which the arrow is pointing. The newly shaded cell may be empty, contain another arrow, or contain a number (indicating that the number is the correct clue, and you can then unshade it.) The answer checker considers only numbers inside the center grid in.`,

  "slitherlink_polygraph": `Connect some pairs of orthogonally adjacent dots to form a single non-intersecting loop. Clues outside the loop represent the number of used edges surrounding the clue. Clues inside the loop represent the number of unused edges surrounding the clue. Some clues are initially hidden. To reveal more clues, shade cells inside the loop, and unshade cells outside the loop. The answer checker works for both edges and shading.`,

  "choco_banana_treasure_hunt": `Shade some cells so that all regions of orthogonally connected shaded cells are rectangular and all regions of orthogonally connected unshaded cells are not rectangular. A number clue represents the size of its region. In addition, there are letter clues. A region may contain both number and letter clues. If it contains any letter, it must contain exactly two - one uppercase letter and one lowercase letter. Both letters then form the coordinate (as defined outside the grid) of a number clue, which must be shaded (unshaded) if the letter clues are shaded (unshaded). Some letters are stylized to avoid ambiguity. Some clues are initially hidden and are only revealed throughout the solve.`,

  "foreshadow_crossing": `Draw a directed loop through the centers of some cells. The loop may cross itself on an empty cell, but not on a cell with a number clue. No two crossings are orthogonally or diagonally adjacent. Each number clue must be on the loop, and it indicates the distance traveled along the loop from itself to the next crossing.`,

  "remembered_choco_frozen_banana": `Shade some cells so that all regions of orthogonally connected shaded cells are rectangular and all regions of orthogonally connected unshaded cells are not rectangular. A clue represents the size of its shaded/unshaded region. In addition, draw a directed loop through all shaded cells and some unshaded cells. The loop must go straight on unshaded cells. The loop may cross itself on an unshaded cell, but never on a shaded cell. The loop may visit each shaded region more than once. Each visit in a shaded region must have the same number of cells as the next visit (in an unshaded region) in the loop's direction.`,

  "pentominous_outside": `Divide the grid into regions of five orthogonally connected cells so that no two regions of the same shape share an edge, counting rotations and reflections as the same. If a row or a column is preceded by any clue, those clues describe all letters associated with pentomino shapes in that row or column, in order. A question mark represents one letter. An asterisk represents any number of letters, including none at all.`,

  "guide_exit": `Shade some cells so that no two shaded cells are orthogonally adjacent and the remaining unshaded cells form one orthogonally connected area. No complete loop of cells may be unshaded (including 2x2s). Each clue must be shaded, and it indicates that in that many cells on the unique path of diagonally connected shaded cells from the clue toward the border, the next shaded cell on the path is in the arrow's direction.`,

  "ice_walk_delayed": `Draw an oriented loop through the centers of some cells which passes through each numbered cell. Two perpendicular line segments may intersect each other only on icy cells, but they may not turn at their intersection or otherwise overlap. The loop may not turn on icy cells. A number indicates how many cells make up the continuous non-icy section of the loop after it enters and exits the next continuous icy-cell(s) along the loop.`,

  "kurotto_banana": `(Choco Banana + Kurotto)
Standard Choco Banana rules apply: shade some cells so that all areas of orthogonally connected shaded cells are rectangular and all areas of orthogonally connected unshaded cells are not rectangular. A clue represents the size of its group of shaded/unshaded cells.
Kurotto rules apply: circles with numbers indicate the sum of the sizes of the shaded cell groups horizontally or vertically adjacent to the circle.`,

  "disorderly_tapa_like_loop": `(Disorderly Loop (Unknown Direction) + Tapa-like Loop)
Clarification: For Disorderly Loop, the direction of the clue is not given.
Draw a non-intersecting loop through the centers of some empty cells. Clues represent the lengths of consecutive loop segments in the 8 surrounding cells.`,

  "ripple_effect": `Standard Ripple Effect rules: Place a number into each cell so that each region contains the numbers from 1 to N with no repeats, where N is the number of cells in the region. Two instances of the same number in the same row or column must have at least as many cells between them as the value of the number.`,

  "choco_banana_5": `There are five puzzles. Replace the question mark with one of 1, 2, 3, 4, or 5, then solve as a standard Choco Banana: Shade some cells so that all areas of orthogonally connected shaded cells are rectangular and all areas of orthogonally connected unshaded cells are not rectangular. A clue represents the size of its group of shaded/unshaded cells.`,

  "instructionless": `Instructionless Penpa version (with answer check). Rules are not explicitly given and must be deduced from the grid, clues, and feedback.`,

  "ls58_puzzle": `Instructionless logic puzzle. Rules are not explicitly given and must be deduced from the grid and clue layout.`,

  "territory_one_square": `Shade some cells such that no shaded cells are orthogonally adjacent. All unshaded cells form an orthogonally connected area. Clues cannot be shaded, and they represent the size of the largest possible unshaded rectangle that overlaps this clue. In addition, exactly ONE clue in the whole grid can represent the size of the largest unshaded square.`,

  "choco_banana_one_square": `Shade some cells so that all groups of orthogonally connected shaded cells are rectangular and all groups of orthogonally connected unshaded cells are not rectangular. A clue represents the size of its group of shaded/unshaded cells. In addition, exactly ONE group of shaded cells in the whole grid is a square.`,

  "balance_loop_hidden_white": `Draw a non-intersecting loop through the centers of some cells that passes through every circle. The straight line segments coming out of a white circle must have equal length, while the straight line segments coming out of a black circle must have different lengths. A clue in a circle represents the sum of the lengths of these two line segments. Additionally, there is exactly one empty cell in the entire grid where a white circle can be added to.`,

  "canal_view_connected": `Classic Canal View Rules + all unshaded cells form one orthogonally connected region.
(Classic Canal View: Shade some cells to form an orthogonally connected area with no 2x2 shaded. Clues represent the number of shaded cells seen in a straight line horizontally or vertically.)`,

  "masyu_connected": `Classic Masyu Rules + all cells unused by the loop and all cells with a white circle form one orthogonally connected region.
(Classic Masyu: Draw a loop passing through all circles. White circles: straight through and turn in at least one adjacent cell. Black circles: turn at circle and go straight for at least two cells in both directions.)`,

  "contact": `Divide the grid into dominoes.
1. Each number indicates how many dominoes are orthogonally adjacent to the domino containing the number.
2. Dominoes may contain any number of given numbers.`,

  "rampage": `Divide the grid into dominoes.
1. Each number represents a rampaging bull, which behaves as follows. The bull first moves to the other cell of the domino it's in, and then moves one extra space (thus breaking through the opposite short edge into a new domino). It then repeats this procedure with the new domino it's in, and so on.
2. The number indicates how many dominoes the bull passes through, including the initial one.
3. As a special case, if the bull never leaves the grid, the number is infinity (∞).`,

  "turnaround": `Draw a loop traveling orthogonally on cells.
1. The loop must visit all numbers.
2. Each number indicates how many turns the loop makes among the three cells: the number itself, and the cells immediately before and after it in the loop.`,

  "slitherlink_turnaround_full": `Divide the grid into two regions of orthogonally connected cells, then solve one region as Slitherlink (Full) and the other as Turnaround (Full). It is possible that a Turnaround clue is also valid for Slitherlink.
Slitherlink (Full): Connect some pairs of orthogonally adjacent dots to form a single non-intersecting loop that uses ALL dots. Clues represent the number of edges drawn surrounding the clue (up to four).
Turnaround (Full): Draw a non-intersecting loop through the centers of ALL cells. A number indicates how many times the loop makes a turn within the three-cell portion of the loop with the clued cell in the middle.
Answer checker: Edge (normal) for Slitherlink and Line (normal) for Turnaround. Shading is ignored.`,

  "evolmino": `Place squares into some white cells such that exactly one square in each orthogonally connected group of squares is on part of an arrow. Each arrow must pass through at least two different groups of squares. Each group of squares must be exactly the same shape as the one that came before it on the same arrow (if it exists), without rotation or reflection, plus one additional square.`,

  "hasu_no_mura": `Shade some cells such that all shaded cells form one orthogonally connected network. No 2x2 region may be entirely shaded. Clues cannot be shaded and indicate the sum of the areas of the unshaded regions using the (up to 4) cells diagonally adjacent to the clue. If a region uses multiple of these cells, it is only counted once.`,

  "mirror_loop": `Draw a non-intersecting loop through the centers of some cells. The blue edges are mirrors, which reflect loop segments on one side of the mirror to the other side, up to the nearest grid border or another mirror. Every mirror must reflect at least one loop segment, and the loop may pass through a mirror.`,

  "coop_puzzles": `Reprising LS30 (Co-op Puzzles) - ??? and ??? Standard rules for each genre apply.`,

  "tapa_rope": `Shade some cells so that all shaded cells form one orthogonally connected area. Clues cannot be shaded, and represent the lengths of the blocks of consecutive shaded cells along the length of rope attached to the clue, from end to end. No 2x2 region may be entirely shaded.`,

  "canal_view_disco": `Shade some cells so that all shaded cells form one orthogonally connected area and no 2x2 region is entirely shaded. Clues cannot be shaded, and represent the number of shaded cells connected in a straight line horizontally or vertically to the clue. A question mark represents an unknown number. In addition, each region must contain exactly two separate orthogonally connected group of shaded cells.`,

  "pentominous_partial": `Divide the grid into regions of five orthogonally connected cells so that no two regions of the same shape share an edge, counting rotations and reflections as the same. Clued cells must belong to a region which the clue could fit inside, without rotating and reflecting. A region may contain any number of clues, including zero.`,

  "choco_banana_inequality": `Shade some cells so that all areas of orthogonally connected shaded cells are rectangular and all areas of orthogonally connected unshaded cells are not rectangular. A clue represents the size of its group of shaded/unshaded cells. Clues are not fully specified and must strictly follow the inequality values given.`,

  "pattern_square_size": `Shade some cells such that each of the six 2x2 shading patterns (as listed below the grid) or their rotations appears exactly once in each row and column of 2x2 bold regions. A clue must be shaded, and it represents the size of its group of orthogonally connected shaded cells. A group may contain multiple clues. A question mark represents a positive number.`,

  "pattern_square_cts": `Shade some cells such that each of the six 2x2 shading patterns (as listed below the grid) appears exactly once in each row and column of 2x2 bold regions, allowing rotations. Clues outside the grid represent the lengths of the blocks of consecutive shaded cells in the corresponding row or column, in order. A question mark represents one block of an unknown number of cells. An asterisk represents any number of blocks of shaded cells, including none at all.`,

  "yajiring_ring": `Shade some cells so that no two shaded cells are orthogonally adjacent, and draw rectangular loops through the centers of empty cells so that every empty cell gets used. Clues cannot be shaded, and represent the number of shaded cells in a straight line in the indicated direction. The sides of different rectangles may intersect each other, but not turn at their intersection or otherwise overlap.`,

  "alphabet_asp": `Place letters into some empty cells such that each orthogonally connected group forms a word. Adjacent letters in a word must also be orthogonally adjacent in the grid. Different words may not share an edge with one another. All words are given outside the grid, and must each appear exactly once. A clue represents the first letter seen in the indicated direction. Clues cannot see through each other. Each letter must not be able to see itself in a different word in a straight line unless a clued cell blocks its view.`,

  "choco_banana_tower": `Shade some cells so that all areas of orthogonally connected shaded cells are rectangular and all areas of orthogonally connected unshaded cells are not rectangular. A clue represents the size of its group of shaded/unshaded cells.`,

  "pencils_look_air": `Normal Pencils Rules Apply + two pencils of the same size cannot see each other through vertical/horizontal lines of non-pencil body cells. (pencil tips do not count towards a pencil's size).
(Normal Pencils: Divide the grid into pencils consisting of a 1x1 triangle tip and a rectangular body of length equal to the number of lead points.)`,

  "pentominous_myopia": `Divide the grid into regions of five orthogonally connected cells so that no two regions of the same shape share an edge, counting rotations and reflections as the same. Clued cells contain arrows indicating all of the orthogonal directions which tie for having a pentomino with that letter's shape appearing closest to the clued cell.`,

  "choco_banana_thermo": `Standard Choco Banana rules apply: shade some cells so that all areas of orthogonally connected shaded cells are rectangular and all areas of orthogonally connected unshaded cells are not rectangular. A clue represents the size of its group of shaded/unshaded cells. The sizes of regions along the thermometer shape must strictly increase from the bulb (round end) to the tip.`,

  "pentominous_irrwisch": `Divide the grid into regions of five orthogonally connected cells so that no two regions of the same shape share an edge, counting rotations and reflections as the same. Clued cells must belong to a region with the pentomino shape associated with that letter. Irrwisch variant - each instance of A represents a different letter.`,

  "choco_banana_classic": `Standard Choco Banana rules apply: shade some cells so that all areas of orthogonally connected shaded cells are rectangular and all areas of orthogonally connected unshaded cells are not rectangular. A clue represents the size of its group of shaded/unshaded cells.`,

  "kissing_polyominoes": `Divide the grid into polyominoes such that identical polyominoes (counting rotations and reflections) do not touch at an edge or corner ("kissing"). Numbers indicate the size of the polyomino.`
};

// Now read logic showcase.txt line by line and match every single URL
const rawText = fs.readFileSync("logic showcase.txt", "utf8");
const lines = rawText.split(/\r?\n/);

let currentLS = "LS00";
const entries = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const lsMatch = line.match(/^LS\s*(\d+)/i);
  if (lsMatch) {
    currentLS = "LS" + lsMatch[1].padStart(2, "0");
    continue;
  }

  const urls = [...line.matchAll(/https?:\/\/[^\s\)\>]+/g)].map(m => m[0].replace(/[.,\)]+$/, ""));
  if (urls.length === 0) continue;

  for (let uIdx = 0; uIdx < urls.length; uIdx++) {
    const rawUrl = urls[uIdx];
    const finUrl = resMap.get(rawUrl) || rawUrl;
    const catItem = catalogByUrl.get(rawUrl) || catalogByUrl.get(finUrl);

    // Determine rule key
    let ruleKey = "";
    let title = catItem ? catItem.title : "Puzzle";
    let role = catItem ? catItem.role : (urls.length === 2 && uIdx === 0 ? "example" : "puzzle");
    let svgBase = catItem ? catItem.baseName : null;

    if (currentLS === "LS49") {
      ruleKey = i < 14 ? "twilight_canal_view" : "twilight_kurodoko";
      if (!title || title === "Puzzle") title = ruleKey === "twilight_canal_view" ? "Twilight Canal View" : "Twilight Kurodoko";
    } else if (currentLS === "LS50") {
      ruleKey = line.includes("L-Voxas") || i < 30 ? "l_voxas" : "l_dots";
      if (!title || title === "Puzzle") title = ruleKey === "l_voxas" ? "L-Voxas" : "L-Dots";
    } else if (currentLS === "LS51") {
      if (line.includes("Skyscrapers") || i < 37) ruleKey = "skyscrapers";
      else if (line.includes("Slitherlink") || i < 40) ruleKey = "slitherlink_polygraph";
      else ruleKey = "choco_banana_treasure_hunt";
    } else if (currentLS === "LS52") {
      ruleKey = line.includes("Foreshadow") || i < 47 ? "foreshadow_crossing" : "remembered_choco_frozen_banana";
    } else if (currentLS === "LS53") {
      ruleKey = "pentominous_outside";
    } else if (currentLS === "LS54") {
      ruleKey = line.includes("Guide Exit") || i < 61 ? "guide_exit" : "ice_walk_delayed";
    } else if (currentLS === "LS55") {
      ruleKey = line.includes("Kurotto") || i < 69 ? "kurotto_banana" : "disorderly_tapa_like_loop";
    } else if (currentLS === "LS56") {
      ruleKey = line.includes("cbanana") ? "choco_banana_5" : "ripple_effect";
      title = line.includes("cbanana") ? "Choco Banana (Replace ?)" : `Ripple Effect #${entries.filter(e => e.ls === "LS56").length + 1}`;
    } else if (currentLS === "LS57") {
      ruleKey = "instructionless";
    } else if (currentLS === "LS58") {
      ruleKey = "ls58_puzzle";
      title = `LS58 Puzzle ${entries.filter(e => e.ls === "LS58").length + 1}`;
    } else if (currentLS === "LS59") {
      if (line.includes("Territory")) ruleKey = "territory_one_square";
      else if (line.includes("Choco Banana")) ruleKey = "choco_banana_one_square";
      else ruleKey = "balance_loop_hidden_white";
    } else if (currentLS === "LS60") {
      ruleKey = line.includes("Canal View") ? "canal_view_connected" : "masyu_connected";
    } else if (currentLS === "LS61") {
      if (rawUrl.includes("contact") || line.includes("Contact") || (catItem && catItem.title.includes("contact"))) ruleKey = "contact";
      else if (rawUrl.includes("rampage") || line.includes("Rampage") || (catItem && catItem.title.includes("rampage")) || (catItem && catItem.title.includes("roadblocks"))) ruleKey = "rampage";
      else ruleKey = "turnaround";
    } else if (currentLS === "LS62") {
      if (rawUrl.includes("cbanana")) ruleKey = "choco_banana_classic";
      else if (rawUrl.includes("kissing")) ruleKey = "kissing_polyominoes";
      else ruleKey = "pentominous_outside";
      title = ruleKey;
    } else if (currentLS === "LS63") {
      ruleKey = "slitherlink_turnaround_full";
    } else if (currentLS === "LS64") {
      if (rawUrl.includes("evolmino")) ruleKey = "evolmino";
      else if (rawUrl.includes("hasu")) ruleKey = "hasu_no_mura";
      else ruleKey = "mirror_loop";
      title = ruleKey;
    } else if (currentLS === "LS65") {
      ruleKey = rawUrl.includes("google") ? "coop_puzzles" : "tapa_rope";
      title = ruleKey;
    } else if (currentLS === "LS66") {
      ruleKey = "canal_view_disco";
    } else if (currentLS === "LS67") {
      ruleKey = line.includes("Pentominous") || rawUrl.includes("227rn5yj") ? "pentominous_partial" : "choco_banana_inequality";
    } else if (currentLS === "LS68") {
      ruleKey = line.includes("Size") || rawUrl.includes("2cznfxqe") ? "pattern_square_size" : "pattern_square_cts";
    } else if (currentLS === "LS69") {
      ruleKey = "yajiring_ring";
    } else if (currentLS === "LS70") {
      ruleKey = "alphabet_asp";
    } else if (currentLS === "LS71") {
      ruleKey = "choco_banana_tower";
    } else if (currentLS === "LS72") {
      ruleKey = "pencils_look_air";
    } else if (currentLS === "LS73") {
      ruleKey = "pentominous_myopia";
    } else if (currentLS === "LS74") {
      ruleKey = "choco_banana_thermo";
    } else if (currentLS === "LS75") {
      ruleKey = "pentominous_irrwisch";
    }

    const rules = rulesDb[ruleKey] || "Rules available in logic showcase.txt";

    entries.push({
      ls: currentLS,
      title: title || ruleKey,
      role: role,
      ruleKey: ruleKey,
      rules: rules,
      origUrl: rawUrl,
      finalUrl: finUrl,
      svgBase: svgBase
    });
  }
}

console.log(`Matched ${entries.length} total URLs with rules.`);

// Format rules.txt
const outLines = [
  "================================================================================",
  "LOGIC SHOWCASE - PUZZLE RULES EXTRACTED BY URL",
  "================================================================================",
  ""
];

let lastLS = "";
for (let i = 0; i < entries.length; i++) {
  const e = entries[i];
  if (e.ls !== lastLS) {
    outLines.push("");
    outLines.push("--------------------------------------------------------------------------------");
    outLines.push(`[${e.ls}]`);
    outLines.push("--------------------------------------------------------------------------------");
    lastLS = e.ls;
  }

  outLines.push("");
  outLines.push(`### [${String(i+1).padStart(2, '0')}] ${e.title} (${e.role.toUpperCase()})`);
  outLines.push(`URL: ${e.origUrl}`);
  if (e.finalUrl !== e.origUrl) {
    outLines.push(`Resolved: ${e.finalUrl}`);
  }
  if (e.svgBase) {
    outLines.push(`Puzzle SVG:   generated/logic_showcase/${e.svgBase}.svg`);
    outLines.push(`Solution SVG: generated/logic_showcase/${e.svgBase}_solution.svg`);
  }
  outLines.push("RULES:");
  // Indent rules
  const ruleLines = e.rules.split("\n");
  for (const rl of ruleLines) {
    outLines.push(`  ${rl}`);
  }
}

outLines.push("");
outLines.push("================================================================================");
outLines.push("END OF RULES");
outLines.push("================================================================================");

fs.writeFileSync("rules.txt", outLines.join("\n"), "utf8");
console.log("Successfully wrote rules.txt with " + entries.length + " entries!");
