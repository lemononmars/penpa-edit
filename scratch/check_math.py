import re

with open(r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\logic_showcase.tex", "r", encoding="utf-8") as f:
    text = f.read()

matches = re.findall(r"\$([^$]+)\$", text)
print(f"Total math spans: {len(matches)}")
for m in sorted(set(matches)):
    print("  ", repr(m))
