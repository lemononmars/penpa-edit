const { execSync } = require('child_process');

try {
    execSync('git commit --amend -m "Add consecutive chains variant\n\nImplements Consecutive Chains logic parsing in sudoku_solver.js, constraints in sudoku_csp.js, test coverage, and documentation. Refactored constraints UI definition slightly to cleanly integrate."', {stdio: 'inherit'});
    console.log("Amended successfully.");
} catch(e) {
    console.error(e);
}
