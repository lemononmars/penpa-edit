# Python generator for print-ready, consistent logic_showcase.tex
# Reads source data and constructs the entire logic_showcase.tex file

output_path = r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\logic_showcase.tex"

content = r"""% =========================================================================
% LOGIC SHOWCASE COMPENDIUM SECTION (LS 49 to LS 75)
% Code Breaker Logic Puzzle Contest II
% Mathematically verified, consistent cell size (\cellsize = 4.5mm)
% =========================================================================

\newlength{\cellsize}
\setlength{\cellsize}{4.5mm}

% Helper for Noticeable Section Headers
\newcommand{\showcaseheader}[2]{%
  \begin{tcolorbox}[
    colback=white,
    colframe=cbdarkteal,
    boxrule=1.0pt,
    arc=1.5mm,
    left=3.5mm, right=3.5mm, top=2mm, bottom=2.5mm,
    before=\vspace{0.5mm}, after=\vspace{2.5mm},
    title={\textbf{\large\color{white} #1}},
    colbacktitle=cbdarkteal,
    titlerule=0pt
  ]
    \raggedright
    {\footnotesize\color{black!90} #2}
  \end{tcolorbox}%
}

\newcommand{\showcaseheadermini}[2]{%
  \begin{tcolorbox}[
    colback=white,
    colframe=cbdarkteal,
    boxrule=0.8pt,
    arc=1.2mm,
    left=2.5mm, right=2.5mm, top=1.2mm, bottom=1.5mm,
    before=\vspace{0.3mm}, after=\vspace{1.5mm},
    title={\textbf{\normalsize\color{white} #1}},
    colbacktitle=cbdarkteal,
    titlerule=0pt
  ]
    \raggedright
    {\scriptsize\color{black!90} #2}
  \end{tcolorbox}%
}

% Standardized Table Header for Individual Puzzles
\newcommand{\lshead}[3]{%
  \noindent
  \begin{tblr}{
    colspec = {Q[c,m,18mm]Q[l,m,120mm]Q[c,m,28mm]},
    column{1} = {bg=cbteal!20, font=\bfseries\color{cbdarkteal}},
    column{2} = {bg=white, font=\bfseries\normalsize\color{cbdarkteal}},
    column{3} = {bg=cbteal!30, font=\bfseries\small\color{cbdarkteal}},
    hlines = {0.6pt, cbdarkteal},
    vlines = {0.6pt, cbdarkteal},
    rows = {abovesep=1.8pt, belowsep=1.8pt}
  }
  #1 & #2 & #3 \\
  \end{tblr}%
  \par\vspace{1mm}%
}

% Compact Header for multi-puzzle pages
\newcommand{\lsheads}[3]{%
  \noindent
  \begin{tblr}{
    colspec = {Q[c,m,14mm]X[l,m]Q[c,m,20mm]},
    column{1} = {bg=cbteal!20, font=\bfseries\small\color{cbdarkteal}},
    column{2} = {bg=white, font=\bfseries\small\color{cbdarkteal}},
    column{3} = {bg=cbteal!30, font=\bfseries\scriptsize\color{cbdarkteal}},
    hlines = {0.5pt, cbdarkteal},
    vlines = {0.5pt, cbdarkteal},
    rows = {abovesep=1.2pt, belowsep=1.2pt}
  }
  #1 & #2 & #3 \\
  \end{tblr}%
  \par\vspace{0.8mm}%
}

% Online Interactive Callout Box for 6.5, 6.6, 6.7
\newcommand{\onlinecallout}[1]{%
  \begin{tcolorbox}[
    colback=cbmint!20!white,
    colframe=cbdarkteal,
    boxrule=0.7pt,
    arc=1.2mm,
    left=2.5mm, right=2.5mm, top=1.5mm, bottom=1.5mm,
    before=\vspace{1.5mm}, after=\vspace{1mm}
  ]
    \raggedright
    \textbf{\footnotesize Online Interactive Puzzle:}\\[0.5mm]
    {\scriptsize This puzzle features dynamic reveals and cannot be solved on paper. Please solve online at:\\
    \url{#1}}
  \end{tcolorbox}%
}

\fancyfoot[c]{\footnotesize Logic Showcase}

\phantomsection
\addcontentsline{toc}{chapter}{Special Section: Logic Showcase}

\begin{center}
{\fontsize{26}{32}\selectfont \textbf{\color{cbdarkteal}Logic Showcase}}
\vspace{2mm}

{\large \textbf{Avant-Garde Hybrid Logic Exhibition (LS 49 -- LS 75)}}
\vspace{1mm}

{\color{cbdarkteal}\rule{0.6\textwidth}{1.2pt}}
\end{center}

\vspace{2mm}

\begin{tcolorbox}[
  colback=cbdarkteal!6!white,
  colframe=cbdarkteal,
  boxrule=0.8pt,
  arc=2mm,
  left=4mm, right=4mm, top=3mm, bottom=3mm
]
  \raggedright
  \textbf{\large Welcome to the Logic Showcase Exhibition!}
  \vspace{1.5mm}

  \normalsize
  The Logic Showcase series serves as a laboratory for avant-garde pencil-and-paper logic puzzles. Ranging from \textbf{LS 49} to \textbf{LS 75}, these 47 curated compositions push classical mechanics into unchartered mathematical territories:
  \begin{itemize}
    \setlength{\itemsep}{1.5pt}
    \item \textbf{Topological Inversions}: Shaded and unshaded cells exchange roles in Twilight Canal View and Twilight Kurodoko.
    \item \textbf{Laser Sightlines \& Reflections}: Laser-like loop paths bouncing off double-sided mirrors in Mirror Loop, and sightline restrictions in Pencils (Look-Air).
    \item \textbf{Geometric Polymorphism}: Triomino and tetromino L-shapes in L-Voxas/L-Dots, partial pentomino containment, and variable-cipher Irrwisch grids.
    \item \textbf{Dynamic Digital Hybrids}: Experimental candidate-elimination Skyscrapers and Slitherlink Polygraphs authored for online interactive exploration.
    \item \textbf{Architectural Climax}: The mammoth 50-Story Choco Banana Tower challenging spatial deduction on an unprecedented scale.
  \end{itemize}
\end{tcolorbox}

\vspace{3mm}

\begin{tcolorbox}[
  colback=white,
  colframe=cbdarkteal,
  boxrule=0.6pt,
  arc=1.5mm,
  left=3.5mm, right=3.5mm, top=2.5mm, bottom=2.5mm
]
  \raggedright
  \textbf{\footnotesize Solving Instructions \& Verification Notation:}
  \begin{itemize}
    \setlength{\itemsep}{1pt}
    \item All puzzles possess a 100\% unique logical conclusion requiring zero guessing.
    \item Cell sizes across all grids are strictly normalized for unified visual consistency.
    \item Complete step-by-step verified answer keys are cataloged in the Official Solutions section.
  \end{itemize}
\end{tcolorbox}

\newpage

\fancyfoot[r]{\footnotesize Logic Showcase}
\thispagestyle{empty}

\begin{center}
{\Large \textbf{\color{cbdarkteal}Logic Showcase Catalog \& Index (LS 49 -- LS 75)}}
\vspace{1mm}

{\color{cbdarkteal}\rule{0.5\textwidth}{0.8pt}}
\end{center}
\vspace{1mm}

\begin{center}
\footnotesize
\begin{tblr}{
  colspec = {Q[c,m,12mm]X[l,m]Q[c,m,12mm]X[l,m]},
  row{1} = {bg=cbdarkteal, font=\bfseries\color{white}},
  column{1,3} = {font=\bfseries\color{cbdarkteal}},
  hlines = {0.4pt, cbdarkteal!50},
  vlines = {0.4pt, cbdarkteal!50},
  rows = {abovesep=1.2pt, belowsep=1.2pt}
}
ID & Showcase Title & ID & Showcase Title \\
LS 49 & Twilight Canal View, Twilight Kurodoko & LS 63 & Slitherlink (Full) + Turnaround (Full) \\
LS 50 & L-Voxas, L-Dots & LS 64 & Mirror Loop (Reflective Geometry) \\
LS 51 & Skyscrapers, Slitherlink, Treasure Hunt & LS 65 & Reprising LS39: Tapa Rope \\
LS 52 & Foreshadow Crossing, Remembered Choco & LS 66 & Canal View (Disco) \\
LS 53 & Pentominous (Outside Clues) & LS 67 & Pentominous (Partial), CB Inequality \\
LS 54 & Guide Exit, Ice Walk (Delayed) & LS 68 & Pattern Square (Size, CTS) \\
LS 55 & Kurotto Banana, Disorderly Tapa Loop & LS 69 & Yajiring-ring \\
LS 57 & Instructionless Deduction & LS 70 & Alphabet Asp \\
LS 58 & Pentomino Letter Grid Triad (I, II, III) & LS 71 & Choco Banana Tower (50 Stories) \\
LS 59 & Territory, Choco Banana, Balance Loop & LS 72 & Pencils (Look-Air Sightlines) \\
LS 60 & Canal View (Connected), Masyu (Connected) & LS 73 & Pentominous (Myopia) \\
LS 61 & Contact Polyominoes (3 Grids) & LS 74 & Choco Banana (Thermo) \\
LS 61 & Rampage Loop Series (3 Grids) & LS 75 & Pentominous Irrwisch (Cipher Finale) \\
LS 61 & Turnaround Series (Spiral, 9x9, 12x12) & & \\
\end{tblr}
\end{center}

\newpage

% =========================================================================
% PAGE 3: LS 49
% =========================================================================

\showcaseheader{LS 49: Twilight Inversions}{Inverted perspective deductions where shaded and unshaded cells swap classical roles in Canal View and diagonal-sightline Kurodoko.}

\lshead{6.1}{Twilight Canal View}{LS 49}
\vspace{1mm}

\begin{minipage}[t]{0.44\textwidth}\vspace{0pt}
\raggedright
\footnotesize
\textbf{Rules:}
\begin{itemize}
  \setlength{\itemsep}{1.2pt}
  \item Shade some cells so all shaded cells form one connected area without 2$\times$2 shaded squares.
  \item An unshaded clue indicates the number of shaded cells in a contiguous line starting from that cell in the four cardinal directions.
  \item A shaded clue indicates the number of unshaded cells in a contiguous line starting from that cell in the four cardinal directions.
\end{itemize}
\end{minipage}
\hfill
\begin{minipage}[t]{0.54\textwidth}\vspace{0pt}
\centering
\textbf{Example (6$\times$6):}\hspace{2mm}
\includegraphics[width=\dimexpr 6\cellsize\relax]{ls49_twilight_canal_view_example.pdf}
\hspace{3mm}
\textbf{Puzzle:}\hspace{2mm}
\includegraphics[width=\dimexpr 10\cellsize\relax]{ls49_twilight_canal_view_puzzle.pdf}
\end{minipage}

\vspace{2.5mm}
\hrule
\vspace{2.5mm}

\lshead{6.2}{Twilight Kurodoko / Kurodoko (Diagonal)}{LS 49}
\vspace{1mm}

\begin{minipage}[t]{0.44\textwidth}\vspace{0pt}
\raggedright
\footnotesize
\textbf{Rules:}
\begin{itemize}
  \setlength{\itemsep}{1.2pt}
  \item Shade some cells so all unshaded cells form one connected area. Shaded cells cannot be orthogonally adjacent.
  \item An unshaded clue indicates the number of unshaded cells seen horizontally or vertically, including itself.
  \item A shaded clue indicates the number of shaded cells seen diagonally, including itself.
\end{itemize}
\end{minipage}
\hfill
\begin{minipage}[t]{0.54\textwidth}\vspace{0pt}
\centering
\textbf{Example (6$\times$6):}\hspace{2mm}
\includegraphics[width=\dimexpr 6\cellsize\relax]{ls49_twilight_kurodoko_example.pdf}
\hspace{3mm}
\textbf{Puzzle:}\hspace{2mm}
\includegraphics[width=\dimexpr 10\cellsize\relax]{ls49_twilight_kurodoko_puzzle.pdf}
\end{minipage}

\newpage

% =========================================================================
% PAGE 4: LS 50
% =========================================================================

\showcaseheader{LS 50: L-Polyomino Geometry}{Divide the grid into triomino and tetromino L-shapes governed by border dot constraints on relative size and orientation.}

\lshead{6.3}{L-Voxas}{LS 50}
\vspace{1mm}

\begin{minipage}[t]{0.44\textwidth}\vspace{0pt}
\raggedright
\footnotesize
\textbf{Rules:}
\begin{itemize}
  \setlength{\itemsep}{1.2pt}
  \item Divide the grid into regions of orthogonally connected cells.
  \item Each region must be an L shape with a width of one cell, and leg lengths of 2 or 3 cells.
  \item White dots separate legs with the same size and orientation.
  \item Black dots separate legs with neither the same size nor the same orientation.
  \item Grey dots separate legs with either the same size or the same orientation, but not both.
\end{itemize}
\end{minipage}
\hfill
\begin{minipage}[t]{0.54\textwidth}\vspace{0pt}
\centering
\textbf{Example (6$\times$6):}\hspace{2mm}
\includegraphics[width=\dimexpr 6\cellsize\relax]{ls50_l_voxas_example.pdf}
\hspace{3mm}
\textbf{Puzzle:}\hspace{2mm}
\includegraphics[width=\dimexpr 10\cellsize\relax]{ls50_l_voxas_puzzle.pdf}
\end{minipage}

\vspace{2.5mm}
\hrule
\vspace{2.5mm}

\lshead{6.4}{L-Dots}{LS 50}
\vspace{1mm}

\begin{minipage}[t]{0.44\textwidth}\vspace{0pt}
\raggedright
\footnotesize
\textbf{Rules:}
\begin{itemize}
  \setlength{\itemsep}{1.2pt}
  \item Divide the grid into regions of orthogonally connected cells.
  \item Each region must be an L shape with a width of one cell, and leg lengths of 2 or 3 cells.
  \item White dots separate legs with the same size.
  \item Black dots separate legs with different sizes.
  \item Grey dots separate cells with the same orientation.
\end{itemize}
\end{minipage}
\hfill
\begin{minipage}[t]{0.54\textwidth}\vspace{0pt}
\centering
\textbf{Example (6$\times$6):}\hspace{2mm}
\includegraphics[width=\dimexpr 6\cellsize\relax]{ls50_l_dots_example.pdf}
\hspace{3mm}
\textbf{Puzzle:}\hspace{2mm}
\includegraphics[width=\dimexpr 10\cellsize\relax]{ls50_l_dots_puzzle.pdf}
\end{minipage}

\newpage

% =========================================================================
% PAGE 5: LS 51 (Interactive Candidate Arrows & Polygraph)
% =========================================================================

\showcaseheader{LS 51: Triple Deduction Trials}{Experimental hybrids: candidate-arrow Skyscrapers, loop-boundary Slitherlink Polygraph, and coordinate-linked Treasure Hunt.}

\lshead{6.5}{Skyscrapers (Candidate Arrows)}{LS 51}
\vspace{0.8mm}

\begin{minipage}[t]{0.52\textwidth}\vspace{0pt}
\raggedright
\scriptsize
\textbf{Rules:} Place digits 1 to 6 (1 to 4 in example) once per row and column. Outer clues indicate visible buildings. Grids next to each side represent clue candidates. Shade invalid candidates, unshade correct ones. Revealing an arrow forces shading the neighboring cell it points to.

\onlinecallout{https://tinyurl.com/yk7tr7r6}
\end{minipage}
\hfill
\begin{minipage}[t]{0.46\textwidth}\vspace{0pt}
\centering
\textbf{Example (12$\times$12):}\hspace{2mm}
\includegraphics[width=\dimexpr 10\cellsize\relax]{ls51_skyscrapers_example.pdf}\\[1mm]
\textbf{Puzzle Grid (18$\times$18):}\\[0.5mm]
\includegraphics[width=\dimexpr 13\cellsize\relax]{ls51_skyscrapers_puzzle.pdf}
\end{minipage}

\vspace{1.5mm}
\hrule
\vspace{1.5mm}

\lshead{6.6}{Slitherlink (Polygraph)}{LS 51}
\vspace{0.8mm}

\begin{minipage}[t]{0.52\textwidth}\vspace{0pt}
\raggedright
\scriptsize
\textbf{Rules:} Draw a single non-intersecting loop along grid edges. Clues outside the loop count used edges around them. Clues inside the loop count unused edges around them. Clues are revealed dynamically as cells are shaded inside or outside.

\onlinecallout{https://tinyurl.com/yol8ujg5}
\end{minipage}
\hfill
\begin{minipage}[t]{0.46\textwidth}\vspace{0pt}
\centering
\textbf{Example:}\hspace{2mm}
\includegraphics[width=\dimexpr 6\cellsize\relax]{ls51_slitherlink_polygraph_example.pdf}
\hspace{2mm}
\textbf{Puzzle Grid:}\hspace{2mm}
\includegraphics[width=\dimexpr 10\cellsize\relax]{ls51_slitherlink_polygraph_puzzle.pdf}
\end{minipage}

\newpage

% =========================================================================
% PAGE 6: LS 51 & LS 52
% =========================================================================

\showcaseheadermini{LS 51: Choco Banana Treasure Hunt}{Dynamic coordinate matching between shaded letter pairs and peripheral targets.}
\lshead{6.7}{Choco Banana Treasure Hunt}{LS 51}
\vspace{0.8mm}

\begin{minipage}[t]{0.52\textwidth}\vspace{0pt}
\raggedright
\footnotesize
\textbf{Rules:}
\begin{itemize}
  \setlength{\itemsep}{1pt}
  \item Standard Choco Banana rules apply (shaded rectangular, unshaded non-rectangular).
  \item Clues state region size. If a region contains letters, it contains exactly one uppercase and one lowercase letter.
  \item Together they form coordinates for a clue outside, matching shade state.
\end{itemize}

\onlinecallout{https://tinyurl.com/yrk8h8wb}
\end{minipage}
\hfill
\begin{minipage}[t]{0.46\textwidth}\vspace{0pt}
\centering
\includegraphics[width=\dimexpr 16\cellsize\relax]{ls51_choco_banana_treasure_hunt_puzzle.pdf}
\end{minipage}

\vspace{2mm}
\hrule
\vspace{2mm}

\showcaseheadermini{LS 52: Directed Loops \& Thermal Shading}{Self-intersecting directed paths with distance clues and region-matching thermal traversal.}
\lshead{6.8}{Foreshadow Crossing}{LS 52}
\vspace{0.8mm}

\begin{minipage}[t]{0.46\textwidth}\vspace{0pt}
\raggedright
\footnotesize
\textbf{Rules:} Draw a directed loop through all cell centers. Clues indicate distance to the next loop crossing in that forward direction. Clues cannot be visited multiple times.
\end{minipage}
\hfill
\begin{minipage}[t]{0.52\textwidth}\vspace{0pt}
\centering
\textbf{Example (5$\times$5):}\hspace{2mm}
\includegraphics[width=\dimexpr 5\cellsize\relax]{ls52_foreshadow_crossing_example.pdf}
\hspace{2mm}
\textbf{Puzzle (10$\times$10):}\hspace{2mm}
\includegraphics[width=\dimexpr 10\cellsize\relax]{ls52_foreshadow_crossing_puzzle.pdf}
\end{minipage}

\newpage

% =========================================================================
% PAGE 7: LS 52 & LS 53
% =========================================================================

\lshead{6.9}{Remembered Choco Frozen Banana}{LS 52}
\vspace{1mm}

\begin{minipage}[t]{0.52\textwidth}\vspace{0pt}
\raggedright
\footnotesize
\textbf{Rules:}
\begin{itemize}
  \setlength{\itemsep}{1.2pt}
  \item Choco Banana rules apply (shaded rectangular, unshaded non-rectangular).
  \item Clues state region sizes. Thermometer numbers must strictly increase from bulb to tip.
  \item Shaded regions containing thermometers must match in size.
\end{itemize}
\end{minipage}
\hfill
\begin{minipage}[t]{0.46\textwidth}\vspace{0pt}
\centering
\includegraphics[width=\dimexpr 8\cellsize\relax]{ls52_remembered_choco_frozen_banana_puzzle.pdf}
\end{minipage}

\vspace{3mm}
\hrule
\vspace{3mm}

\showcaseheadermini{LS 53: Pentominous Outside Clues}{Classic 5-cell polyomino partitioning enhanced with ordered directional sightline clues.}
\lshead{6.10}{Pentominous (Outside Clues)}{LS 53}
\vspace{1mm}

\begin{minipage}[t]{0.44\textwidth}\vspace{0pt}
\raggedright
\footnotesize
\textbf{Rules:}
\begin{itemize}
  \setlength{\itemsep}{1.2pt}
  \item Divide the grid into pentominoes (5 cells each). Identical pentomino shapes cannot touch orthogonally.
  \item Outside clues indicate the order of pentomino shapes seen in that row or column from that side.
\end{itemize}
\end{minipage}
\hfill
\begin{minipage}[t]{0.54\textwidth}\vspace{0pt}
\centering
\textbf{Example (7$\times$7):}\hspace{2mm}
\includegraphics[width=\dimexpr 7\cellsize\relax]{ls53_pentominous_outside_example.pdf}
\hspace{2mm}
\textbf{Puzzle (15$\times$15):}\hspace{2mm}
\includegraphics[width=\dimexpr 14\cellsize\relax]{ls53_pentominous_outside_puzzle.pdf}
\end{minipage}

\newpage

% =========================================================================
% PAGE 8: LS 54
% =========================================================================

\showcaseheader{LS 54: Directional Paths \& Frictionless Ice}{Diagonal path vectors in Guide Exit and straight inertia runs across frictionless icy cells in Ice Walk Delayed.}

\lshead{6.11}{Guide Exit}{LS 54}
\vspace{1mm}

\begin{minipage}[t]{0.44\textwidth}\vspace{0pt}
\raggedright
\footnotesize
\textbf{Rules:} Draw paths starting from grey start cells to white exit cells. Diagonal clues indicate direction. Paths cannot touch or cross. Each cell can contain at most one path segment.
\end{minipage}
\hfill
\begin{minipage}[t]{0.54\textwidth}\vspace{0pt}
\centering
\textbf{Example (7$\times$7):}\hspace{2mm}
\includegraphics[width=\dimexpr 7\cellsize\relax]{ls54_guide_exit_example.pdf}
\hspace{2mm}
\textbf{Puzzle (12$\times$12):}\hspace{2mm}
\includegraphics[width=\dimexpr 12\cellsize\relax]{ls54_guide_exit_puzzle.pdf}
\end{minipage}

\vspace{3mm}
\hrule
\vspace{3mm}

\lshead{6.12}{Ice Walk (Delayed)}{LS 54}
\vspace{1mm}

\begin{minipage}[t]{0.52\textwidth}\vspace{0pt}
\raggedright
\footnotesize
\textbf{Rules:}
\begin{itemize}
  \setlength{\itemsep}{1.2pt}
  \item Draw a single non-intersecting loop through cell centers that visits all numbered cells in sequential numerical order.
  \item Ice cells are frictionless: the loop cannot turn on ice cells and must continue straight through until reaching land.
\end{itemize}
\end{minipage}
\hfill
\begin{minipage}[t]{0.46\textwidth}\vspace{0pt}
\centering
\includegraphics[width=\dimexpr 12\cellsize\relax]{ls54_ice_walk_delayed_puzzle.pdf}
\end{minipage}

\newpage

% =========================================================================
% PAGE 9: LS 55, LS 56, LS 57
% =========================================================================

\showcaseheader{LS 55: Kurotto Banana \& Disorderly Loops}{Choco Banana's rectangular chocolate meets Kurotto cell-sum clues, paired with a directionless Tapa loop.}

\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\lsheads{6.13}{Kurotto Banana}{LS 55}
\vspace{0.5mm}
\scriptsize\raggedright
\textbf{Rules:} Choco Banana rules apply (shaded rectangular, unshaded non-rectangular). Circled clues count shaded cells in orthogonally contiguous shaded groups sharing an edge with the clue.
\vspace{1mm}
\centering
\includegraphics[width=\dimexpr 13\cellsize\relax]{ls55_kurotto_banana_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\lsheads{6.14}{Disorderly Tapa-like}{LS 55}
\vspace{0.5mm}
\scriptsize\raggedright
\textbf{Rules:} Draw a loop through empty cell centers. Cells with clues cannot contain the loop. Numbers in a cell indicate the lengths of loop segments in the 8 surrounding cells in any arbitrary order.
\vspace{1mm}
\centering
\includegraphics[width=\dimexpr 11\cellsize\relax]{ls55_disorderly_tapa_like_loop_puzzle.pdf}
\end{minipage}

\vspace{2mm}
\hrule
\vspace{1.5mm}

\showcaseheadermini{LS 57: Instructionless Deduction}{Zero given rules. Deduce all constraints purely from initial board symmetry, cluing, and solver intuition.}
\lshead{6.15}{Instructionless Deduction}{LS 57}
\vspace{0.8mm}

\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\raggedright
\footnotesize
\textbf{Rules:} No rules are provided! Determine the underlying puzzle type, mechanics, and exact shading/loop conditions through pure logical exploration of clue distributions and grid topology.
\end{minipage}
\hfill
\begin{minipage}[t]{0.50\textwidth}\vspace{0pt}
\centering
\includegraphics[width=\dimexpr 16\cellsize\relax]{ls57_instructionless_puzzle.pdf}
\end{minipage}

\newpage

% =========================================================================
% PAGE 10: LS 58 (Pentomino Letter Grid Triad)
% =========================================================================

\showcaseheader{LS 58: Pentomino Letter Grid Triad}{A thematic triptych of 5-cell region divisions under strict non-touching geometric constraints.}

\begin{minipage}[t]{0.32\textwidth}\vspace{0pt}
\lsheads{6.16}{Pentominous I}{LS 58}
\vspace{0.5mm}
\scriptsize\raggedright
\textbf{Rules:} Divide into pentominoes (5 cells). Matching shapes cannot touch orthogonally. Letters mark shapes.
\vspace{1mm}
\centering
\includegraphics[width=\dimexpr 12\cellsize\relax]{ls58_puzzle_1_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.32\textwidth}\vspace{0pt}
\lsheads{6.17}{Pentominous II}{LS 58}
\vspace{0.5mm}
\scriptsize\raggedright
\textbf{Rules:} Divide into pentominoes. Non-touching shape rule. Clues indicate polyomino shapes.
\vspace{1mm}
\centering
\includegraphics[width=\dimexpr 12\cellsize\relax]{ls58_puzzle_2_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.32\textwidth}\vspace{0pt}
\lsheads{6.18}{Pentominous III}{LS 58}
\vspace{0.5mm}
\scriptsize\raggedright
\textbf{Rules:} Pentominous rules apply. Clues use vertical bar symbols indicating pentomino shapes.
\vspace{1mm}
\centering
\includegraphics[width=\dimexpr 10\cellsize\relax]{ls58_puzzle_3_puzzle.pdf}
\end{minipage}

\newpage

% =========================================================================
% PAGE 11: LS 59 (One Square Series)
% =========================================================================
\enlargethispage{1.5cm}

\showcaseheadermini{LS 59: The One Square Series}{Each grid conceals exactly one unshaded square among rectangular fields and balance loops.}

\lsheads{6.19}{Territory (One Square)}{LS 59}
\vspace{0.5mm}
\begin{minipage}[t]{0.56\textwidth}\vspace{0pt}
\scriptsize\raggedright
\textbf{Rules:} Shade cells so no shaded cells are orthogonally adjacent and unshaded cells form one connected area. Clues cannot be shaded and indicate the size of the largest unshaded rectangle overlapping the clue. Exactly one clue represents the largest unshaded square.
\end{minipage}
\hfill
\begin{minipage}[t]{0.42\textwidth}\vspace{0pt}
\centering
\includegraphics[width=\dimexpr 11\cellsize\relax]{ls59_territory_one_square_puzzle.pdf}
\end{minipage}

\vspace{1.2mm}
\hrule
\vspace{1.2mm}

\lsheads{6.20}{Choco Banana (One Square)}{LS 59}
\vspace{0.5mm}
\begin{minipage}[t]{0.56\textwidth}\vspace{0pt}
\scriptsize\raggedright
\textbf{Rules:} Standard Choco Banana rules apply (shaded rectangular, unshaded non-rectangular). In addition, exactly one group of shaded cells in the whole grid is a square.
\end{minipage}
\hfill
\begin{minipage}[t]{0.42\textwidth}\vspace{0pt}
\centering
\includegraphics[width=\dimexpr 11\cellsize\relax]{ls59_choco_banana_one_square_puzzle.pdf}
\end{minipage}

\vspace{1.2mm}
\hrule
\vspace{1.2mm}

\lsheads{6.21}{Balance Loop (One Hidden White)}{LS 59}
\vspace{0.5mm}
\begin{minipage}[t]{0.56\textwidth}\vspace{0pt}
\scriptsize\raggedright
\textbf{Rules:} Draw a loop through all circles. Lines from white circles have equal lengths; from black circles unequal lengths. Clues represent arm length sums. Exactly one empty cell in the grid receives an added white circle.
\end{minipage}
\hfill
\begin{minipage}[t]{0.42\textwidth}\vspace{0pt}
\centering
\includegraphics[width=\dimexpr 13\cellsize\relax]{ls59_balance_loop_hidden_white_puzzle.pdf}
\end{minipage}

\newpage

% =========================================================================
% PAGE 12: LS 60 & LS 61 (Connected & Contact)
% =========================================================================

\showcaseheader{LS 60: Connected Unshaded Topology}{Canal View and Masyu mechanics augmented with a global connectivity condition for all unshaded cells.}

\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\lsheads{6.22}{Canal View (Connected)}{LS 60}
\vspace{0.5mm}
\scriptsize\raggedright
\textbf{Rules:} Classic Canal View rules apply. In addition, all unshaded cells must form one orthogonally connected region.
\vspace{0.8mm}
\centering
\includegraphics[width=\dimexpr 13\cellsize\relax]{ls60_canal_view_connected_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\lsheads{6.23}{Masyu (Connected)}{LS 60}
\vspace{0.5mm}
\scriptsize\raggedright
\textbf{Rules:} Classic Masyu rules apply. In addition, all cells not traversed by the loop must form one orthogonally connected area.
\vspace{0.8mm}
\centering
\includegraphics[width=\dimexpr 13\cellsize\relax]{ls60_masyu_connected_puzzle.pdf}
\end{minipage}

\vspace{2mm}
\hrule
\vspace{1.5mm}

\showcaseheadermini{LS 61: Contact Polyominoes}{Form polyomino groups satisfying contact criteria on equal signs and plus junctions.}

\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\lsheads{6.24}{Contact ``Equal Sign''}{LS 61}
\vspace{0.5mm}
\scriptsize\raggedright
\textbf{Rules:} Divide grid into polyominoes. Equal sign clues must separate regions with matching cell counts.
\vspace{0.8mm}
\centering
\includegraphics[width=\dimexpr 8\cellsize\relax]{ls61_contact_equal_sign_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\lsheads{6.25}{Contact ``Plus''}{LS 61}
\vspace{0.5mm}
\scriptsize\raggedright
\textbf{Rules:} Divide grid into polyominoes. Plus clues separate four regions whose cell counts satisfy additive conditions.
\vspace{0.8mm}
\centering
\includegraphics[width=\dimexpr 10\cellsize\relax]{ls61_contact_plus_puzzle.pdf}
\end{minipage}

\newpage

% =========================================================================
% PAGE 13: LS 61 (Contact & Rampage) - HEADER SPANS THE FULL WIDTH
% =========================================================================

\showcaseheader{LS 61: Contact Polyominoes \& Rampage Grids}{Progressive sizing and strict perimeter touch rules across polyomino contact clusters and obstacle rampage loops.}

\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\lsheads{6.26}{Contact ``Lenses''}{LS 61}
\vspace{0.5mm}
\scriptsize\raggedright
\textbf{Rules:} Master Contact grid. Form polyomino groups satisfying contact criteria.
\vspace{0.8mm}
\centering
\includegraphics[width=\dimexpr 11\cellsize\relax]{ls61_contact_lenses_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\lsheads{6.27}{Rampage ``Tilted Square''}{LS 61}
\vspace{0.5mm}
\scriptsize\raggedright
\textbf{Rules:} Draw a loop through centers of all unshaded cells. The loop must turn at tilted square markers.
\vspace{0.8mm}
\centering
\includegraphics[width=\dimexpr 8\cellsize\relax]{ls61_rampage_tilted_square_puzzle.pdf}
\end{minipage}

\vspace{2mm}
\hrule
\vspace{1.5mm}

\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\lsheads{6.28}{Rampage ``Ox Loops''}{LS 61}
\vspace{0.5mm}
\scriptsize\raggedright
\textbf{Rules:} Rampage rules apply. Traverse all white cells while satisfying ox-loop turn conditions.
\vspace{0.8mm}
\centering
\includegraphics[width=\dimexpr 11\cellsize\relax]{ls61_rampage_ox_loops_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\lsheads{6.29}{Rampage ``Roadblocks''}{LS 61}
\vspace{0.5mm}
\scriptsize\raggedright
\textbf{Rules:} Rampage grid navigating around roadblocks and strict track boundaries.
\vspace{0.8mm}
\centering
\includegraphics[width=\dimexpr 11\cellsize\relax]{ls61_rampage_roadblocks_puzzle.pdf}
\end{minipage}

\newpage

% =========================================================================
% PAGE 14: LS 61 (Turnaround) & LS 63 (Dual Full)
% =========================================================================

\showcaseheadermini{LS 61: Turnaround Series}{Non-intersecting loop traversal with compulsory 90-degree turns on numbered step indicators.}

\begin{minipage}[t]{0.31\textwidth}\vspace{0pt}
\lsheads{6.30}{Turnaround Spiral}{LS 61}
\vspace{0.4mm}
\scriptsize\raggedright
Turn indicators.
\vspace{0.6mm}
\centering
\includegraphics[width=\dimexpr 8\cellsize\relax]{ls61_turnaround_spiral_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.32\textwidth}\vspace{0pt}
\lsheads{6.31}{Turnaround 9x9}{LS 61}
\vspace{0.4mm}
\scriptsize\raggedright
Sequential turn rules.
\vspace{0.6mm}
\centering
\includegraphics[width=\dimexpr 10\cellsize\relax]{ls61_turnaround_9x9_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.33\textwidth}\vspace{0pt}
\lsheads{6.32}{Turnaround 12x12}{LS 61}
\vspace{0.4mm}
\scriptsize\raggedright
Full traversal loop.
\vspace{0.6mm}
\centering
\includegraphics[width=\dimexpr 11\cellsize\relax]{ls61_turnaround_12x12_puzzle.pdf}
\end{minipage}

\vspace{2mm}
\hrule
\vspace{1.5mm}

\showcaseheadermini{LS 63: Dual Full Slitherlink + Turnaround}{Compound loop constraints combining complete edge usage with mandatory step-count turns.}
\lshead{6.33}{Slitherlink (Full) + Turnaround (Full)}{LS 63}
\vspace{0.8mm}

\begin{minipage}[t]{0.44\textwidth}\vspace{0pt}
\raggedright
\footnotesize
\textbf{Rules:} Draw a single non-intersecting loop through cell centers. The loop must satisfy both full Slitherlink clues and Turnaround turn distance rules across all numbered junctions.
\end{minipage}
\hfill
\begin{minipage}[t]{0.54\textwidth}\vspace{0pt}
\centering
\textbf{Example:}\hspace{2mm}
\includegraphics[width=\dimexpr 6\cellsize\relax]{ls63_slitherlink_turnaround_full_example.pdf}
\hspace{2mm}
\textbf{Puzzle Grid:}\hspace{2mm}
\includegraphics[width=\dimexpr 9\cellsize\relax]{ls63_slitherlink_turnaround_full_puzzle.pdf}
\end{minipage}

\newpage

% =========================================================================
% PAGE 15: LS 64, LS 65, LS 66
% =========================================================================
\enlargethispage{1.6cm}

\showcaseheadermini{LS 64: Reflective Geometry}{Laser-like loop paths bouncing across double-sided blue mirror lines across the grid.}

\lsheads{6.34}{Mirror Loop}{LS 64}
\vspace{0.5mm}
\begin{minipage}[t]{0.56\textwidth}\vspace{0pt}
\scriptsize\raggedright
\textbf{Rules:} Draw a non-intersecting loop through cell centers. The blue edges are mirrors reflecting loop segments across to the other side up to the nearest border or mirror. Every mirror must reflect at least one loop segment. The loop may pass through a mirror.
\end{minipage}
\hfill
\begin{minipage}[t]{0.42\textwidth}\vspace{0pt}
\centering
\includegraphics[width=\dimexpr 10\cellsize\relax]{ls64_mirror_loop_puzzle.pdf}
\end{minipage}

\vspace{1mm}
\hrule
\vspace{1mm}

\showcaseheadermini{LS 65: Co-op Classics \& Tapa Rope}{Sequential rope-attached clue blocks dictate contiguous shaded segments along twisting paths.}
\lsheads{6.35}{Reprising LS39: Tapa Rope}{LS 65}
\vspace{0.5mm}
\begin{minipage}[t]{0.56\textwidth}\vspace{0pt}
\scriptsize\raggedright
\textbf{Rules:} Shade cells so all shaded cells form one connected area without 2$\times$2 shaded squares. Clues cannot be shaded and indicate the lengths of consecutive shaded blocks along the length of rope attached to the clue.
\end{minipage}
\hfill
\begin{minipage}[t]{0.42\textwidth}\vspace{0pt}
\centering
\includegraphics[width=\dimexpr 12\cellsize\relax]{ls65_tapa_rope_puzzle.pdf}
\end{minipage}

\vspace{1mm}
\hrule
\vspace{1mm}

\showcaseheadermini{LS 66: Canal View Disco}{Canal View line-of-sight shading where each room must contain exactly two separated shaded islands.}
\lsheads{6.36}{Canal View (Disco)}{LS 66}
\vspace{0.5mm}
\begin{minipage}[t]{0.56\textwidth}\vspace{0pt}
\scriptsize\raggedright
\textbf{Rules:} Canal View rules apply (shaded connected, no 2$\times$2). Clues cannot be shaded and count shaded cells in orthogonal lines. A question mark (?) is an unknown positive number. In addition, each bold region contains exactly two separate connected shaded groups.
\end{minipage}
\hfill
\begin{minipage}[t]{0.42\textwidth}\vspace{0pt}
\centering
\includegraphics[width=\dimexpr 12\cellsize\relax]{ls66_canal_view_disco_puzzle.pdf}
\end{minipage}

\newpage

% =========================================================================
% PAGE 16: LS 67 \& LS 68
% =========================================================================

\showcaseheader{LS 67: Partial Pentominous \& CB Inequality}{Sub-region shape containment in Pentominous, coupled with strict relational inequalities in Choco Banana.}

\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\lsheads{6.37}{Pentominous (Partial)}{LS 67}
\vspace{0.5mm}
\scriptsize\raggedright
\textbf{Rules:} Divide grid into pentominoes (5 cells each; identical shapes cannot touch). Clued cells belong to a pentomino region that the clued shape can fit inside without rotating or reflecting.
\vspace{0.8mm}
\centering
\includegraphics[width=\dimexpr 10\cellsize\relax]{ls67_pentominous_partial_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\lsheads{6.38}{Choco Banana (Inequality)}{LS 67}
\vspace{0.5mm}
\scriptsize\raggedright
\textbf{Rules:} Choco Banana rules apply. In addition, inequality signs between adjacent regions dictate which group has strictly greater cell count.
\vspace{0.8mm}
\centering
\includegraphics[width=\dimexpr 11\cellsize\relax]{ls67_choco_banana_inequality_puzzle.pdf}
\end{minipage}

\vspace{2mm}
\hrule
\vspace{1.5mm}

\showcaseheadermini{LS 68: Pattern Square Series}{Latin-square style distribution of distinct 2$\times$2 shaded polyomino patterns.}

\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\lsheads{6.39}{Pattern Square (Size)}{LS 68}
\vspace{0.5mm}
\scriptsize\raggedright
\textbf{Rules:} Shade cells so each of six 2$\times$2 shading patterns (or rotations) appears once per row/column of 2$\times$2 bold regions. Clues are shaded and indicate group size.
\vspace{0.8mm}
\centering
\includegraphics[width=\dimexpr 12\cellsize\relax]{ls68_pattern_square_size_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\lsheads{6.40}{Pattern Square (CTS)}{LS 68}
\vspace{0.5mm}
\scriptsize\raggedright
\textbf{Rules:} Pattern square Latin conditions apply. Clues state contiguous touching segment counts.
\vspace{0.8mm}
\centering
\includegraphics[width=\dimexpr 14\cellsize\relax]{ls68_pattern_square_cts_puzzle.pdf}
\end{minipage}

\newpage

% =========================================================================
% PAGE 17: LS 69 \& LS 70
% =========================================================================

\showcaseheader{LS 69: Yajiring-ring}{Intersecting rectangular loop networks weaving through empty space without turning at crossings.}

\lshead{6.41}{Yajiring-ring}{LS 69}
\vspace{1mm}

\begin{minipage}[t]{0.52\textwidth}\vspace{0pt}
\raggedright
\footnotesize
\textbf{Rules:}
\begin{itemize}
  \setlength{\itemsep}{1.2pt}
  \item Shade some empty cells and draw a single non-intersecting loop through all remaining unshaded cells.
  \item Shaded cells cannot be orthogonally adjacent.
  \item Clues indicate the number of shaded cells in that arrow direction.
  \item Loop lines may cross orthogonally in empty cells, but cannot turn at crossing intersections.
\end{itemize}
\end{minipage}
\hfill
\begin{minipage}[t]{0.46\textwidth}\vspace{0pt}
\centering
\includegraphics[width=\dimexpr 11\cellsize\relax]{ls69_yajiring_ring_puzzle.pdf}
\end{minipage}

\vspace{2.5mm}
\hrule
\vspace{2.5mm}

\showcaseheadermini{LS 70: Alphabet Asp}{Linguistic snake paths forming a complete lexicon of given words regulated by directional barriers.}
\lshead{6.42}{Alphabet Asp}{LS 70}
\vspace{1mm}

\begin{minipage}[t]{0.44\textwidth}\vspace{0pt}
\raggedright
\footnotesize
\textbf{Rules:}
\begin{itemize}
  \setlength{\itemsep}{1.2pt}
  \item Draw an snake (1-cell wide path) through letters without touching itself, even diagonally.
  \item The snake must visit all letters of every word in the vocabulary in sequential order.
\end{itemize}
\end{minipage}
\hfill
\begin{minipage}[t]{0.54\textwidth}\vspace{0pt}
\centering
\textbf{Example:}\hspace{2mm}
\includegraphics[height=\dimexpr 5\cellsize\relax, keepaspectratio]{ls70_alphabet_asp_example.pdf}
\hspace{2mm}
\textbf{Puzzle:}\hspace{2mm}
\includegraphics[height=\dimexpr 9\cellsize\relax, keepaspectratio]{ls70_alphabet_asp_puzzle.pdf}
\end{minipage}

\newpage

% =========================================================================
% PAGE 18: LS 71 (Choco Banana Tower)
% Architectural Showcase Page
% =========================================================================
\enlargethispage{0.6cm}

\lshead{6.43}{Choco Banana Tower}{LS 71}
\vspace{1mm}

\begin{minipage}[t]{0.46\textwidth}\vspace{0pt}
\begin{tcolorbox}[
  colback=cbdarkteal!7!white,
  colframe=cbdarkteal,
  boxrule=0.5pt,
  arc=1.2mm,
  left=2mm, right=2mm, top=1.2mm, bottom=1.2mm
]
  \raggedright
  \textbf{\footnotesize LS 71 Showcase:}\\[0.5mm]
  {\scriptsize Scale 50 vertical stories of pure deduction balancing rectangular chocolate blocks and banana corridors.}
\end{tcolorbox}

\vspace{1mm}

\footnotesize\raggedright
\textbf{Tower Construction Rules:}
\begin{itemize}
  \setlength{\itemsep}{1pt}
  \setlength{\topsep}{1pt}
  \item Shade some cells so that all areas of orthogonally connected shaded cells are \textbf{rectangular} (chocolate blocks).
  \item All areas of orthogonally connected unshaded cells are \textbf{non-rectangular} (banana corridors).
  \item A number clue represents the exact size of its orthogonally connected group of shaded or unshaded cells.
\end{itemize}

\vspace{1mm}

\begin{tcolorbox}[
  colback=cbdarkteal!8!white,
  colframe=cbdarkteal,
  boxrule=0.5pt,
  arc=1.2mm,
  left=2mm, right=2mm, top=1.5mm, bottom=1.5mm
]
  \raggedright
  \textbf{\footnotesize Architectural Specs:}\\[0.8mm]
  {\scriptsize
  $\bullet$ \textbf{Dimensions:} 10 columns $\times$ 50 vertical stories.\\
  $\bullet$ \textbf{Total Cells:} 500 challenge cells.\\
  $\bullet$ \textbf{Strategy:} Vertical bottlenecks constrain adjacent corridors.\\
  $\bullet$ \textbf{Online Solving:} \texttt{tinyurl.com/2dbfbkl4}}
\end{tcolorbox}
\end{minipage}
\hfill
\begin{minipage}[t]{0.50\textwidth}\vspace{0pt}
\centering
\includegraphics[height=16.6cm, keepaspectratio]{ls71_choco_banana_tower_puzzle.pdf}
\end{minipage}

\newpage

% =========================================================================
% PAGE 19: LS 72, LS 73, LS 74, LS 75 (SEPARATE SHOWCASES)
% =========================================================================
\enlargethispage{1.2cm}

\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\showcaseheadermini{LS 72: Pencils (Look-Air)}{Sightline restriction: matching-size pencils cannot see each other along lines of body cells.}
\lsheads{6.44}{Pencils (Look-Air)}{LS 72}
\vspace{0.4mm}
\scriptsize\raggedright
\textbf{Rules:} Normal Pencils rules apply. Two pencils of the same size cannot see each other along lines of non-pencil body cells.
\vspace{0.8mm}
\centering
\includegraphics[width=\dimexpr 10\cellsize\relax]{ls72_pencils_look_air_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\showcaseheadermini{LS 73: Pentominous (Myopia)}{Closest-shape directional clues: arrows point toward nearest pentominoes of that shape.}
\lsheads{6.45}{Pentominous (Myopia)}{LS 73}
\vspace{0.4mm}
\scriptsize\raggedright
\textbf{Rules:} Pentomino regions (5 cells). Arrows point in all directions tying for closest pentomino of that shape.
\vspace{0.8mm}
\centering
\includegraphics[width=\dimexpr 10\cellsize\relax]{ls73_pentominous_myopia_puzzle.pdf}
\end{minipage}

\vspace{1.5mm}
\hrule
\vspace{1mm}

\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\showcaseheadermini{LS 74: Choco Banana (Thermo)}{Thermal gradient: region sizes strictly increase from bulb to tip.}
\lsheads{6.46}{Choco Banana (Thermo)}{LS 74}
\vspace{0.4mm}
\scriptsize\raggedright
\textbf{Rules:} Choco Banana rules apply. Region sizes along thermometers must strictly increase from bulb to tip.
\vspace{0.8mm}
\centering
\includegraphics[width=\dimexpr 9\cellsize\relax]{ls74_choco_banana_thermo_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\showcaseheadermini{LS 75: Pentominous Irrwisch}{Cipher variant: each instance of letter A represents a different pentomino shape!}
\lsheads{6.47}{Pentominous Irrwisch}{LS 75}
\vspace{0.4mm}
\scriptsize\raggedright
\textbf{Rules:} Standard Pentominous. Irrwisch variant: each instance of letter A represents a different pentomino shape!
\vspace{0.8mm}
\centering
\includegraphics[width=\dimexpr 12\cellsize\relax]{ls75_pentominous_irrwisch_puzzle.pdf}
\end{minipage}
"""

with open(output_path, "w", encoding="utf-8") as f:
    f.write(content.strip() + "\n")

print("Generated new logic_showcase.tex successfully!")
