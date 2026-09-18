import os

tex_path = r'C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\logic_showcase.tex'
with open(tex_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Page 17 (Choco Banana Tower) so it fits on a single page
p17_marker = '% PAGE 17: LS 71 (Choco Banana Tower)'
p18_marker = '% PAGE 18: LS 72 to LS 75 (Grand Finale)'

p17_idx = text.find(p17_marker)
p18_idx = text.find(p18_marker)

if p17_idx != -1 and p18_idx != -1:
    new_p17 = r"""% PAGE 17: LS 71 (Choco Banana Tower)
% Architectural Showcase Page
% =========================================================================

\lshead{6.43}{Choco Banana Tower}{LS 71}
\vspace{1mm}

\begin{minipage}[t]{0.45\textwidth}
\begin{tcolorbox}[
  colback=cbdarkteal!7!white,
  colframe=cbdarkteal,
  boxrule=0.5pt,
  arc=1.2mm,
  left=2.5mm, right=2.5mm, top=1.5mm, bottom=1.5mm
]
  \textbf{\footnotesize LS 71 Showcase:}\\[0.5mm]
  {\scriptsize Scale 50 vertical stories of pure deduction balancing rectangular chocolate blocks and banana corridors.}
\end{tcolorbox}

\vspace{1.5mm}

\footnotesize
\textbf{Tower Construction Rules:}
\begin{itemize}
  \setlength{\itemsep}{1.5pt}
  \item Shade some cells so that all areas of orthogonally connected shaded cells are \textbf{rectangular} (chocolate blocks).
  \item All areas of orthogonally connected unshaded cells are \textbf{non-rectangular} (banana corridors).
  \item A number clue represents the exact size of its orthogonally connected group of shaded or unshaded cells.
\end{itemize}

\vspace{2mm}

\begin{tcolorbox}[
  colback=cbdarkteal!8!white,
  colframe=cbdarkteal,
  boxrule=0.5pt,
  arc=1.5mm,
  left=2.5mm, right=2.5mm, top=2mm, bottom=2mm
]
  \textbf{\footnotesize Architectural Specs:}\\[1mm]
  {\scriptsize
  $\bullet$ \textbf{Dimensions:} $10$ columns $\times 50$ vertical stories.\\
  $\bullet$ \textbf{Total Cells:} 500 challenge cells.\\
  $\bullet$ \textbf{Deduction Strategy:} Look for vertical bottlenecks where tall blocks constrain adjacent corridors.\\
  $\bullet$ \textbf{Online Solving:} \texttt{tinyurl.com/2dbfbkl4}}
\end{tcolorbox}
\end{minipage}
\hfill
\begin{minipage}[t]{0.51\textwidth}
\centering
\includegraphics[height=19.0cm, keepaspectratio]{ls71_choco_banana_tower_puzzle.pdf}
\end{minipage}

\newpage

"""
    new_p18 = r"""% PAGE 18: LS 72 to LS 75 (Grand Finale)
% =========================================================================

\begin{minipage}[t]{0.48\textwidth}
\showcaseheadermini{LS 72: Pencils (Look-Air)}{Sightlines between equal pencils.}
\lsheads{6.44}{Pencils (Look-Air)}{LS 72}
\vspace{0.5mm}
\scriptsize
\textbf{Rules:} Normal Pencils rules apply. Two pencils of the same size cannot see each other along lines of non-pencil cells.
\vspace{0.5mm}
\centering
\includegraphics[width=3.9cm]{ls72_pencils_look_air_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}
\showcaseheadermini{LS 73: Pentominous Myopia}{Arrows indicate closest pentomino.}
\lsheads{6.45}{Pentominous (Myopia)}{LS 73}
\vspace{0.5mm}
\scriptsize
\textbf{Rules:} Pentomino regions (5 cells). Arrows point in all directions tying for closest pentomino of that shape.
\vspace{0.5mm}
\centering
\includegraphics[width=3.9cm]{ls73_pentominous_myopia_puzzle.pdf}
\end{minipage}

\vspace{1mm}
\hrule
\vspace{1mm}

\begin{minipage}[t]{0.48\textwidth}
\showcaseheadermini{LS 74: Choco Banana Thermo}{Region sizes increase along thermometers.}
\lsheads{6.46}{Choco Banana (Thermo)}{LS 74}
\vspace{0.5mm}
\scriptsize
\textbf{Rules:} Choco Banana rules apply. Region sizes along thermometers must strictly increase from bulb to tip.
\vspace{0.5mm}
\centering
\includegraphics[width=3.9cm]{ls74_choco_banana_thermo_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}
\showcaseheadermini{LS 75: Pentominous Irrwisch}{Grand Finale cipher: each 'A' is distinct.}
\lsheads{6.47}{Pentominous Irrwisch}{LS 75}
\vspace{0.5mm}
\scriptsize
\textbf{Rules:} Standard Pentominous. Irrwisch variant: each instance of letter ``A'' represents a different pentomino shape!
\vspace{0.5mm}
\centering
\includegraphics[width=3.9cm]{ls75_pentominous_irrwisch_puzzle.pdf}
\end{minipage}
"""
    text = text[:p17_idx] + new_p17 + new_p18
    with open(tex_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Successfully updated Page 17 and Page 18!")
else:
    print("Markers not found!")
