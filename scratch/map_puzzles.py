import json

with open("scratch/puzzle_dimensions.json", "r", encoding="utf-8") as f:
    dims = json.load(f)

# Map baseName to (cols, rows, width_px, height_px)
grid_map = {}
for d in dims:
    grid_map[d["baseName"]] = d

# Let's inspect each puzzle in logic_showcase.tex
with open(r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\logic_showcase.tex", "r", encoding="utf-8") as f:
    tex = f.read()

import re
puzzles = re.findall(r'\\lsheads?\{([^}]+)\}\{([^}]+)\}\{([^}]+)\}', tex)
print(f"Found {len(puzzles)} puzzle headers in tex:")
for num, title, ls in puzzles:
    # find image included after this header
    idx = tex.find(f"{{{num}}}")
    next_idx = tex.find("\\lshead", idx + 10)
    if next_idx == -1: next_idx = len(tex)
    chunk = tex[idx:next_idx]
    img_m = re.findall(r'\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}', chunk)
    img_names = [x for x in img_m if not x.endswith('_solution.pdf')]
    print(f"Num {num:<5} | LS {ls:<6} | {title:<35} | Imgs: {img_names}")
