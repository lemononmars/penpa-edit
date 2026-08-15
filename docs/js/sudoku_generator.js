/* Uniqueness-preserving Sudoku puzzle generation built on the shared CSP. */
var SudokuGenerator = (function() {
    var CSP = typeof SudokuCSP !== "undefined" ? SudokuCSP :
        (typeof require === "function" ? require("./sudoku_csp.js") : null);

    function seededRandom(seed) {
        var state = (Number(seed) || Date.now()) >>> 0;
        return function() {
            state = (state + 0x6D2B79F5) >>> 0;
            var value = state;
            value = Math.imul(value ^ (value >>> 15), value | 1);
            value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
            return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
        };
    }

    function shuffle(values, random) {
        var copy = values.slice();
        for (var index = copy.length - 1; index > 0; index--) {
            var other = Math.floor(random() * (index + 1));
            var temporary = copy[index];
            copy[index] = copy[other];
            copy[other] = temporary;
        }
        return copy;
    }

    function emptyBoard(size) {
        return Array.from({ length: size }, function() { return Array(size).fill(0); });
    }

    function classicSolution(size, random) {
        var boxHeight = size === 6 ? 2 : 3;
        var boxWidth = size / boxHeight;
        var bands = shuffle(Array.from({ length: size / boxHeight }, function(_, value) { return value; }), random);
        var stacks = shuffle(Array.from({ length: size / boxWidth }, function(_, value) { return value; }), random);
        var rows = [];
        var cols = [];
        bands.forEach(function(band) {
            shuffle(Array.from({ length: boxHeight }, function(_, value) { return value; }), random)
                .forEach(function(row) { rows.push(band * boxHeight + row); });
        });
        stacks.forEach(function(stack) {
            shuffle(Array.from({ length: boxWidth }, function(_, value) { return value; }), random)
                .forEach(function(col) { cols.push(stack * boxWidth + col); });
        });
        var digits = shuffle(Array.from({ length: size }, function(_, value) { return value + 1; }), random);
        return rows.map(function(row) {
            return cols.map(function(col) {
                return digits[(row * boxWidth + Math.floor(row / boxHeight) + col) % size];
            });
        });
    }

    function diagonals(size) {
        return [
            Array.from({ length: size }, function(_, index) { return { row: index, col: index }; }),
            Array.from({ length: size }, function(_, index) { return { row: index, col: size - index - 1 }; })
        ];
    }

    // Derive complete outside-clue sets from an already solved classic grid.
    // Each side is read inward so the same mark representation can be restored
    // into Penpa after digit pruning.
    function outsideCluesForSolution(solution, variants) {
        var size = solution.length;
        var constraints = { outsideRelations: [], skyscrapers: [], sandwiches: [], rossiniLines: [] };
        var marks = [];
        var sides = ["top", "bottom", "left", "right"];
        function sightline(side, index) {
            if (side === "top") return Array.from({ length: size }, function(_, row) { return { row: row, col: index }; });
            if (side === "bottom") return Array.from({ length: size }, function(_, row) { return { row: size - 1 - row, col: index }; });
            if (side === "left") return Array.from({ length: size }, function(_, col) { return { row: index, col: col }; });
            return Array.from({ length: size }, function(_, col) { return { row: index, col: size - 1 - col }; });
        }
        function valuesFor(cells) {
            return cells.map(function(cell) { return solution[cell.row][cell.col]; });
        }
        function visibility(values) {
            var tallest = 0;
            return values.reduce(function(total, value) {
                if (value <= tallest) return total;
                tallest = value;
                return total + 1;
            }, 0);
        }
        variants.forEach(function(variant) {
            if (["xsums", "skyscraper", "numberedrooms", "rossini", "sandwich", "sumframe"].indexOf(variant) === -1) return;
            var targetSides = variant === "sandwich" ? ["top", "left"] : sides;
            targetSides.forEach(function(side) {
                for (var index = 0; index < size; index++) {
                    var cells = sightline(side, index);
                    var values = valuesFor(cells);
                    var value;
                    var direction;
                    if (variant === "xsums") {
                        value = values.slice(0, values[0]).reduce(function(total, digit) { return total + digit; }, 0);
                        constraints.outsideRelations.push({ relation: variant, value: value, cells: cells });
                    } else if (variant === "numberedrooms") {
                        value = values[values[0] - 1];
                        constraints.outsideRelations.push({ relation: variant, value: value, cells: cells });
                    } else if (variant === "sumframe") {
                        var frameLength = side === "top" || side === "bottom" ? (size === 6 ? 2 : 3) : (size === 6 ? 3 : 3);
                        value = values.slice(0, frameLength).reduce(function(total, digit) { return total + digit; }, 0);
                        constraints.outsideRelations.push({ relation: variant, value: value, cells: cells.slice(0, frameLength) });
                    } else if (variant === "skyscraper") {
                        value = visibility(values);
                        constraints.skyscrapers.push({ clue: value, cells: cells });
                    } else if (variant === "sandwich") {
                        var low = values.indexOf(1);
                        var high = values.indexOf(size);
                        value = values.slice(Math.min(low, high) + 1, Math.max(low, high))
                            .reduce(function(total, digit) { return total + digit; }, 0);
                        constraints.sandwiches.push({ clue: value, cells: cells });
                    } else {
                        var first = values.slice(0, 3);
                        direction = first[0] < first[1] && first[1] < first[2] ? "ascending" :
                            first[0] > first[1] && first[1] > first[2] ? "descending" : "none";
                        constraints.rossiniLines.push({ direction: direction, cells: cells.slice(0, 3) });
                    }
                    marks.push({ variant: variant, side: side, index: index, value: value, direction: direction });
                }
            });
        });
        return { constraints: constraints, marks: marks };
    }

    function cellKey(cell) {
        return cell.row + ":" + cell.col;
    }

    function pairKey(cells) {
        return cells.map(cellKey).sort().join("|");
    }

    function rotateCell(cell, size) {
        return { row: size - 1 - cell.row, col: size - 1 - cell.col };
    }

    function mirrorCellH(cell, size) {
        return { row: cell.row, col: size - 1 - cell.col };
    }

    function mirrorCellV(cell, size) {
        return { row: size - 1 - cell.row, col: cell.col };
    }

    function rotateCells(cells, size) {
        return cells.map(function(cell) { return rotateCell(cell, size); });
    }

    function globalConstraints(size, variants) {
        var constraints = {};
        if (variants.indexOf("diagonal") !== -1) constraints.diagonalAllDifferent = diagonals(size);
        if (variants.indexOf("anti diagonal") !== -1) constraints.antiDiagonals = diagonals(size);
        if (variants.indexOf("windoku") !== -1) {
            constraints.regionAllDifferent = [[1, 1], [1, 5], [5, 1], [5, 5]].map(function(start) {
                var region = [];
                for (var row = 0; row < 3; row++) {
                    for (var col = 0; col < 3; col++) region.push({ row: start[0] + row, col: start[1] + col });
                }
                return region;
            });
        }
        function addPairs(name, offsets) {
            if (variants.indexOf(name.replace(/([A-Z])/g, " $1").toLowerCase()) === -1) return;
            constraints[name] = [];
            for (var row = 0; row < size; row++) {
                for (var col = 0; col < size; col++) {
                    offsets.forEach(function(offset) {
                        var other = { row: row + offset[0], col: col + offset[1] };
                        if (other.row >= 0 && other.row < size && other.col >= 0 && other.col < size) {
                            constraints[name].push([{ row: row, col: col }, other]);
                        }
                    });
                }
            }
        }
        addPairs("antiKing", [[1, -1], [1, 1]]);
        addPairs("antiKnight", [[1, -2], [1, 2], [2, -1], [2, 1]]);
        addPairs("nonConsecutive", [[1, 0], [0, 1]]);
        if (variants.indexOf("symmetric unequal") !== -1 || variants.indexOf("symmetricunequal") !== -1) {
            constraints.symmetricUnequal = [];
            for (var suR = 0; suR < size; suR++) {
                for (var suC = 0; suC < size; suC++) {
                    var oppR = size - 1 - suR;
                    var oppC = size - 1 - suC;
                    if (suR < oppR || (suR === oppR && suC < oppC)) {
                        constraints.symmetricUnequal.push([{ row: suR, col: suC }, { row: oppR, col: oppC }]);
                    }
                }
            }
        }
        return constraints;
    }

    function makeSolution(size, variants, constraints, random) {
        var windokuOnly = variants.every(function(variant) {
            return variant === "classic" || variant === "windoku";
        }) && variants.indexOf("windoku") !== -1;
        if (windokuOnly && constraints.regionAllDifferent) {
            for (var windokuAttempt = 0; windokuAttempt < 2000; windokuAttempt++) {
                var windokuBase = classicSolution(size, random);
                var validWindoku = constraints.regionAllDifferent.every(function(region) {
                    var digits = region.map(function(cell) { return windokuBase[cell.row][cell.col]; });
                    return new Set(digits).size === region.length;
                });
                if (validWindoku) return windokuBase;
            }
        }
        var hasLineConstraints = (constraints.arrows && constraints.arrows.length) || (constraints.thermos && constraints.thermos.length);
        if (hasLineConstraints) {
            if (!constraints.supported) constraints.supported = [];
            if (constraints.arrows && constraints.arrows.length && constraints.supported.indexOf("arrow") === -1) constraints.supported.push("arrow");
            if (constraints.thermos && constraints.thermos.length && constraints.supported.indexOf("thermo") === -1) constraints.supported.push("thermo");
            var solved = CSP.solve(emptyBoard(size), constraints);
            if (solved && solved.solved) return solved.board;
            return null;
        }
        var needsSearch = variants.some(function(variant) {
            return ["diagonal", "anti diagonal", "anti king", "anti knight", "non consecutive", "windoku", "symmetric unequal", "symmetricunequal", "disjoint"].indexOf(variant) !== -1;
        });
        var base;
        if (!needsSearch) {
            for (var classicAttempt = 0; classicAttempt < 200; classicAttempt++) {
                base = classicSolution(size, random);
                if (solutionSupportsGeneratedMarks(base, variants)) return base;
            }
        } else {
            var solved = CSP.solve(emptyBoard(size), constraints);
            if (!solved.solved) throw new Error("The selected global variants do not admit a generated solution.");
            base = solved.board;
            if (variants.indexOf("non consecutive") !== -1 && solutionSupportsGeneratedMarks(base, variants)) {
                return base;
            }
            for (var mapAttempt = 0; mapAttempt < 200; mapAttempt++) {
                var digitMap = shuffle(Array.from({ length: size }, function(_, value) { return value + 1; }), random);
                var remapped = base.map(function(row) {
                    return row.map(function(value) { return digitMap[value - 1]; });
                });
                if (solutionSupportsGeneratedMarks(remapped, variants)) return remapped;
            }
        }
        throw new Error("Could not construct a rotationally paired mark for every selected variant.");
    }

    function oddEvenMarks(solution, random) {
        var size = solution.length;
        var count = size === 6 ? 8 : 14;
        var cells = shuffle(Array.from({ length: size * size }, function(_, index) {
            return { row: Math.floor(index / size), col: index % size };
        }), random).slice(0, count);
        return cells.map(function(cell) {
            return {
                cell: cell,
                parity: solution[cell.row][cell.col] % 2 ? "odd" : "even"
            };
        });
    }

    function edgeKind(solution, cells, variant) {
        var first = solution[cells[0].row][cells[0].col];
        var second = solution[cells[1].row][cells[1].col];
        if (variant === "kropki") {
            if (first === 2 * second || second === 2 * first) return "black";
            if (Math.abs(first - second) === 1) return "white";
        } else if (variant === "xv") {
            if (first + second === 5) return "V";
            if (first + second === 10) return "X";
        }
        return null;
    }

    function symmetricEdges(solution, variant, random) {
        var size = solution.length;
        var edges = {};
        for (var row = 0; row < size; row++) {
            for (var col = 0; col < size; col++) {
                [[1, 0], [0, 1]].forEach(function(offset) {
                    if (row + offset[0] >= size || col + offset[1] >= size) return;
                    var cells = [{ row: row, col: col }, { row: row + offset[0], col: col + offset[1] }];
                    edges[pairKey(cells)] = cells;
                });
            }
        }
        var marks = [];
        var fallback = null;
        var visited = {};
        Object.keys(edges).forEach(function(key) {
            if (visited[key]) return;
            var cells = edges[key];
            var rotated = rotateCells(cells, size);
            var rotatedKey = pairKey(rotated);
            visited[key] = visited[rotatedKey] = true;
            var firstKind = edgeKind(solution, cells, variant);
            var secondKind = edgeKind(solution, rotated, variant);
            if (!firstKind || !secondKind) return;
            var pair = [{ cells: cells, kind: firstKind }];
            if (rotatedKey !== key) pair.push({ cells: rotated, kind: secondKind });
            if (!fallback) fallback = pair;
            if (random() <= 0.42) marks.push.apply(marks, pair);
        });
        if (!marks.length && fallback) marks.push.apply(marks, fallback);
        return marks;
    }

    function symmetricOddEvenMarks(solution, random) {
        var size = solution.length;
        var marks = [];
        var fallback = null;
        var visited = {};
        for (var row = 0; row < size; row++) {
            for (var col = 0; col < size; col++) {
                var cell = { row: row, col: col };
                var rotated = rotateCell(cell, size);
                var key = cellKey(cell);
                if (visited[key]) continue;
                visited[key] = visited[cellKey(rotated)] = true;
                var pair = [{ cell: cell, parity: solution[row][col] % 2 ? "odd" : "even" }];
                if (cellKey(rotated) !== key) {
                    pair.push({ cell: rotated, parity: solution[rotated.row][rotated.col] % 2 ? "odd" : "even" });
                }
                if (!fallback) fallback = pair;
                if (random() <= 0.22) marks.push.apply(marks, pair);
            }
        }
        if (!marks.length && fallback) marks.push.apply(marks, fallback);
        return marks;
    }

    function checkerboard(solution, cells) {
        var parity = cells.map(function(cell) { return solution[cell.row][cell.col] % 2; });
        return parity[0] !== parity[1] && parity[0] !== parity[2] &&
            parity[0] === parity[3] && parity[1] === parity[2];
    }

    function symmetricBattenburg(solution, random) {
        var size = solution.length;
        var marks = [];
        var fallback = null;
        var visited = {};
        for (var row = 0; row < size - 1; row++) {
            for (var col = 0; col < size - 1; col++) {
                var cells = [{ row: row, col: col }, { row: row, col: col + 1 },
                    { row: row + 1, col: col }, { row: row + 1, col: col + 1 }];
                var key = pairKey(cells);
                if (visited[key]) continue;
                var rotated = rotateCells(cells, size);
                var rotatedKey = pairKey(rotated);
                visited[key] = visited[rotatedKey] = true;
                if (!checkerboard(solution, cells) || !checkerboard(solution, rotated)) continue;
                var pair = [{ cells: cells, kind: "marked" }];
                if (rotatedKey !== key) pair.push({ cells: rotated, kind: "marked" });
                if (!fallback) fallback = pair;
                if (random() <= 0.55) marks.push.apply(marks, pair);
            }
        }
        if (!marks.length && fallback) marks.push.apply(marks, fallback);
        return marks;
    }

    function allBattenburgWithNegative(solution) {
        var size = solution.length;
        var marks = [];
        for (var row = 0; row < size - 1; row++) {
            for (var col = 0; col < size - 1; col++) {
                var cells = [{ row: row, col: col }, { row: row, col: col + 1 },
                    { row: row + 1, col: col }, { row: row + 1, col: col + 1 }];
                var isChecker = checkerboard(solution, cells);
                marks.push({ cells: cells, kind: isChecker ? "marked" : "none" });
            }
        }
        return marks;
    }

    function allEdgesWithNegative(solution, variant) {
        var size = solution.length;
        var marks = [];
        for (var row = 0; row < size; row++) {
            for (var col = 0; col < size; col++) {
                [[row + 1, col], [row, col + 1]].forEach(function(neighbor) {
                    if (neighbor[0] >= size || neighbor[1] >= size) return;
                    var cells = [{ row: row, col: col }, { row: neighbor[0], col: neighbor[1] }];
                    var kind = edgeKind(solution, cells, variant) || "none";
                    marks.push({ cells: cells, kind: kind });
                });
            }
        }
        return marks;
    }

    function allConsecutiveWithNegative(solution) {
        var size = solution.length;
        var marks = [];
        for (var row = 0; row < size; row++) {
            for (var col = 0; col < size; col++) {
                [[row + 1, col], [row, col + 1]].forEach(function(neighbor) {
                    if (neighbor[0] >= size || neighbor[1] >= size) return;
                    var cells = [{ row: row, col: col }, { row: neighbor[0], col: neighbor[1] }];
                    var isConsec = Math.abs(solution[row][col] - solution[neighbor[0]][neighbor[1]]) === 1;
                    marks.push({ cells: cells, kind: isConsec ? "marked" : "none" });
                });
            }
        }
        return marks;
    }

    function solutionSupportsGeneratedMarks(solution, variants) {
        var always = function() { return 0; };
        return (variants.indexOf("kropki") === -1 || symmetricEdges(solution, "kropki", always).length > 0) &&
            (variants.indexOf("kropkipairs") === -1 || symmetricEdges(solution, "kropki", always).length > 0) &&
            (variants.indexOf("xv") === -1 || symmetricEdges(solution, "xv", always).length > 0) &&
            (variants.indexOf("xvpairs") === -1 || symmetricEdges(solution, "xv", always).length > 0) &&
            (variants.indexOf("consecutivepairs") === -1 || symmetricEdges(solution, "consecutive", always).length > 0) &&
            (variants.indexOf("battenburg") === -1 || symmetricBattenburg(solution, always).length > 0);
    }

    function addGeneratedMarks(constraints, solution, variants, random) {
        var marks = { oddEven: [], kropki: [], xv: [], battenburg: [], consecutive: [] };
        if (variants.indexOf("odd even") !== -1) marks.oddEven = symmetricOddEvenMarks(solution, random);
        if (variants.indexOf("kropki") !== -1 && variants.indexOf("kropkipairs") === -1) {
            marks.kropki = allEdgesWithNegative(solution, "kropki");
        } else if (variants.indexOf("kropkipairs") !== -1) {
            marks.kropki = symmetricEdges(solution, "kropki", random);
        }

        if (variants.indexOf("xv") !== -1 && variants.indexOf("xvpairs") === -1) {
            marks.xv = allEdgesWithNegative(solution, "xv");
        } else if (variants.indexOf("xvpairs") !== -1) {
            marks.xv = symmetricEdges(solution, "xv", random);
        }

        if (variants.indexOf("battenburg") !== -1) {
            marks.battenburg = allBattenburgWithNegative(solution);
        }

        if (variants.indexOf("consecutive") !== -1 && variants.indexOf("consecutivepairs") === -1) {
            marks.consecutive = allConsecutiveWithNegative(solution);
        } else if (variants.indexOf("consecutivepairs") !== -1) {
            marks.consecutive = symmetricEdges(solution, "consecutive", random);
        }
        Object.keys(marks).forEach(function(name) {
            var combined = (constraints[name] || []).concat(marks[name]);
            var seen = {};
            marks[name] = combined.filter(function(mark) {
                var key = JSON.stringify(mark);
                if (seen[key]) return false;
                seen[key] = true;
                return true;
            });
            if (marks[name].length) constraints[name] = marks[name];
        });
        return marks;
    }

    function markCells(mark) {
        return mark.cells || [mark.cell];
    }

    function symmetricMarkUnits(marks, size) {
        var byKey = {};
        marks.forEach(function(mark) { byKey[pairKey(markCells(mark))] = mark; });
        var visited = {};
        var units = [];
        Object.keys(byKey).forEach(function(key) {
            if (visited[key]) return;
            var mark = byKey[key];
            var rotatedKey = pairKey(rotateCells(markCells(mark), size));
            visited[key] = visited[rotatedKey] = true;
            var unit = [mark];
            if (rotatedKey !== key && byKey[rotatedKey]) unit.push(byKey[rotatedKey]);
            units.push(unit);
        });
        return units;
    }

    function generateRandomSymmetricLineMarks(size, variant, random) {
        var occupied = {};
        function cellKeyStr(r, c) { return r * size + c; }
        var targetPairs = Math.floor(random() * 2) === 0 ? 2 : 3;
        var minLen = 3;
        var maxLen = variant === "arrow" ? 3 : Math.min(6, size);

        function getNeighbors(r, c) {
            var res = [];
            for (var dr = -1; dr <= 1; dr++) {
                for (var dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    var nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < size && nc >= 0 && nc < size) res.push({ r: nr, c: nc });
                }
            }
            return res;
        }

        var allCells = [];
        for (var cr = 0; cr < size; cr++) {
            for (var cc = 0; cc < size; cc++) {
                allCells.push({ r: cr, c: cc });
            }
        }
        allCells = shuffle(allCells, random);
        var resultLines = [];

        for (var idx = 0; idx < allCells.length && resultLines.length / 2 < targetPairs; idx++) {
            var cell = allCells[idx];
            var r0 = cell.r, c0 = cell.c;
            var r0_sym = (size - 1) - r0;
            var c0_sym = (size - 1) - c0;
            var k0 = cellKeyStr(r0, c0);
            var k0_sym = cellKeyStr(r0_sym, c0_sym);
            if (occupied[k0] || occupied[k0_sym] || k0 === k0_sym) continue;

            var targetLen = Math.floor(random() * (maxLen - minLen + 1)) + minLen;

            var path1 = [{ row: r0, col: c0 }];
            var path1Keys = {};
            path1Keys[k0] = true;
            var currR = r0, currC = c0;
            var failed = false;

            for (var step = 1; step < targetLen; step++) {
                var neighbors = getNeighbors(currR, currC).filter(function(n) {
                    var nk = cellKeyStr(n.r, n.c);
                    var nk_sym = cellKeyStr((size - 1) - n.r, (size - 1) - n.c);
                    return !path1Keys[nk] && !occupied[nk] && !occupied[nk_sym];
                });
                if (!neighbors.length) { failed = true; break; }
                var pick = neighbors[Math.floor(random() * neighbors.length)];
                path1.push({ row: pick.r, col: pick.c });
                path1Keys[cellKeyStr(pick.r, pick.c)] = true;
                currR = pick.r;
                currC = pick.c;
            }

            if (failed || path1.length < minLen) continue;

            var path2 = path1.map(function(c) {
                return { row: (size - 1) - c.row, col: (size - 1) - c.col };
            });

            var overlaps = false;
            var p1Keys = {};
            for (var i = 0; i < path1.length; i++) p1Keys[cellKeyStr(path1[i].row, path1[i].col)] = true;
            for (var j = 0; j < path2.length; j++) {
                if (p1Keys[cellKeyStr(path2[j].row, path2[j].col)]) { overlaps = true; break; }
            }
            if (overlaps) continue;

            path1.forEach(function(c) { occupied[cellKeyStr(c.row, c.col)] = true; });
            path2.forEach(function(c) { occupied[cellKeyStr(c.row, c.col)] = true; });
            resultLines.push(path1);
            resultLines.push(path2);
        }

        return resultLines;
    }

    function generateLineMarksForSolution(size, solution, variant, random) {
        var occupied = {};
        function cellKeyStr(r, c) { return r * size + c; }
        var resultLines = [];
        var targetPairs = Math.floor(random() * 2) === 0 ? 2 : 3;
        var minLen = 3;
        var maxLen = variant === "arrow" ? 3 : Math.min(6, size);
        var attempts = 0;

        function getNeighbors(r, c, orthogonalOnly) {
            var res = [];
            for (var dr = -1; dr <= 1; dr++) {
                for (var dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    if (orthogonalOnly && dr !== 0 && dc !== 0) continue;
                    var nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < size && nc >= 0 && nc < size) res.push({ r: nr, c: nc });
                }
            }
            return res;
        }

        function pathsOverlap(p1, p2, occ) {
            var keys = {};
            for (var i = 0; i < p1.length; i++) {
                var k = cellKeyStr(p1[i].row, p1[i].col);
                if (occ[k]) return true;
                keys[k] = true;
            }
            for (var j = 0; j < p2.length; j++) {
                var k2 = cellKeyStr(p2[j].row, p2[j].col);
                if (occ[k2] || keys[k2]) return true;
            }
            return false;
        }

        function markOccupied(p1, p2, occ) {
            p1.forEach(function(c) { occ[cellKeyStr(c.row, c.col)] = true; });
            p2.forEach(function(c) { occ[cellKeyStr(c.row, c.col)] = true; });
        }

        function buildArrowPathFrom(r, c) {
            var headVal = solution[r][c];
            var path = [{ row: r, col: c }];
            // Try length 3 first (circle + 2 shaft cells: val1 + val2 = headVal)
            if (headVal >= 3) {
                var n1s = getNeighbors(r, c, false);
                var validPairs = [];
                n1s.forEach(function(n1) {
                    var val1 = solution[n1.r][n1.c];
                    if (val1 >= headVal) return;
                    var rem = headVal - val1;
                    var n2s = getNeighbors(n1.r, n1.c, false);
                    n2s.forEach(function(n2) {
                        if ((n2.r === r && n2.c === c) || (n2.r === n1.r && n2.c === n1.c)) return;
                        if (solution[n2.r][n2.c] === rem) {
                            validPairs.push([n1, n2]);
                        }
                    });
                });
                if (validPairs.length) {
                    var pairPick = validPairs[Math.floor(random() * validPairs.length)];
                    path.push({ row: pairPick[0].r, col: pairPick[0].c });
                    path.push({ row: pairPick[1].r, col: pairPick[1].c });
                    return path;
                }
            }
            // Try length 2 (circle + 1 shaft cell: val1 = headVal, across box boundary)
            var neighbors = getNeighbors(r, c, false);
            var valid1 = neighbors.filter(function(n) { return solution[n.r][n.c] === headVal; });
            if (valid1.length) {
                var pick = valid1[Math.floor(random() * valid1.length)];
                path.push({ row: pick.r, col: pick.c });
                return path;
            }
            return null;
        }

        function buildThermoPathFrom(r, c, len) {
            var path = [{ row: r, col: c }];
            var pathKeys = {};
            pathKeys[cellKeyStr(r, c)] = true;
            var currR = r, currC = c;
            for (var step = 1; step < len; step++) {
                var currVal = solution[currR][currC];
                var neighbors = getNeighbors(currR, currC, false).filter(function(n) {
                    var nk = cellKeyStr(n.r, n.c);
                    return !pathKeys[nk] && solution[n.r][n.c] > currVal;
                });
                if (!neighbors.length) return null;
                var pick = neighbors[Math.floor(random() * neighbors.length)];
                path.push({ row: pick.r, col: pick.c });
                pathKeys[cellKeyStr(pick.r, pick.c)] = true;
                currR = pick.r;
                currC = pick.c;
            }
            return path;
        }

        var allCells = [];
        for (var cr = 0; cr < size; cr++) {
            for (var cc = 0; cc < size; cc++) {
                allCells.push({ r: cr, c: cc });
            }
        }
        allCells = shuffle(allCells, random);

        for (var idx = 0; idx < allCells.length && resultLines.length / 2 < targetPairs; idx++) {
            var cell = allCells[idx];
            var r0 = cell.r, c0 = cell.c;
            var r0_sym = (size - 1) - r0;
            var c0_sym = (size - 1) - c0;
            var k0 = cellKeyStr(r0, c0);
            var k0_sym = cellKeyStr(r0_sym, c0_sym);
            if (occupied[k0] || occupied[k0_sym] || k0 === k0_sym) continue;

            var path1 = null, path2 = null;
            if (variant === "arrow") {
                path1 = buildArrowPathFrom(r0, c0);
                path2 = buildArrowPathFrom(r0_sym, c0_sym);
            } else {
                var targetLen = Math.floor(random() * (maxLen - minLen + 1)) + minLen;
                for (var l = targetLen; l >= minLen; l--) {
                    var p1 = buildThermoPathFrom(r0, c0, l);
                    var p2 = buildThermoPathFrom(r0_sym, c0_sym, l);
                    if (p1 && p2 && !pathsOverlap(p1, p2, occupied)) {
                        path1 = p1;
                        path2 = p2;
                        break;
                    }
                }
            }

            if (path1 && path2 && !pathsOverlap(path1, path2, occupied)) {
                markOccupied(path1, path2, occupied);
                resultLines.push(path1);
                resultLines.push(path2);
            }
        }
        return resultLines;
    }

    function generate(options) {
        options = options || {};
        var size = Number(options.size) === 6 ? 6 : 9;
        var variants = Array.isArray(options.variants) ? options.variants.slice() : [options.variant || "classic"];
        if (variants.indexOf("classic") === -1) variants.unshift("classic");
        variants = variants.filter(function(value, index) { return variants.indexOf(value) === index; });
        var supported = ["classic", "diagonal", "anti diagonal", "anti king", "anti knight",
            "non consecutive", "consecutive", "consecutivepairs", "odd even",
            "kropki", "kropkipairs", "xv", "xvpairs", "battenburg", "windoku",
            "disjoint", "touchy", "mirror", "symmetric unequal", "symmetricunequal",
            "sequence top-bottom", "sequencetopbottom", "xsums", "skyscraper",
            "numberedrooms", "rossini", "sandwich", "sumframe", "arrow", "thermo"];
        var unsupported = variants.filter(function(variant) { return supported.indexOf(variant) === -1; });
        if (!options.preserveExisting && unsupported.length) {
            throw new Error("Generation is not implemented for: " + unsupported.join(", ") + ".");
        }
        if (!options.preserveExisting && size === 6 && variants.indexOf("anti diagonal") !== -1) {
            throw new Error("Anti-diagonal generation currently requires a 9×9 grid.");
        }
        var random = seededRandom(options.seed);
        var constraints = options.preserveExisting ? {} : globalConstraints(size, variants);
        if (options.sourceConstraints) {
            Object.keys(options.sourceConstraints).forEach(function(name) {
                if (name === "supported" || !Array.isArray(options.sourceConstraints[name])) return;
                var existing = constraints[name] || [];
                constraints[name] = existing.concat(options.sourceConstraints[name]);
            });
        }
        var generatedLineMarks = [];
        var lineVariant = variants.indexOf("arrow") !== -1 ? "arrow" : (variants.indexOf("thermo") !== -1 ? "thermo" : null);
        var solution;
        if (Array.isArray(options.sourceBoard) && options.sourceBoard.length === size) {
            var completion = CSP.solve(options.sourceBoard, constraints);
            if (!completion.solved) throw new Error("The existing grid cannot be completed under its active clues.");
            solution = completion.board;
        } else if (!options.preserveExisting && lineVariant) {
            var lineSolved = false;
            for (var lineAttempt = 0; lineAttempt < 200; lineAttempt++) {
                var candidateLines = generateRandomSymmetricLineMarks(size, lineVariant, random);
                if (!candidateLines.length) continue;
                var testConstraints = JSON.parse(JSON.stringify(constraints));
                if (!testConstraints.supported) testConstraints.supported = [];
                if (lineVariant === "arrow") {
                    testConstraints.arrows = candidateLines.map(function(p) { return { circle: p[0], shaft: p.slice(1) }; });
                    if (testConstraints.supported.indexOf("arrow") === -1) testConstraints.supported.push("arrow");
                } else if (lineVariant === "thermo") {
                    testConstraints.thermos = candidateLines;
                    if (testConstraints.supported.indexOf("thermo") === -1) testConstraints.supported.push("thermo");
                }
                var solveRes = CSP.solve(emptyBoard(size), testConstraints);
                if (solveRes && solveRes.solved) {
                    solution = solveRes.board;
                    constraints = testConstraints;
                    generatedLineMarks = candidateLines;
                    lineSolved = true;
                    break;
                }
            }
            if (!lineSolved) {
                solution = makeSolution(size, variants, constraints, random);
                generatedLineMarks = generateLineMarksForSolution(size, solution, lineVariant, random);
                if (!constraints.supported) constraints.supported = [];
                if (lineVariant === "arrow") {
                    constraints.arrows = generatedLineMarks.map(function(p) { return { circle: p[0], shaft: p.slice(1) }; });
                    if (constraints.supported.indexOf("arrow") === -1) constraints.supported.push("arrow");
                } else if (lineVariant === "thermo") {
                    constraints.thermos = generatedLineMarks;
                    if (constraints.supported.indexOf("thermo") === -1) constraints.supported.push("thermo");
                }
            }
        } else {
            solution = makeSolution(size, variants, constraints, random);
        }
        if (!options.preserveExisting && lineVariant && !generatedLineMarks.length && solution) {
            generatedLineMarks = generateLineMarksForSolution(size, solution, lineVariant, random);
            if (!constraints.supported) constraints.supported = [];
            if (lineVariant === "arrow") {
                constraints.arrows = generatedLineMarks.map(function(p) { return { circle: p[0], shaft: p.slice(1) }; });
                if (constraints.supported.indexOf("arrow") === -1) constraints.supported.push("arrow");
            } else if (lineVariant === "thermo") {
                constraints.thermos = generatedLineMarks;
                if (constraints.supported.indexOf("thermo") === -1) constraints.supported.push("thermo");
            }
        }
        var generatedOutside = options.preserveExisting ? { constraints: {}, marks: [] } :
            outsideCluesForSolution(solution, variants);
        Object.keys(generatedOutside.constraints).forEach(function(name) {
            if (!generatedOutside.constraints[name].length) return;
            constraints[name] = (constraints[name] || []).concat(generatedOutside.constraints[name]);
        });
        var marks = options.preserveExisting ?
            { oddEven: [], kropki: [], xv: [], battenburg: [] } :
            addGeneratedMarks(constraints, solution, variants, random);
        if (generatedLineMarks.length) {
            marks.lines = generatedLineMarks.map(function(path) {
                return { variant: lineVariant, path: path };
            });
        }
        var board = solution.map(function(row) { return row.slice(); });
        if (generatedLineMarks.length) {
            generatedLineMarks.forEach(function(path) {
                path.forEach(function(cell) {
                    board[cell.row][cell.col] = 0;
                });
            });
        }
        if (typeof options.onProgress === "function") {
            options.onProgress({
                step: "3a",
                message: "Generated solution grid.",
                board: board.map(function(r) { return r.slice(); }),
                marks: marks,
                solution: solution,
                givens: size * size
            });
        }
        var units = [];
        var seenCells = {};
        var symmetry = options.symmetry || 'rotational180';
        for (var cellIndex = 0; cellIndex < size * size; cellIndex++) {
            if (seenCells[cellIndex]) continue;
            var cellRow = Math.floor(cellIndex / size);
            var cellCol = cellIndex % size;
            var rotatedIndex = (size * size - 1) - cellIndex;
            var mirrorHIndex = cellRow * size + (size - 1 - cellCol);
            var mirrorVIndex = (size - 1 - cellRow) * size + cellCol;
            var unit;
            if (symmetry === 'none') {
                seenCells[cellIndex] = true;
                unit = [cellIndex];
            } else if (symmetry === 'all_axis') {
                var indices = [cellIndex, rotatedIndex, mirrorHIndex, mirrorVIndex];
                var unique = indices.filter(function(i, pos) { return indices.indexOf(i) === pos; });
                unique.forEach(function(i) { seenCells[i] = true; });
                unit = unique;
            } else { // rotational180 (default)
                seenCells[cellIndex] = seenCells[rotatedIndex] = true;
                unit = cellIndex === rotatedIndex ? [cellIndex] : [cellIndex, rotatedIndex];
            }
            units.push(unit);
        }
        units = shuffle(units, random);
        var givens = size * size;
        var markUnits = [];
        var fullClueList = ["kropki", "xv", "consecutive", "battenburg"];
        if (!options.preserveExisting) {
            Object.keys(marks).forEach(function(name) {
                if (name === "lines") return;
                if (fullClueList.indexOf(name) !== -1 && variants.indexOf(name + "pairs") === -1) {
                    return;
                }
                symmetricMarkUnits(marks[name], size).forEach(function(unit) {
                    markUnits.push({ name: name, marks: unit });
                });
            });
        }
        markUnits = shuffle(markUnits, random);
        var totalAttempts = units.length + markUnits.length;
        var startTime = Date.now();
        var maxTimeMs = 20000;
        var attempt = 0;
        var outsideScratchVariants = ["xsums", "skyscraper", "numberedrooms", "rossini", "sandwich", "sumframe", "arrow", "thermo"];
        var hasOutsideScratchVariant = variants.some(function(variant) {
            return outsideScratchVariants.indexOf(variant) !== -1;
        });
        // Outside-clue constraints become disproportionately expensive to enumerate on
        // nearly empty boards. They still get a fully pruned Sudoku, but retain enough
        // givens for generation and the final uniqueness check to stay interactive.
        var minimumOutsideGivens = 28;
        var batchSize = hasOutsideScratchVariant ? 1 : 4;
        while (attempt < units.length) {
            if (hasOutsideScratchVariant && givens <= minimumOutsideGivens) break;
            if (Date.now() - startTime >= maxTimeMs) {
                if (typeof options.onProgress === "function") {
                    options.onProgress({
                        step: "timeout",
                        message: "20s time limit reached (" + givens + " givens remaining). Returning unique puzzle.",
                        attempt: attempt,
                        total: totalAttempts,
                        givens: givens
                    });
                }
                break;
            }
            var end = Math.min(attempt + batchSize, units.length);
            var batchUnits = units.slice(attempt, end);
            if (options.preserveExisting && Array.isArray(options.sourceBoard)) {
                batchUnits = batchUnits.filter(function(unit) {
                    return !unit.some(function(index) {
                        var r = Math.floor(index / size);
                        var c = index % size;
                        return options.sourceBoard[r] && options.sourceBoard[r][c] !== 0;
                    });
                });
            }
            if (!batchUnits.length) {
                attempt = end;
                continue;
            }

            var batchPrevious = [];
            batchUnits.forEach(function(unit) {
                unit.forEach(function(index) {
                    var r = Math.floor(index / size);
                    var c = index % size;
                    batchPrevious.push({ index: index, val: board[r][c] });
                    board[r][c] = 0;
                });
            });

            var answers = CSP.createProblem(board, constraints).enumerateAnswers(2);
            if (answers.length === 1) {
                var removedCount = batchPrevious.length;
                givens -= removedCount;
                if (typeof options.onProgress === "function") {
                    options.onProgress({
                        step: "3c",
                        message: "Step 3c: Pruning givens... Batch-removed " + removedCount + " digits (" + givens + " givens remaining).",
                        attempt: end,
                        total: totalAttempts,
                        givens: givens,
                        board: board.map(function(r) { return r.slice(); }),
                        marks: marks,
                        solution: solution
                    });
                }
            } else {
                batchPrevious.forEach(function(item) {
                    board[Math.floor(item.index / size)][item.index % size] = item.val;
                });
                for (var b = 0; b < batchUnits.length; b++) {
                    var unit = batchUnits[b];
                    var singlePrevious = unit.map(function(index) {
                        var r = Math.floor(index / size);
                        var c = index % size;
                        var val = board[r][c];
                        board[r][c] = 0;
                        return val;
                    });
                    var singleAnswers = CSP.createProblem(board, constraints).enumerateAnswers(2);
                    if (singleAnswers.length === 1) {
                        givens -= unit.length;
                    } else {
                        unit.forEach(function(index, offset) {
                            board[Math.floor(index / size)][index % size] = singlePrevious[offset];
                        });
                    }
                    if (typeof options.onProgress === "function") {
                        options.onProgress({
                            step: "3c",
                            message: "Step 3c: Pruning givens (" + givens + " givens remaining).",
                            attempt: attempt + b + 1,
                            total: totalAttempts,
                            givens: givens,
                            board: board.map(function(r) { return r.slice(); }),
                            marks: marks,
                            solution: solution
                        });
                    }
                }
            }
            attempt = end;
        }

        markUnits.forEach(function(unit, markAttempt) {
            if (Date.now() - startTime >= maxTimeMs) return;
            var before = (constraints[unit.name] || []).slice();
            constraints[unit.name] = before.filter(function(mark) { return unit.marks.indexOf(mark) === -1; });
            var answers = CSP.createProblem(board, constraints).enumerateAnswers(2);
            if (answers.length !== 1) constraints[unit.name] = before;
            if (typeof options.onProgress === "function") {
                options.onProgress({
                    step: "3c",
                    message: "Step 3c: Pruning extra marks (" + givens + " givens remaining).",
                    attempt: units.length + markAttempt + 1,
                    total: totalAttempts,
                    givens: givens
                });
            }
        });
        if (!options.preserveExisting) {
            Object.keys(marks).forEach(function(name) {
                if (name === "lines") return;
                marks[name] = constraints[name] || [];
            });
        }

        // Non-minimal modes add back the requested number of stripped clues in symmetric units.
        if (options.minimal === false && !options.preserveExisting) {
            var markCells = {};
            if (generatedLineMarks && generatedLineMarks.length) {
                generatedLineMarks.forEach(function(path) {
                    path.forEach(function(cell) {
                        markCells[cell.row * size + cell.col] = true;
                    });
                });
            }
            var removedUnits = [];
            var seenRemoved = {};
            var symmetry = options.symmetry || 'rotational180';
            for (var ri = 0; ri < size * size; ri++) {
                if (seenRemoved[ri]) continue;
                var rRow = Math.floor(ri / size);
                var rCol = ri % size;
                if (board[rRow][rCol] === 0) {
                    var rotIdx = (size * size - 1) - ri;
                    var mirH = rRow * size + (size - 1 - rCol);
                    var mirV = (size - 1 - rRow) * size + rCol;
                    var symUnit;
                    if (symmetry === 'none') {
                        seenRemoved[ri] = true;
                        symUnit = [ri];
                    } else if (symmetry === 'all_axis') {
                        var idxs = [ri, rotIdx, mirH, mirV];
                        var uniq = idxs.filter(function(i, pos) { return idxs.indexOf(i) === pos; });
                        uniq.forEach(function(i) { seenRemoved[i] = true; });
                        symUnit = uniq;
                    } else { // rotational180
                        seenRemoved[ri] = seenRemoved[rotIdx] = true;
                        symUnit = ri === rotIdx ? [ri] : [ri, rotIdx];
                    }
                    var allEmpty = symUnit.every(function(idx) {
                        return board[Math.floor(idx / size)][idx % size] === 0;
                    });
                    if (allEmpty && !symUnit.some(function(idx) { return markCells[idx]; })) {
                        removedUnits.push(symUnit);
                    }
                }
            }
            var targetExtra = Number.isInteger(options.extraClues) ? Math.max(0, options.extraClues) : 8;
            var maxGivens = Number.isInteger(options.maxGivens) ? Math.max(0, options.maxGivens) : (size * size);
            var shuffledUnits = shuffle(removedUnits, random);
            var addedCount = 0;
            for (var ui = 0; ui < shuffledUnits.length && addedCount < targetExtra && givens < maxGivens; ui++) {
                var unitToRestore = shuffledUnits[ui];
                if (givens + unitToRestore.length > maxGivens && givens > 0) continue;
                unitToRestore.forEach(function(idx) {
                    var r = Math.floor(idx / size);
                    var c = idx % size;
                    if (board[r][c] === 0) {
                        board[r][c] = solution[r][c];
                        givens++;
                        addedCount++;
                    }
                });
            }
        }

        var finalAnswers = CSP.createProblem(board, constraints).enumerateAnswers(2);
        if (finalAnswers.length !== 1) throw new Error("Generator uniqueness verification failed.");
        return {
            size: size,
            variant: variants.length === 1 ? variants[0] : "multi variant",
            variants: variants,
            board: board,
            solution: solution,
            constraints: constraints,
            oddEvenMarks: marks.oddEven,
            kropkiMarks: marks.kropki,
            xvMarks: marks.xv,
            consecutiveMarks: marks.consecutive,
            battenburgMarks: marks.battenburg,
            outsideMarks: generatedOutside.marks,
            marks: marks,
            preserveExisting: options.preserveExisting === true,
            givens: givens,
            unique: true
        };
    }

    return { generate: generate, seededRandom: seededRandom, outsideCluesForSolution: outsideCluesForSolution };
})();

if (typeof module !== "undefined" && module.exports) module.exports = SudokuGenerator;
