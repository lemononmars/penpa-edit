(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPOutsideRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installOutsideRelation(family) {
        function validate(board, clue, helpers) {
            var values = clue.cells.map(function(cell) {
                return helpers.cellValue(board, cell);
            });

            var assignedOutside = values.filter(Boolean);
            var required = Array.from(new Set(clue.clues || []));
            var missing = required.filter(function(value) {
                return assignedOutside.indexOf(value) === -1;
            }).length;
            // Each missing clue needs its own remaining cell. In a fully clued
            // group this rejects non-clue digits as soon as they are assigned.
            return missing <= values.length - assignedOutside.length;
        }

        ["outside","outside234"].forEach(function(relation) {
            family.register(relation, {
                validatePartial: validate,
                prepare: function(clue, helpers) {
                    var required = Array.from(new Set(clue.clues || []));
                    if (!required.every(function(value) {
                        return Number.isInteger(value) && value >= 1 && value <= helpers.size;
                    })) return null;
                    var requiredMask = required.reduce(function(mask, value) { return mask | (1 << value); }, 0);
                    var cells = clue.cells;
                    return {
                        validatePartial: function(board) {
                            var assigned = 0;
                            var remaining = 0;
                            for (var index = 0; index < cells.length; index++) {
                                var value = helpers.cellValue(board, cells[index]);
                                if (value) assigned |= 1 << value;
                                else remaining++;
                            }
                            return helpers.countBits(requiredMask & ~assigned) <= remaining;
                        }
                    };
                }
            });
        });
    };
});
