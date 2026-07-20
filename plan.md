1. Add generic setting in `docs/src/variationCatalog.ts`.
2. Add `sudokuwithstars` to `registerConstraint` in `sudoku_csp.js`.
3. Add `starCellValues` constraint to `sudoku_csp.js`.
4. Add CSP injection in `compileConstraints` in `sudoku_csp.js`.
5. Update `applySolution` in `sudoku_solver.js` to output "★" for 8 and 9.
6. Make "sudokuwithstars" "available" in `variant_metadata.json`.
7. Add tests in `test/sudoku_solver.test.js`.
8. Complete pre-commit instructions.
9. Submit.
