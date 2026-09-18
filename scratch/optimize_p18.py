import os

tex_path = r'C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\logic_showcase.tex'
with open(tex_path, 'r', encoding='utf-8') as f:
    text = f.read()

p18_marker = '% PAGE 18: LS 72 to LS 75 (Grand Finale)'
p18_idx = text.find(p18_marker)

if p18_idx != -1:
    optimized_p18 = r"""% PAGE 18: LS 72 to LS 75 (Grand Finale)
% =========================================================================

\showcaseheadermini{LS 72 \& LS 73: Sightline Deduction}{Pencils (Look-Air) and Pentominous Myopia closest-shape clues.}
\vspace{0.5mm}

\begin{minipage}[t]{0.48\textwidth}
\lsheads{6.44}{Pencils (Look-Air)}{LS 72}
\vspace{0.5mm}
\scriptsize
\textbf{Rules:} Normal Pencils rules apply. Two pencils of the same size cannot see each other along lines of non-pencil body cells.
\vspace{0.5mm}
\centering
\includegraphics[width=4.0cm]{ls72_pencils_look_air_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}
\lsheads{6.45}{Pentominous (Myopia)}{LS 73}
\vspace{0.5mm}
\scriptsize
\textbf{Rules:} Pentomino regions (5 cells). Arrows point in all directions tying for closest pentomino of that shape.
\vspace{0.5mm}
\centering
\includegraphics[width=4.0cm]{ls73_pentominous_myopia_puzzle.pdf}
\end{minipage}

\vspace{1.5mm}
\hrule
\vspace{1mm}

\showcaseheadermini{LS 74 \& LS 75: Grand Finale Exhibition}{Choco Banana Thermo gradients and the Pentominous Irrwisch cipher.}
\vspace{0.5mm}

\begin{minipage}[t]{0.48\textwidth}
\lsheads{6.46}{Choco Banana (Thermo)}{LS 74}
\vspace{0.5mm}
\scriptsize
\textbf{Rules:} Choco Banana rules apply. Region sizes along thermometers must strictly increase from bulb to tip.
\vspace{0.5mm}
\centering
\includegraphics[width=4.0cm]{ls74_choco_banana_thermo_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}
\lsheads{6.47}{Pentominous Irrwisch}{LS 75}
\vspace{0.5mm}
\scriptsize
\textbf{Rules:} Standard Pentominous. Irrwisch variant: each instance of letter ``A'' represents a different pentomino shape!
\vspace{0.5mm}
\centering
\includegraphics[width=4.0cm]{ls75_pentominous_irrwisch_puzzle.pdf}
\end{minipage}
"""
    text = text[:p18_idx] + optimized_p18
    with open(tex_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Successfully optimized Page 18 of logic_showcase.tex!")
else:
    print("Marker not found!")
