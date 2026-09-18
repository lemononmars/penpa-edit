import json

with open("scratch/puzzle_dimensions.json", "r", encoding="utf-8") as f:
    raw_dims = json.load(f)
dims = {d["baseName"]: d for d in raw_dims}

# Let's inspect pages in logic_showcase.tex
with open(r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\logic_showcase.tex", "r", encoding="utf-8") as f:
    tex = f.read()

pages = tex.split("\\newpage")
print(f"Total pages: {len(pages)}")

for idx, page in enumerate(pages):
    print(f"\n--- Page {idx+1} ---")
    import re
    p_headers = re.findall(r'\\lsheads?\{([^}]+)\}\{([^}]+)\}', page)
    imgs = re.findall(r'\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}', page)
    p_imgs = [img for img in imgs if not img.endswith('_solution.pdf') and img.startswith('ls')]
    for num, title in p_headers:
        print(f"  Puzzle {num}: {title}")
    for img in p_imgs:
        base = img.replace(".pdf", "")
        d = dims.get(base, {})
        cols = d.get("cols", "?")
        rows = d.get("rows", "?")
        print(f"    Image: {img} -> Cols: {cols}, Rows: {rows}")
