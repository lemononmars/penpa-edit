import re

with open('docs/js/sudoku_solver.js', 'r') as f:
    text = f.read()

text = text.replace('constraints.escapeStarts = shadedCells;', 'constraints.escapeStarts.push(shadedCells);')

with open('docs/js/sudoku_solver.js', 'w') as f:
    f.write(text)
