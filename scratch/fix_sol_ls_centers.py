with open(r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\sol_ls.tex", "r", encoding="utf-8") as f:
    text = f.read()

# Remove dangling \begin{center} before \begin{tblr}
text = text.replace("\\begin{center}\n\\begin{tblr}", "\\begin{tblr}")

with open(r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\sol_ls.tex", "w", encoding="utf-8") as f:
    f.write(text)

print("Removed dangling begin{center}!")
