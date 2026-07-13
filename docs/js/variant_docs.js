(function() {
    var variants = {
        "classic": {
            title: "Classic Sudoku",
            status: "Supported",
            storage: "Given and solution digits are read from the cell number maps.",
            csp: "Built into the CSP core as three all-different families: 9 rows, 9 columns, and 9 boxes.",
            propagation: "A domain removes every digit already used by its row, column, or box. MRV chooses the smallest remaining domain during search."
        },
        "odd-even": {
            title: "Odd / Even Sudoku",
            status: "Supported",
            storage: "Foreground style-3 circle_L symbols represent odd cells and square_L symbols represent even cells. Clicking a cell cycles circle, square, then empty.",
            csp: "The registered oddEven handler requires marked cells to have the indicated parity.",
            propagation: "Odd cells retain 1, 3, 5, 7, 9; even cells retain 2, 4, 6, 8, with every displayed candidate still backed by a complete solution."
        },
        "diagonal": {
            title: "Diagonal Sudoku",
            status: "Supported",
            storage: "The global constraint uses Penpa's native style-12 lines on both long diagonals, so the notation is included in SVG and URL exports.",
            csp: "The registered diagonalAllDifferent handler applies an all-different constraint to both main nine-cell diagonals.",
            propagation: "A candidate is rejected immediately when it repeats an assigned digit on either diagonal; exact extraction then retains only candidates backed by a complete diagonal-Sudoku solution."
        },
        "anti-diagonal": {
            title: "Anti-Diagonal Sudoku",
            status: "Supported",
            storage: "The global constraint uses Penpa's native style-12 lines on both long diagonals, so the notation is included in SVG and URL exports.",
            csp: "The registered antiDiagonals handler requires each main diagonal to contain exactly three distinct digits, each appearing three times.",
            propagation: "Partial diagonals may contain no more than three distinct digits and no digit more than three times; completion verifies the exact 3-3-3 distribution."
        },
        "anti-king": {
            title: "Anti-King Sudoku",
            status: "Supported",
            storage: "This is a global constraint represented by its persistent toolbar chip and requires no cell marks.",
            csp: "The registered antiKing handler requires cells a king's move apart to contain different digits.",
            propagation: "Every assignment immediately removes that digit from all horizontally, vertically, and diagonally adjacent cells."
        },
        "anti-knight": {
            title: "Anti-Knight Sudoku",
            status: "Supported",
            storage: "This is a global constraint represented by its persistent toolbar chip and requires no cell marks.",
            csp: "The registered antiKnight handler requires cells a chess knight's move apart to contain different digits.",
            propagation: "Every assignment removes that digit from all cells one-by-two or two-by-one cells away."
        },
        "non-consecutive": {
            title: "Non-Consecutive Sudoku",
            status: "Supported",
            storage: "This is a global constraint represented by its persistent toolbar chip and requires no edge marks.",
            csp: "The registered nonConsecutive handler forbids orthogonally adjacent digits whose difference is one.",
            propagation: "An assigned digit removes its predecessor and successor from each orthogonal neighbor."
        },
        "arrow": {
            title: "Arrow Sudoku",
            status: "Supported",
            storage: "An arrow path is converted to one circle cell and one or more shaft cells.",
            csp: "The registered arrows handler requires the circle digit to equal the shaft sum.",
            propagation: "Partial shaft sums are bounded with minimum 1 and maximum 9 for each unassigned shaft cell."
        },
        "thermo": {
            title: "Thermo Sudoku",
            status: "Supported",
            storage: "Thermo and bulb-less thermo paths are normalized into ordered cell arrays.",
            csp: "The registered thermos handler requires strictly increasing digits from bulb to tip.",
            propagation: "Position bounds and assigned neighboring cells immediately prune each domain."
        },
        "little-killer": {
            title: "Little Killer Sudoku",
            status: "Planned",
            storage: "Little-killer arrows and outside sums are available in the editor.",
            csp: "No diagonal-sum CSP handler is registered yet.",
            propagation: "Planned behavior uses diagonal sum bounds without the killer-cage distinctness rule."
        },
        "killer": {
            title: "Killer Sudoku",
            status: "Supported",
            storage: "Native Penpa cage boundary segments are flood-filled into cage cell lists. A sum typed from any cell in a cage is anchored to that cage's top-left cell.",
            csp: "The registered killers handler enforces a target sum and distinct digits within every cage.",
            propagation: "The handler computes minimum and maximum remaining sums from digits not already used in the cage."
        },
        "difference": {
            title: "Difference Sudoku",
            status: "Planned",
            storage: "Difference clues are currently edge-number editor objects.",
            csp: "No absolute-difference CSP handler is registered yet.",
            propagation: "Planned behavior retains only neighbor pairs whose absolute difference matches the clue."
        },
        "kropki": {
            title: "Kropki Sudoku",
            status: "Supported",
            storage: "Interior edge symbols use circle_SS value 2 for black and value 1 for white. New dots are stored on the foreground symbol layer so they render in front of lines.",
            csp: "The registered kropki handler enforces a 1:2 ratio for black dots and consecutive digits for white dots.",
            propagation: "Each candidate must occur in a complete solution. Explicit black and white dots always apply. The Negative Kropki toggle optionally makes every undotted orthogonal edge forbid both consecutive and 1:2 pairs; it is off by default."
        },
        "palindrome": {
            title: "Palindrome Sudoku",
            status: "Supported",
            storage: "Foreground style-5 center-to-center line segments are normalized into ordered cell paths.",
            csp: "The registered palindromes handler requires cells mirrored across the center of each path to contain equal digits.",
            propagation: "A partial assignment is rejected as soon as two assigned mirrored cells differ; exact candidate extraction then proves each remaining digit against a complete solution."
        },
        "sandwich": {
            title: "Sandwich Sudoku",
            status: "Supported",
            storage: "Outside sandwich sums are available as number clues.",
            csp: "The registered sandwiches handler finds 1 and 6 in each clued row or column and requires the digits strictly between them to total the outside clue.",
            propagation: "Partial assignments enumerate feasible endpoint positions and reject branches whose known sum already exceeds the clue or whose open cells cannot reach it."
        },
        "quadruple": {
            title: "Quadruple Sudoku",
            status: "Planned",
            storage: "Corner clues and quadruple symbols are available in the editor.",
            csp: "No four-cell membership CSP handler is registered yet.",
            propagation: "Planned behavior requires every listed clue digit to occur among the four surrounding cells."
        },
        "xv": {
            title: "XV Sudoku",
            status: "Supported",
            storage: "Foreground small-number edge objects store V and X clues. Clicking an interior edge cycles V, X, then empty.",
            csp: "The registered xv handler requires V pairs to sum to 5 and X pairs to sum to 10.",
            propagation: "The optional Negative XV toggle makes every unmarked orthogonal edge sum to neither 5 nor 10; it is off by default."
        },
        "between-line": {
            title: "Between Line Sudoku",
            status: "Planned",
            storage: "Endpoint circles and connecting line paths are available in the editor.",
            csp: "No between-line CSP handler is registered yet.",
            propagation: "Planned behavior constrains every interior line digit to lie strictly between the endpoint digits."
        },
        "battenberg": {
            title: "Battenberg Sudoku",
            status: "Supported",
            storage: "Battenberg marks are stored as foreground Sudoku-style symbols; the optional negative rule is stored on the puzzle.",
            csp: "The battenburg handler enforces alternating odd/even parity around marked intersections. With Negative Battenburg enabled, every unmarked internal four-cell corner receives the complementary not-checkerboard constraint.",
            propagation: "Partial marked corners reject equal parity across an edge or differing parity across a diagonal. Negative corners are rejected as soon as all four cells form the forbidden checkerboard."
        }
    };

    var slug = document.body.dataset.variant;
    var variant = variants[slug];
    var root = document.getElementById("variant-document");
    if (!variant || !root) {
        return;
    }
    var statusClass = variant.status === "Supported" ? "status" : "status planned";
    root.innerHTML =
        '<nav><a href="../csp.html">CSP overview</a><a href="./index.html">All variants</a><a href="../index.html">Open Penpa+</a></nav>' +
        '<h1>' + variant.title + '</h1>' +
        '<p class="' + statusClass + '">' + variant.status + '</p>' +
        '<h2>Editor representation</h2><p>' + variant.storage + '</p>' +
        '<h2>CSP constraint</h2><p>' + variant.csp + '</p>' +
        '<h2>Domain filtering</h2><p>' + variant.propagation + '</p>' +
        '<h2>Extension point</h2><p>The implementation belongs in a handler registered with <code>SudokuCSP.registerConstraint</code>. Puzzle data is normalized in <code>sudoku_solver.js</code> before the CSP runtime receives it.</p>';
})();
