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
            status: "Planned",
            storage: "Parity marks currently use Penpa symbols.",
            csp: "The editor mode exists, but no odd/even CSP handler is registered yet.",
            propagation: "Planned domains: odd cells keep 1, 3, 5, 7, 9; even cells keep 2, 4, 6, 8."
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
            storage: "Killer cage paths and their corner totals are normalized into cell lists and a target sum.",
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
            status: "Planned",
            storage: "Palindrome lines are available as editor line paths.",
            csp: "No mirrored-equality CSP handler is registered yet.",
            propagation: "Planned behavior intersects the domains of cells mirrored across the center of each line."
        },
        "sandwich": {
            title: "Sandwich Sudoku",
            status: "Planned",
            storage: "Outside sandwich sums are available as number clues.",
            csp: "No row/column sandwich CSP handler is registered yet.",
            propagation: "Planned behavior enumerates possible positions of 1 and 9 and bounds the digits between them."
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
            status: "Planned",
            storage: "X and V edge clues are available as edge-number objects.",
            csp: "No pair-sum CSP handler is registered yet.",
            propagation: "Planned behavior keeps adjacent pairs summing to 10 for X or 5 for V."
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
            status: "Planned",
            storage: "Battenberg marks are available as Sudoku-style symbols.",
            csp: "No parity-checkerboard CSP handler is registered yet.",
            propagation: "Planned behavior allows only alternating odd/even parity around the marked four-cell intersection."
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
