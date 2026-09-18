import os

tex_path = r'C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\logic_showcase.tex'
with open(tex_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Page 9
old_p9 = r"""\begin{center}
{\Large \textbf{LS 58: Pentominous Grid Exploration}}
\end{center}"""
new_p9 = r"""\showcaseheader{LS 58: Pentomino Letter Grid Triad}{A thematic triptych of 5-cell region divisions under strict non-touching geometric constraints.}"""

if old_p9 in text:
    text = text.replace(old_p9, new_p9, 1)
    print("Replaced Page 9 (LS 58)!")
else:
    print("Page 9 not found")

# 2. Page 10
old_p10 = r"""% PAGE 10: LS 59 (One Square Series)
% =========================================================================

\lshead{6.19}"""
new_p10 = r"""% PAGE 10: LS 59 (One Square Series)
% =========================================================================

\showcaseheader{LS 59: The One Square Series}{Each grid conceals exactly one unshaded square among rectangular fields and balance loops.}

\lshead{6.19}"""

if old_p10 in text:
    text = text.replace(old_p10, new_p10, 1)
    print("Replaced Page 10 (LS 59)!")
else:
    print("Page 10 not found")

# 3. Page 18
p18_idx = text.find('% PAGE 18: LS 72 to LS 75 (Grand Finale)')
if p18_idx != -1:
    new_p18 = r"""% PAGE 18: LS 72 to LS 75 (Grand Finale)
% =========================================================================

\begin{minipage}[t]{0.48\textwidth}
\showcaseheadermini{LS 72: Pencils (Look-Air)}{Sightline non-visibility between equal pencils.}
\lsheads{6.44}{Pencils (Look-Air)}{LS 72}
\vspace{0.5mm}
\scriptsize
\textbf{Rules:} Normal Pencils rules apply. Two pencils of the same size cannot see each other along lines of non-pencil cells.
\vspace{0.5mm}
\centering
\includegraphics[width=4.6cm]{ls72_pencils_look_air_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}
\showcaseheadermini{LS 73: Pentominous Myopia}{Arrows indicate closest pentomino shape.}
\lsheads{6.45}{Pentominous (Myopia)}{LS 73}
\vspace{0.5mm}
\scriptsize
\textbf{Rules:} Pentomino regions (5 cells). Arrows point in all directions tying for closest pentomino of that shape.
\vspace{0.5mm}
\centering
\includegraphics[width=4.6cm]{ls73_pentominous_myopia_puzzle.pdf}
\end{minipage}

\vspace{2mm}
\hrule
\vspace{1.5mm}

\begin{minipage}[t]{0.48\textwidth}
\showcaseheadermini{LS 74: Choco Banana Thermo}{Region sizes strictly increase along thermometers.}
\lsheads{6.46}{Choco Banana (Thermo)}{LS 74}
\vspace{0.5mm}
\scriptsize
\textbf{Rules:} Choco Banana rules apply. Region sizes along thermometers must strictly increase from bulb to tip.
\vspace{0.5mm}
\centering
\includegraphics[width=4.6cm]{ls74_choco_banana_thermo_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}
\showcaseheadermini{LS 75: Pentominous Irrwisch}{Grand Finale cipher: each clue 'A' is a distinct shape.}
\lsheads{6.47}{Pentominous Irrwisch}{LS 75}
\vspace{0.5mm}
\scriptsize
\textbf{Rules:} Standard Pentominous. Irrwisch variant: each instance of letter ``A'' represents a different pentomino shape!
\vspace{0.5mm}
\centering
\includegraphics[width=4.6cm]{ls75_pentominous_irrwisch_puzzle.pdf}
\end{minipage}
"""
    text = text[:p18_idx] + new_p18
    print("Replaced Page 18 (Grand Finale)!")

with open(tex_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Finished updating logic_showcase.tex successfully!")
