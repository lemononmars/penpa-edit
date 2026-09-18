with open(r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\logic_showcase.tex", "r", encoding="utf-8") as f:
    text = f.read()

# Fix corrupted strings
text = text.replace("$2$2\\times 2$", "$2\\times 2$")
text = text.replace("$2\\times 2$$", "$2\\times 2$")
text = text.replace("$$2\\times 2$", "$2\\times 2$")

with open(r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\logic_showcase.tex", "w", encoding="utf-8") as f:
    f.write(text)

print("Cleaned 2x2 occurrences!")
