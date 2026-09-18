import os

tex_path = r'C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\logic_showcase.tex'
with open(tex_path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Compact Page 17 (Choco Banana Tower)
old_p17 = r"""\showcaseheader{LS 71: Choco Banana 50-Story Tower}{The 50-Story Monolith: Scale 50 vertical stories of pure deduction! Balance rectangular chocolate blocks against irregular banana corridors from the ground floor to the summit.}

\lshead{6.43}{Choco Banana Tower}{LS 71}
\vspace{1.5mm}

\begin{minipage}[t]{0.44\textwidth}
\footnotesize
\textbf{Tower Construction Rules:}
\begin{itemize}
  \setlength{\itemsep}{2pt}
  \item Shade some cells so that all areas of orthogonally connected shaded cells are \textbf{rectangular} (chocolate blocks).
  \item All areas of orthogonally connected unshaded cells are \textbf{non-rectangular} (banana corridors).
  \item A number clue represents the exact size of its orthogonally connected group of shaded or unshaded cells.
\end{itemize}

\vspace{3mm}

\begin{tcolorbox}[
  colback=cbdarkteal!8!white,
  colframe=cbdarkteal,
  boxrule=0.6pt,
  arc=1.5mm,
  left=3mm, right=3mm, top=2.5mm, bottom=2.5mm
]
  \textbf{\footnotesize Architectural Specifications:}\\[1.5mm]
  {\scriptsize
  $\bullet$ \textbf{Dimensions:} $10$ columns $\times 50$ vertical stories.\\
  $\bullet$ \textbf{Total Cells:} 500 challenge cells.\\
  $\bullet$ \textbf{Deduction Strategy:} Look for vertical bottlenecks where tall blocks constrain adjacent corridors.\\
  $\bullet$ \textbf{Online Solving:} \texttt{tinyurl.com/2dbfbkl4}}
\end{tcolorbox}
\end{minipage}
\hfill
\begin{minipage}[t]{0.52\textwidth}
\centering
\includegraphics[height=21.0cm, keepaspectratio]{ls71_choco_banana_tower_puzzle.pdf}
\end{minipage}"""

new_p17 = r"""\showcaseheader{LS 71: Choco Banana 50-Story Tower}{Scale 50 continuous vertical stories of pure deduction balancing chocolate blocks and banana corridors.}

\lshead{6.43}{Choco Banana Tower}{LS 71}
\vspace{1mm}

\begin{minipage}[t]{0.46\textwidth}
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
  \textbf{\footnotesize Architectural Specifications:}\\[1mm]
  {\scriptsize
  $\bullet$ \textbf{Dimensions:} $10$ columns $\times 50$ vertical stories.\\
  $\bullet$ \textbf{Total Cells:} 500 challenge cells.\\
  $\bullet$ \textbf{Deduction Strategy:} Look for vertical bottlenecks where tall blocks constrain adjacent corridors.\\
  $\bullet$ \textbf{Online Solving:} \texttt{tinyurl.com/2dbfbkl4}}
\end{tcolorbox}
\end{minipage}
\hfill
\begin{minipage}[t]{0.50\textwidth}
\centering
\includegraphics[height=19.2cm, keepaspectratio]{ls71_choco_banana_tower_puzzle.pdf}
\end{minipage}"""

if old_p17 in text:
    text = text.replace(old_p17, new_p17, 1)
    print("Updated Page 17 height to 19.2cm!")
else:
    print("Page 17 not found")

# 2. Adjust Page 18 widths to 4.2cm
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
\includegraphics[width=4.2cm]{ls72_pencils_look_air_puzzle.pdf}
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
\includegraphics[width=4.2cm]{ls73_pentominous_myopia_puzzle.pdf}
\end{minipage}

\vspace{1.5mm}
\hrule
\vspace{1mm}

\begin{minipage}[t]{0.48\textwidth}
\showcaseheadermini{LS 74: Choco Banana Thermo}{Region sizes strictly increase along thermometers.}
\lsheads{6.46}{Choco Banana (Thermo)}{LS 74}
\vspace{0.5mm}
\scriptsize
\textbf{Rules:} Choco Banana rules apply. Region sizes along thermometers must strictly increase from bulb to tip.
\vspace{0.5mm}
\centering
\includegraphics[width=4.2cm]{ls74_choco_banana_thermo_puzzle.pdf}
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
\includegraphics[width=4.2cm]{ls75_pentominous_irrwisch_puzzle.pdf}
\end{minipage}
"""
    text = text[:p18_idx] + new_p18
    print("Updated Page 18 puzzle widths to 4.2cm!")

with open(tex_path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Saved logic_showcase.tex successfully!")
