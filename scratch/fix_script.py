import os

clean_script = r"scratch/generate_clean_showcase.py"
with open(clean_script, "r", encoding="utf-8") as f:
    text = f.read()

# Replace valign=t on Alphabet Asp and Tower
text = text.replace(
    r"\includegraphics[valign=t, height=\dimexpr 4\cellsize\relax, keepaspectratio]{ls70_alphabet_asp_example.pdf}",
    r"\includegraphics[height=\dimexpr 4\cellsize\relax, keepaspectratio]{ls70_alphabet_asp_example.pdf}"
)
text = text.replace(
    r"\includegraphics[valign=t, height=\dimexpr 9\cellsize\relax, keepaspectratio]{ls70_alphabet_asp_puzzle.pdf}",
    r"\includegraphics[height=\dimexpr 9\cellsize\relax, keepaspectratio]{ls70_alphabet_asp_puzzle.pdf}"
)
text = text.replace(
    r"\includegraphics[valign=t, height=16.6cm, keepaspectratio]{ls71_choco_banana_tower_puzzle.pdf}",
    r"\includegraphics[height=16.6cm, keepaspectratio]{ls71_choco_banana_tower_puzzle.pdf}"
)

with open(clean_script, "w", encoding="utf-8") as f:
    f.write(text)

print("Updated clean script.")
