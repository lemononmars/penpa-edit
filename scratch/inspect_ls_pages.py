with open(r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\logic_showcase.tex", "r", encoding="utf-8") as f:
    text = f.read()

pages = text.split(r"\newpage")
print(f"Total pages in logic_showcase: {len(pages)}")
for i, p in enumerate(pages):
    lines = [l for l in p.splitlines() if l.strip()]
    first_line = lines[0] if lines else "EMPTY"
    print(f"Page {i+1} lines: {len(lines)}, first: {first_line[:70]}")
