import os

tex_path = r'C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\logic_showcase.tex'
with open(tex_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Macro Target
macro_target = r"""\providecommand\lsheads[3]{%
\phantomsection
\addcontentsline{toc}{subsection}{#1. #2}%
\noindent
\begin{tblr}{
colspec={|X[1.1,c,m,blue7]|X[3.8,c,m]|}, 
hline{1} = {1}{-}{solid}, 
hline{2} = {2}{-}{solid},
rows = {valign = m, abovesep=1pt, belowsep=1pt},
width = \linewidth
}
\SetCell{fg=white, font=\footnotesize\bfseries} #1 & \SetCell{font=\footnotesize\bfseries} #2
\end{tblr}%
}"""

macro_replacement = r"""\providecommand\lsheads[3]{%
\phantomsection
\addcontentsline{toc}{subsection}{#1. #2}%
\noindent
\begin{tblr}{
colspec={|X[1.1,c,m,blue7]|X[3.8,c,m]|}, 
hline{1} = {1}{-}{solid}, 
hline{2} = {2}{-}{solid},
rows = {valign = m, abovesep=1pt, belowsep=1pt},
width = \linewidth
}
\SetCell{fg=white, font=\footnotesize\bfseries} #1 & \SetCell{font=\footnotesize\bfseries} #2
\end{tblr}%
}

% Showcase header tcolorbox definitions
\newcommand{\showcaseheader}[2]{%
  \noindent
  \begin{tcolorbox}[
    colback=cbdarkteal!7!white,
    colframe=cbdarkteal,
    boxrule=0.6pt,
    arc=1.5mm,
    left=2.5mm, right=2.5mm, top=1.6mm, bottom=1.6mm,
    boxsep=1pt
  ]
    {\color{cbdarkteal}\textbf{\fontsize{9}{11}\selectfont #1}}\\[0.6mm]
    {\fontsize{7.5}{9.5}\selectfont #2}
  \end{tcolorbox}%
  \vspace{1mm}%
}

\newcommand{\showcaseheadermini}[2]{%
  \noindent
  \begin{tcolorbox}[
    colback=cbdarkteal!7!white,
    colframe=cbdarkteal,
    boxrule=0.5pt,
    arc=1.2mm,
    left=2mm, right=2mm, top=1.2mm, bottom=1.2mm,
    boxsep=0.5pt
  ]
    {\color{cbdarkteal}\textbf{\fontsize{8.5}{10.5}\selectfont #1}}\enspace---\enspace{\fontsize{7.5}{9.5}\selectfont #2}
  \end{tcolorbox}%
  \vspace{1mm}%
}"""

if macro_target in content:
    content = content.replace(macro_target, macro_replacement, 1)

replacements = [
    (
        '% PAGE 2: LS 49\n% =========================================================================\n\n\\lshead{6.1}',
        '% PAGE 2: LS 49\n% =========================================================================\n\n\\showcaseheader{LS 49: Twilight Inversions}{Inverted perspective deductions where shaded and unshaded cells swap classical roles in Canal View and diagonal-sightline Kurodoko.}\n\n\\lshead{6.1}'
    ),
    (
        '% PAGE 3: LS 50\n% =========================================================================\n\n\\lshead{6.3}',
        '% PAGE 3: LS 50\n% =========================================================================\n\n\\showcaseheader{LS 50: L-Polyomino Geometry}{Divide the grid into triomino and tetromino L-shapes governed by border dot constraints on relative size and orientation.}\n\n\\lshead{6.3}'
    ),
    (
        '% PAGE 4: LS 51 (Skyscrapers & Slitherlink Polygraph)\n% =========================================================================\n\n\\lshead{6.5}',
        '% PAGE 4: LS 51 (Skyscrapers & Slitherlink Polygraph)\n% =========================================================================\n\n\\showcaseheader{LS 51: Triple Deduction Trials}{Experimental hybrids: candidate-arrow Skyscrapers, loop-boundary Slitherlink Polygraph, and coordinate-linked Treasure Hunt.}\n\n\\lshead{6.5}'
    ),
    (
        '\\lshead{6.8}{Foreshadow Crossing}{LS 52}',
        '\\showcaseheadermini{LS 52: Directed Loops \\& Thermal Shading}{Self-intersecting directed paths with distance clues and region-matching thermal traversal.}\n\\lshead{6.8}{Foreshadow Crossing}{LS 52}'
    ),
    (
        '\\lshead{6.10}{Pentominous (Outside Clues)}{LS 53}',
        '\\showcaseheadermini{LS 53: Pentominous Outside Clues}{Classic 5-cell polyomino partitioning enhanced with ordered directional sightline clues.}\n\\lshead{6.10}{Pentominous (Outside Clues)}{LS 53}'
    ),
    (
        '% PAGE 7: LS 54\n% =========================================================================\n\n\\lshead{6.11}',
        '% PAGE 7: LS 54\n% =========================================================================\n\n\\showcaseheader{LS 54: Directional Paths \\& Frictionless Ice}{Diagonal path vectors in Guide Exit and straight inertia runs across frictionless icy cells in Ice Walk Delayed.}\n\n\\lshead{6.11}'
    ),
    (
        '% PAGE 8: LS 55 & LS 57\n% =========================================================================\n\n\\begin{minipage}[t]{0.48\\textwidth}\n\\lshead{6.13}',
        '% PAGE 8: LS 55 & LS 57\n% =========================================================================\n\n\\showcaseheader{LS 55: Kurotto Banana \\& Disorderly Loops}{Choco Banana\'s rectangular chocolate meets Kurotto cell-sum clues, paired with a directionless Tapa loop.}\n\n\\begin{minipage}[t]{0.48\\textwidth}\n\\lshead{6.13}'
    ),
    (
        '\\lshead{6.15}{Instructionless Puzzle}{LS 57}',
        '\\showcaseheadermini{LS 57: Instructionless Deduction}{Zero written rules: decipher the governing logic system solely from clues and topological consistency.}\n\\lshead{6.15}{Instructionless Deduction}{LS 57}'
    ),
    (
        '% PAGE 9: LS 58 (Pentomino Triad)\n% =========================================================================\n\n\\begin{minipage}[t]{0.31\\textwidth}\n\\lshead{6.16}',
        '% PAGE 9: LS 58 (Pentomino Triad)\n% =========================================================================\n\n\\showcaseheader{LS 58: Pentomino Letter Grid Triad}{A thematic triptych of 5-cell region divisions under strict non-touching geometric constraints.}\n\n\\begin{minipage}[t]{0.31\\textwidth}\n\\lshead{6.16}'
    ),
    (
        '% PAGE 10: LS 59 (One Square Series)\n% =========================================================================\n\n\\begin{minipage}[t]{0.31\\textwidth}\n\\lshead{6.19}',
        '% PAGE 10: LS 59 (One Square Series)\n% =========================================================================\n\n\\showcaseheader{LS 59: The One Square Series}{Each grid conceals exactly one unshaded square among rectangular fields and balance loops.}\n\n\\begin{minipage}[t]{0.31\\textwidth}\n\\lshead{6.19}'
    ),
    (
        '% PAGE 11: LS 60 & LS 61 (Connected & Contact)\n% =========================================================================\n\n\\begin{minipage}[t]{0.48\\textwidth}\n\\lshead{6.22}',
        '% PAGE 11: LS 60 & LS 61 (Connected & Contact)\n% =========================================================================\n\n\\showcaseheader{LS 60: Connected Unshaded Topology}{Canal View and Masyu mechanics augmented with a global connectivity condition for all unshaded cells.}\n\n\\begin{minipage}[t]{0.48\\textwidth}\n\\lshead{6.22}'
    ),
    (
        '\\lshead{6.24}{Contact ``Equal Sign\'\'}{LS 61}',
        '\\showcaseheadermini{LS 61: The Contact \\& Rampage Omnibus}{High-octane miniatures: symbolic Contact matching, boundary-hugging Rampage circuits, and turn-counting loops.}\n\\lshead{6.24}{Contact ``Equal Sign\'\'}{LS 61}'
    ),
    (
        '\\lshead{6.33}{Slitherlink (Full) + Turnaround (Full)}{LS 63}',
        '\\showcaseheadermini{LS 63: Dual Genre Partitioning}{Partition a grid into two territories: one as Slitherlink (Full) and the other as Turnaround (Full).}\n\\lshead{6.33}{Slitherlink (Full) + Turnaround (Full)}{LS 63}'
    ),
    (
        '% PAGE 14: LS 64, LS 65, LS 66\n% =========================================================================\n\n\\lshead{6.34}',
        '% PAGE 14: LS 64, LS 65, LS 66\n% =========================================================================\n\n\\showcaseheader{LS 64: Reflective Geometry}{Laser-like loop paths bouncing across double-sided blue mirror lines across the grid.}\n\n\\lshead{6.34}'
    ),
    (
        '\\lshead{6.35}{Reprising LS39: Tapa Rope}{LS 65}',
        '\\showcaseheadermini{LS 65: Co-op Classics \\& Tapa Rope}{Sequential rope-attached clue blocks dictate contiguous shaded segments along twisting paths.}\n\\lshead{6.35}{Reprising LS39: Tapa Rope}{LS 65}'
    ),
    (
        '\\lshead{6.36}{Canal View (Disco)}{LS 66}',
        '\\showcaseheadermini{LS 66: Canal View Disco}{Canal View line-of-sight shading where each room must contain exactly two separated shaded islands.}\n\\lshead{6.36}{Canal View (Disco)}{LS 66}'
    ),
    (
        '% PAGE 15: LS 67 & LS 68\n% =========================================================================\n\n\\begin{minipage}[t]{0.48\\textwidth}\n\\lshead{6.37}',
        '% PAGE 15: LS 67 & LS 68\n% =========================================================================\n\n\\showcaseheader{LS 67: Partial Pentominous \\& CB Inequality}{Sub-region shape containment in Pentominous, coupled with strict relational inequalities in Choco Banana.}\n\n\\begin{minipage}[t]{0.48\\textwidth}\n\\lshead{6.37}'
    ),
    (
        '\\begin{minipage}[t]{0.48\\textwidth}\n\\lshead{6.39}{Pattern Square (Size)}{LS 68}',
        '\\showcaseheadermini{LS 68: Pattern Square Permutations}{Each row and column of 2x2 blocks contains all six unique shading patterns without repeats.}\n\\begin{minipage}[t]{0.48\\textwidth}\n\\lshead{6.39}{Pattern Square (Size)}{LS 68}'
    ),
    (
        '% PAGE 16: LS 69 & LS 70\n% =========================================================================\n\n\\lshead{6.41}',
        '% PAGE 16: LS 69 & LS 70\n% =========================================================================\n\n\\showcaseheader{LS 69: Yajiring-ring}{Intersecting rectangular loop networks weaving through empty space without turning at crossings.}\n\n\\lshead{6.41}'
    ),
    (
        '\\lshead{6.42}{Alphabet Asp}{LS 70}',
        '\\showcaseheadermini{LS 70: Alphabet Asp}{Linguistic snake paths forming a complete lexicon of given words regulated by directional barriers.}\n\\lshead{6.42}{Alphabet Asp}{LS 70}'
    )
]

for old, new in replacements:
    if old in content:
        content = content.replace(old, new, 1)
        print("Replaced:", old.split('\n')[0][:40])
    else:
        print("WARNING: Not found:", old.split('\n')[0][:40])

# Update Page 17 (Choco Banana Tower)
old_tower = r"""% PAGE 17: LS 71 (Choco Banana Tower)
% =========================================================================

\lshead{6.43}{Choco Banana Tower}{LS 71}
\vspace{1mm}

\begin{minipage}[t]{0.32\textwidth}
\footnotesize
\textbf{Welcome to the 50-Story Choco Banana Tower!}\\[2mm]
Standard Choco Banana rules apply throughout the entire monolithic structure:
\begin{itemize}
  \setlength{\itemsep}{3pt}
  \item Shade cells so that all connected shaded groups are \textbf{rectangular} (chocolate).
  \item All connected unshaded groups are \textbf{non-rectangular} (banana).
  \item Number clues indicate the exact size of the connected group containing the clue.
\end{itemize}
\smallskip
\textit{Height: 50 cells. Master the sheer vertical deduction as the chocolate blocks and banana corridors climb skyward!}
\end{minipage}
\hfill
\begin{minipage}[t]{0.65\textwidth}
\centering
\includegraphics[height=20.5cm, keepaspectratio]{ls71_choco_banana_tower_puzzle.pdf}
\end{minipage}"""

new_tower = r"""% PAGE 17: LS 71 (Choco Banana Tower)
% Architectural Showcase Page
% =========================================================================

\showcaseheader{LS 71: Choco Banana 50-Story Tower}{The 50-Story Monolith: Scale 50 vertical stories of pure deduction! Balance rectangular chocolate blocks against irregular banana corridors from the ground floor to the summit.}

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

if old_tower in content:
    content = content.replace(old_tower, new_tower, 1)
    print("Replaced Tower Page!")
else:
    print("WARNING: old_tower not found")

# Update Page 18 (Grand Finale)
old_finale = r"""% PAGE 18: LS 72 to LS 75 (Grand Finale)
% =========================================================================

\begin{minipage}[t]{0.48\textwidth}
\lshead{6.44}{Pencils (Look-Air)}{LS 72}
\vspace{1mm}
\footnotesize
\textbf{Rules:} Normal Pencils rules apply. Two pencils of the same size cannot see each other along horizontal/vertical lines of non-pencil body cells.
\vspace{1mm}
\centering
\includegraphics[width=5.5cm]{ls72_pencils_look_air_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}
\lshead{6.45}{Pentominous (Myopia)}{LS 73}
\vspace{1mm}
\footnotesize
\textbf{Rules:} Divide grid into pentominoes (5 cells). Arrows indicate orthogonal directions which tie for having that letter's shape closest to the clued cell.
\vspace{1mm}
\centering
\includegraphics[width=5.5cm]{ls73_pentominous_myopia_puzzle.pdf}
\end{minipage}

\vspace{4mm}
\hrule
\vspace{3mm}

\begin{minipage}[t]{0.48\textwidth}
\lshead{6.46}{Choco Banana (Thermo)}{LS 74}
\vspace{1mm}
\footnotesize
\textbf{Rules:} Standard Choco Banana rules apply. Region sizes along the thermometer must strictly increase from the bulb (round end) to the tip.
\vspace{1mm}
\centering
\includegraphics[width=5.5cm]{ls74_choco_banana_thermo_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}
\lshead{6.47}{Pentominous (Irrwisch)}{LS 75}
\vspace{1mm}
\footnotesize
\textbf{Rules:} Divide grid into pentominoes (5 cells). Irrwisch variant: each instance of letter ``A'' represents a different pentomino shape!
\vspace{1mm}
\centering
\includegraphics[width=5.5cm]{ls75_pentominous_irrwisch_puzzle.pdf}
\end{minipage}"""

new_finale = r"""% PAGE 18: LS 72 to LS 75 (Grand Finale)
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
\end{minipage}"""

if old_finale in content:
    content = content.replace(old_finale, new_finale, 1)
    print("Replaced Grand Finale Page!")
else:
    print("WARNING: old_finale not found")

with open(tex_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully wrote updated logic_showcase.tex!")
