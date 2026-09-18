import fs from 'fs';

const outputPath = 'C:/Users/sakul_bp6myy0/OneDrive/Downloads/Puzzles/CB Puzzle Contest/2026/pb/logic_showcase.tex';

const texContent = `% =========================================================================
% CHAPTER 6: LOGIC SHOWCASE
% Official Showcase Collection: LS 49 to LS 75
% =========================================================================
\\newpage
\\fancyfoot[r]{\\footnotesize Logic Showcase}
\\thispagestyle{empty}

\\providecommand\\lshead[3]{%
\\phantomsection
\\addcontentsline{toc}{subsection}{#1. #2}%
\\noindent
\\begin{tblr}{
colspec={|X[1.2,c,m,blue7]|X[5,c,m]|X[2.2,c,m,blue7]|}, 
hline{1} = {1}{-}{solid}, 
hline{2} = {2}{-}{solid},
rows = {valign = m, abovesep=1.5pt, belowsep=1.5pt},
width = \\linewidth
}
\\SetCell{fg=white, font=\\bfseries} #1 & \\SetCell{font=\\bfseries} #2 & \\SetCell{fg=white, font=\\bfseries} #3
\\end{tblr}%
}

\\providecommand\\lsheads[3]{%
\\phantomsection
\\addcontentsline{toc}{subsection}{#1. #2}%
\\noindent
\\begin{tblr}{
colspec={|X[1.1,c,m,blue7]|X[3.8,c,m]|}, 
hline{1} = {1}{-}{solid}, 
hline{2} = {2}{-}{solid},
rows = {valign = m, abovesep=1pt, belowsep=1pt},
width = \\linewidth
}
\\SetCell{fg=white, font=\\footnotesize\\bfseries} #1 & \\SetCell{font=\\footnotesize\\bfseries} #2
\\end{tblr}%
}

% Showcase header tcolorbox definitions
\\newcommand{\\showcaseheader}[2]{%
  \\noindent
  \\begin{tcolorbox}[
    colback=cbdarkteal!7!white,
    colframe=cbdarkteal,
    boxrule=0.6pt,
    arc=1.5mm,
    left=2.5mm, right=2.5mm, top=1.6mm, bottom=1.6mm,
    boxsep=1pt
  ]
    {\\color{cbdarkteal}\\textbf{\\fontsize{9}{11}\\selectfont #1}}\\\\[0.6mm]
    {\\fontsize{7.5}{9.5}\\selectfont #2}
  \\end{tcolorbox}%
  \\vspace{1mm}%
}

\\newcommand{\\showcaseheadermini}[2]{%
  \\noindent
  \\begin{tcolorbox}[
    colback=cbdarkteal!7!white,
    colframe=cbdarkteal,
    boxrule=0.5pt,
    arc=1.2mm,
    left=2mm, right=2mm, top=1.2mm, bottom=1.2mm,
    boxsep=0.5pt
  ]
    {\\color{cbdarkteal}\\textbf{\\fontsize{8.5}{10.5}\\selectfont #1}}\\enspace---\\enspace{\\fontsize{7.5}{9.5}\\selectfont #2}
  \\end{tcolorbox}%
  \\vspace{1mm}%
}

\\markboth{Logic Showcase}{Logic Showcase}
\\phantomsection
\\addcontentsline{toc}{section}{Logic Showcase}

\\begin{center}
\\begin{tblr}{
colspec={X[1,blue4]X[1,blue6]X[1,blue8]X[24,c]X[1,blue8]X[1,blue6]X[1,blue4]}, 
hline{1} = {1}{-}{solid},
hline{2} = {2}{-}{solid},
rows = {m,14mm}
}
&&& \\SetCell{font=\\Large\\bfseries} Logic Showcase &&&
\\end{tblr}
\\end{center}

\\vspace{1mm}

\\begin{center}
\\begin{minipage}{0.96\\textwidth}
\\textbf{\\large Welcome to the Logic Showcase Exhibition!}

\\smallskip
\\small
The \\textbf{Logic Showcase} series serves as a laboratory for avant-garde pencil-and-paper logic puzzles. Ranging from \\textbf{LS 49} to \\textbf{LS 75}, this compendium gathers 47 innovative competition grids that blend traditional Nikoli mechanics with mind-bending new variants: inverted clue perspectives, dual-genre topologies, hybrid constraint systems, and arithmetic polyomino logic. 

Every grid in this collection has been handcrafted and rigorously verified to ensure a completely unique, deduction-only solving path.
\\end{minipage}
\\end{center}

\\vspace{3mm}

\\begin{table}[h!]
\\centering
\\small
\\begin{tblr}{
  colspec={Q[c,1.5cm]X[l]Q[c,1.5cm]X[l]},
  hlines, vlines,
  row{1} = {font=\\bfseries, bg=blue8, fg=white},
  row{even} = {bg=gray9}
}
Round & Featured Genres \\& Innovations & Round & Featured Genres \\& Innovations \\\\
LS 49 & Twilight Canal View, Twilight Kurodoko & LS 63 & Slitherlink (Full) + Turnaround (Full) \\\\
LS 50 & L-Voxas, L-Dots & LS 64 & Mirror Loop (Reflective Geometry) \\\\
LS 51 & Skyscrapers, Polygraph, Treasure Hunt & LS 65 & Reprising LS39: Tapa Rope \\\\
LS 52 & Foreshadow Crossing, Frozen Banana & LS 66 & Canal View (Disco) \\\\
LS 53 & Pentominous (Outside Clues) & LS 67 & Pentominous (Partial), CB (Inequality) \\\\
LS 54 & Guide Exit, Ice Walk (Delayed) & LS 68 & Pattern Square (Size \\& CTS) \\\\
LS 55 & Kurotto Banana, Disorderly Tapa Loop & LS 69 & Yajiring-ring (Rectangular Loops) \\\\
LS 57 & Instructionless Deduction & LS 70 & Alphabet Asp (Word Paths) \\\\
LS 58 & Pentomino Letter Grid Triad & LS 71 & Choco Banana 50-Story Tower \\\\
LS 59 & Territory, Choco Banana, Balance Loop & LS 72 & Pencils (Look-Air Sightlines) \\\\
LS 60 & Canal View \\& Masyu (Connected Unshaded) & LS 73 & Pentominous (Myopia Closest-Shape) \\\\
LS 61 & Contact, Rampage \\& Turnaround Omnibus & LS 74--75 & CB Thermo, Pentominous Irrwisch \\\\
\\end{tblr}
\\end{table}

\\vfill

\\begin{center}
\\footnotesize \\textit{All puzzles are equipped with digital solving links via Penpa+ and pzpr platforms.}
\\end{center}

\\newpage

% =========================================================================
% PAGE 2: LS 49
% =========================================================================

\\showcaseheader{LS 49: Twilight Inversions}{Inverted perspective deductions where shaded and unshaded cells swap classical roles in Canal View and diagonal-sightline Kurodoko.}

\\lshead{6.1}{Twilight Canal View}{LS 49}
\\vspace{1mm}

\\begin{minipage}[t]{0.56\\textwidth}
\\footnotesize
\\textbf{Rules:}
\\begin{itemize}
  \\setlength{\\itemsep}{1pt}
  \\item Shade some cells so that all shaded cells form an orthogonally connected area without $2\\times 2$ shaded squares.
  \\item An \\textbf{unshaded clue} indicates the number of shaded cells in a contiguous line starting from that cell in the four cardinal directions.
  \\item A \\textbf{shaded clue} indicates the number of unshaded cells in a contiguous line starting from that cell in the four cardinal directions.
\\end{itemize}
\\smallskip
\\centering
\\textbf{Example \\& Solution:}\\\\[1mm]
\\includegraphics[width=2.4cm]{ls49_twilight_canal_view_example.pdf}
\\hspace{3mm}
\\includegraphics[width=2.4cm]{ls49_twilight_canal_view_example_solution.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.42\\textwidth}
\\centering
\\textbf{Puzzle:}\\\\[1mm]
\\includegraphics[width=5.8cm]{ls49_twilight_canal_view_puzzle.pdf}
\\end{minipage}

\\vspace{3mm}
\\hrule
\\vspace{3mm}

\\lshead{6.2}{Twilight Kurodoko / Kurodoko (Diagonal)}{LS 49}
\\vspace{1mm}

\\begin{minipage}[t]{0.56\\textwidth}
\\footnotesize
\\textbf{Rules:}
\\begin{itemize}
  \\setlength{\\itemsep}{1pt}
  \\item Shade some cells so that all unshaded cells form an orthogonally connected area. Shaded cells cannot be orthogonally adjacent.
  \\item An \\textbf{unshaded clue} indicates the number of unshaded cells seen in a straight line vertically or horizontally, including itself.
  \\item A \\textbf{shaded clue} indicates the number of shaded cells seen in a straight line diagonally, including itself.
\\end{itemize}
\\smallskip
\\centering
\\textbf{Example \\& Solution:}\\\\[1mm]
\\includegraphics[width=2.4cm]{ls49_twilight_kurodoko_example.pdf}
\\hspace{3mm}
\\includegraphics[width=2.4cm]{ls49_twilight_kurodoko_example_solution.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.42\\textwidth}
\\centering
\\textbf{Puzzle:}\\\\[1mm]
\\includegraphics[width=5.8cm]{ls49_twilight_kurodoko_puzzle.pdf}
\\end{minipage}

\\newpage

% =========================================================================
% PAGE 3: LS 50
% =========================================================================

\\showcaseheader{LS 50: L-Polyomino Geometry}{Divide the grid into triomino and tetromino L-shapes governed by border dot constraints on relative size and orientation.}

\\lshead{6.3}{L-Voxas}{LS 50}
\\vspace{1mm}

\\begin{minipage}[t]{0.56\\textwidth}
\\footnotesize
\\textbf{Rules:} Divide the grid into regions of orthogonally connected cells.
\\begin{itemize}
  \\setlength{\\itemsep}{1pt}
  \\item Each region must be an L-shape with a width of 1 cell, and leg lengths of 2 or 3 cells. Borders must separate two different regions.
  \\item Borders with \\textbf{white dots} separate legs with the same size and orientation.
  \\item Borders with \\textbf{black dots} separate legs with neither the same size nor the same orientation.
  \\item Borders with \\textbf{grey dots} separate legs with either the same size or the same orientation, but not both. (For the corner cell, take the leg parallel to the border.)
\\end{itemize}
\\smallskip
\\centering
\\textbf{Example \\& Solution:}\\\\[1mm]
\\includegraphics[width=2.4cm]{ls50_l_voxas_example.pdf}
\\hspace{3mm}
\\includegraphics[width=2.4cm]{ls50_l_voxas_example_solution.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.42\\textwidth}
\\centering
\\textbf{Puzzle:}\\\\[1mm]
\\includegraphics[width=5.8cm]{ls50_l_voxas_puzzle.pdf}
\\end{minipage}

\\vspace{3mm}
\\hrule
\\vspace{3mm}

\\lshead{6.4}{L-Dots}{LS 50}
\\vspace{1mm}

\\begin{minipage}[t]{0.56\\textwidth}
\\footnotesize
\\textbf{Rules:} Divide the grid into regions of orthogonally connected cells.
\\begin{itemize}
  \\setlength{\\itemsep}{1pt}
  \\item Each region must be an L-shape with a width of 1 cell, and leg lengths of 2 or 3 cells. Borders separate different regions.
  \\item A \\textbf{white dot} in a region indicates that its corner cell is closer to the border than either of its endpoints.
  \\item A \\textbf{black dot} in a region indicates that both endpoints of the L-shape are strictly closer to the border than its corner cell.
\\end{itemize}
\\smallskip
\\centering
\\textbf{Example \\& Solution:}\\\\[1mm]
\\includegraphics[width=2.4cm]{ls50_l_dots_example.pdf}
\\hspace{3mm}
\\includegraphics[width=2.4cm]{ls50_l_dots_example_solution.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.42\\textwidth}
\\centering
\\textbf{Puzzle:}\\\\[1mm]
\\includegraphics[width=5.8cm]{ls50_l_dots_puzzle.pdf}
\\end{minipage}

\\newpage

% =========================================================================
% PAGE 4: LS 51 (Skyscrapers & Slitherlink Polygraph)
% =========================================================================

\\showcaseheader{LS 51: Triple Deduction Trials}{Experimental hybrids: candidate-arrow Skyscrapers, loop-boundary Slitherlink Polygraph, and coordinate-linked Treasure Hunt.}

\\lshead{6.5}{Skyscrapers (Candidate Arrows)}{LS 51}
\\vspace{1mm}

\\begin{minipage}[t]{0.52\\textwidth}
\\footnotesize
\\textbf{Rules:} Place numbers 1 to 6 (1 to 4 in example) into each cell so each row and column contains every number with no repeats. Clues represent visible buildings.
\\begin{itemize}
  \\setlength{\\itemsep}{1pt}
  \\item The four grids adjacent to the center represent possible clue candidates. Shade invalid candidates, unshade correct ones.
  \\item Shading a cell with an arrow requires shading the neighboring cell it points toward.
\\end{itemize}
\\smallskip
\\centering
\\textbf{Example \\& Solution:}\\\\[1mm]
\\includegraphics[width=2.2cm]{ls51_skyscrapers_example.pdf}
\\hspace{2mm}
\\includegraphics[width=2.2cm]{ls51_skyscrapers_example_solution.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.46\\textwidth}
\\centering
\\textbf{Puzzle:}\\\\[1mm]
\\includegraphics[width=6.6cm]{ls51_skyscrapers_puzzle.pdf}
\\end{minipage}

\\vspace{3mm}
\\hrule
\\vspace{3mm}

\\lshead{6.6}{Slitherlink (Polygraph)}{LS 51}
\\vspace{1mm}

\\begin{minipage}[t]{0.52\\textwidth}
\\footnotesize
\\textbf{Rules:} Connect adjacent dots to form a single non-intersecting loop.
\\begin{itemize}
  \\setlength{\\itemsep}{1pt}
  \\item Clues \\textbf{outside} the loop count \\textbf{used} edges surrounding the clue.
  \\item Clues \\textbf{inside} the loop count \\textbf{unused} edges surrounding the clue.
  \\item Some clues are hidden; shade cells inside the loop and unshade cells outside the loop to reveal them.
\\end{itemize}
\\smallskip
\\centering
\\textbf{Example \\& Solution:}\\\\[1mm]
\\includegraphics[width=2.2cm]{ls51_slitherlink_polygraph_example.pdf}
\\hspace{2mm}
\\includegraphics[width=2.2cm]{ls51_slitherlink_polygraph_example_solution.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.46\\textwidth}
\\centering
\\textbf{Puzzle:}\\\\[1mm]
\\includegraphics[width=6.0cm]{ls51_slitherlink_polygraph_puzzle.pdf}
\\end{minipage}

\\newpage

% =========================================================================
% PAGE 5: LS 51 (Treasure Hunt) & LS 52 (Foreshadow Crossing)
% =========================================================================

\\lshead{6.7}{Choco Banana Treasure Hunt}{LS 51}
\\vspace{1mm}

\\begin{minipage}[t]{0.50\\textwidth}
\\footnotesize
\\textbf{Rules:} Standard Choco Banana rules apply (shaded groups are rectangular; unshaded groups are non-rectangular; number clues give group sizes).
\\begin{itemize}
  \\setlength{\\itemsep}{1pt}
  \\item A region may contain letter clues. If it contains letters, it must contain exactly two: one uppercase and one lowercase.
  \\item Both letters form coordinates (outside the grid) of a number clue, which must match the shading status of the letter region.
\\end{itemize}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.48\\textwidth}
\\centering
\\includegraphics[width=6.4cm]{ls51_choco_banana_treasure_hunt_puzzle.pdf}
\\end{minipage}

\\vspace{3mm}
\\hrule
\\vspace{2mm}

\\showcaseheadermini{LS 52: Directed Loops \\& Thermal Shading}{Self-intersecting directed paths with distance clues and region-matching thermal traversal.}

\\lshead{6.8}{Foreshadow Crossing}{LS 52}
\\vspace{1mm}

\\begin{minipage}[t]{0.50\\textwidth}
\\footnotesize
\\textbf{Rules:} Draw a directed loop through the centers of some cells.
\\begin{itemize}
  \\setlength{\\itemsep}{1pt}
  \\item The loop may cross itself on an empty cell, but never on a clue cell.
  \\item No two crossings are orthogonally or diagonally adjacent.
  \\item Each clue must be on the loop and indicates the distance traveled along the loop to the next crossing.
\\end{itemize}
\\smallskip
\\centering
\\textbf{Example \\& Solution:}\\\\[1mm]
\\includegraphics[width=2.2cm]{ls52_foreshadow_crossing_example.pdf}
\\hspace{2mm}
\\includegraphics[width=2.2cm]{ls52_foreshadow_crossing_example_solution.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.48\\textwidth}
\\centering
\\includegraphics[width=5.8cm]{ls52_foreshadow_crossing_puzzle.pdf}
\\end{minipage}

\\newpage

% =========================================================================
% PAGE 6: LS 52 & LS 53
% =========================================================================

\\lshead{6.9}{Remembered Choco Frozen Banana}{LS 52}
\\vspace{1mm}

\\begin{minipage}[t]{0.52\\textwidth}
\\footnotesize
\\textbf{Rules:} Standard Choco Banana rules apply (shaded rectangular, unshaded non-rectangular; clues indicate group size).
\\begin{itemize}
  \\setlength{\\itemsep}{1pt}
  \\item In addition, draw a directed loop through ALL shaded cells and some unshaded cells.
  \\item The loop must go straight through unshaded cells. It may cross itself only on unshaded cells, never on shaded cells.
  \\item Each visit in a shaded region must have the exact same number of cells as the next visit (in an unshaded region) along the loop's direction.
\\end{itemize}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.46\\textwidth}
\\centering
\\includegraphics[width=5.8cm]{ls52_remembered_choco_frozen_banana_puzzle.pdf}
\\end{minipage}

\\vspace{3mm}
\\hrule
\\vspace{2mm}

\\showcaseheadermini{LS 53: Pentominous Outside Clues}{Classic 5-cell polyomino partitioning enhanced with ordered directional sightline clues.}

\\lshead{6.10}{Pentominous (Outside Clues)}{LS 53}
\\vspace{1mm}

\\begin{minipage}[t]{0.52\\textwidth}
\\footnotesize
\\textbf{Rules:} Divide the grid into regions of 5 orthogonally connected cells (pentominoes) so no two regions of the same shape share an edge, counting rotations and reflections as identical.
\\begin{itemize}
  \\setlength{\\itemsep}{1pt}
  \\item Outside clues describe all letters of pentomino shapes in that row or column, in order.
  \\item A question mark (?) represents one letter. An asterisk (*) represents any number of letters (including zero).
\\end{itemize}
\\smallskip
\\centering
\\textbf{Example \\& Solution:}\\\\[1mm]
\\includegraphics[width=2.2cm]{ls53_pentominous_outside_example.pdf}
\\hspace{2mm}
\\includegraphics[width=2.2cm]{ls53_pentominous_outside_example_solution.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.46\\textwidth}
\\centering
\\includegraphics[width=6.0cm]{ls53_pentominous_outside_puzzle.pdf}
\\end{minipage}

\\newpage

% =========================================================================
% PAGE 7: LS 54
% =========================================================================

\\showcaseheader{LS 54: Directional Paths \\& Frictionless Ice}{Diagonal path vectors in Guide Exit and straight inertia runs across frictionless icy cells in Ice Walk Delayed.}

\\lshead{6.11}{Guide Exit}{LS 54}
\\vspace{1mm}

\\begin{minipage}[t]{0.52\\textwidth}
\\footnotesize
\\textbf{Rules:} Shade some cells so no two shaded cells are orthogonally adjacent and unshaded cells form one connected area with no unshaded loops (including $2\\times 2$).
\\begin{itemize}
  \\setlength{\\itemsep}{1pt}
  \\item Each clue must be shaded.
  \\item It indicates that in that many cells on the unique path of diagonally connected shaded cells from the clue toward the border, the next shaded cell on the path is in the arrow's direction.
\\end{itemize}
\\smallskip
\\centering
\\textbf{Example \\& Solution:}\\\\[1mm]
\\includegraphics[width=2.3cm]{ls54_guide_exit_example.pdf}
\\hspace{2mm}
\\includegraphics[width=2.3cm]{ls54_guide_exit_example_solution.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.46\\textwidth}
\\centering
\\textbf{Puzzle:}\\\\[1mm]
\\includegraphics[width=6.0cm]{ls54_guide_exit_puzzle.pdf}
\\end{minipage}

\\vspace{3mm}
\\hrule
\\vspace{3mm}

\\lshead{6.12}{Ice Walk (Delayed)}{LS 54}
\\vspace{1mm}

\\begin{minipage}[t]{0.52\\textwidth}
\\footnotesize
\\textbf{Rules:} Draw an oriented loop through cell centers visiting each numbered cell.
\\begin{itemize}
  \\setlength{\\itemsep}{1pt}
  \\item Two perpendicular segments may intersect only on icy cells, without turning at intersections or overlapping.
  \\item The loop may not turn on icy cells.
  \\item A number indicates how many cells make up the continuous non-icy section of the loop after it enters and exits the next continuous icy-cell(s) along the loop.
\\end{itemize}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.46\\textwidth}
\\centering
\\includegraphics[width=6.0cm]{ls54_ice_walk_delayed_puzzle.pdf}
\\end{minipage}

\\newpage

% =========================================================================
% PAGE 8: LS 55 & LS 57
% =========================================================================

\\showcaseheader{LS 55: Kurotto Banana \\& Disorderly Loops}{Choco Banana's rectangular chocolate meets Kurotto cell-sum clues, paired with a directionless Tapa loop.}

\\begin{minipage}[t]{0.48\\textwidth}
\\lshead{6.13}{Kurotto Banana}{LS 55}
\\vspace{1mm}
\\footnotesize
\\textbf{Rules:} Standard Choco Banana rules apply (shaded rectangular, unshaded non-rectangular; clues indicate group size). Circles with numbers follow \\textbf{Kurotto}: clue indicates the sum of sizes of shaded groups horizontally or vertically adjacent to the circle.
\\vspace{1mm}
\\centering
\\includegraphics[width=5.4cm]{ls55_kurotto_banana_puzzle.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.48\\textwidth}
\\lshead{6.14}{Disorderly Tapa Loop}{LS 55}
\\vspace{1mm}
\\footnotesize
\\textbf{Rules:} Draw a non-intersecting loop through centers of empty cells. Clues represent lengths of consecutive loop segments in the 8 surrounding cells (Tapa-like), but the direction of clue blocks is not given (Disorderly).
\\vspace{1mm}
\\centering
\\includegraphics[width=5.4cm]{ls55_disorderly_tapa_like_loop_puzzle.pdf}
\\end{minipage}

\\vspace{3mm}
\\hrule
\\vspace{2mm}

\\showcaseheadermini{LS 57: Instructionless Deduction}{Zero written rules: decipher the governing logic system solely from clues and topological consistency.}

\\lshead{6.15}{Instructionless Deduction}{LS 57}
\\vspace{1mm}

\\begin{minipage}[t]{0.48\\textwidth}
\\footnotesize
\\textbf{Rules:} No rules are provided! Solvers must deduce the entire rule set and genre mechanics from the clues, grid structures, and deductive interactions.
\\smallskip
\\begin{center}
\\textit{Hint: Observe the symmetrical placements and numerical clue values. Multiple interacting constraints govern the grid!}
\\end{center}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.48\\textwidth}
\\centering
\\includegraphics[width=6.0cm]{ls57_instructionless_puzzle.pdf}
\\end{minipage}

\\newpage

% =========================================================================
% PAGE 9: LS 58 (Pentomino Triad)
% =========================================================================

\\showcaseheader{LS 58: Pentomino Letter Grid Triad}{A thematic triptych of 5-cell region divisions under strict non-touching geometric constraints.}

\\begin{minipage}[t]{0.31\\textwidth}
\\lshead{6.16}{Triad I}{LS 58}
\\vspace{1mm}
\\footnotesize
Divide grid into pentominoes (5 cells). Identical shapes cannot share an edge (rotations/reflections identical). Clued cells belong to regions with that shape.
\\vspace{1mm}
\\centering
\\includegraphics[width=4.4cm]{ls58_puzzle_1_puzzle.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.31\\textwidth}
\\lshead{6.17}{Triad II}{LS 58}
\\vspace{1mm}
\\footnotesize
Divide grid into pentominoes (5 cells). Identical shapes cannot share an edge. Clued cells belong to regions with that letter's shape.
\\vspace{1mm}
\\centering
\\includegraphics[width=4.4cm]{ls58_puzzle_2_puzzle.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.31\\textwidth}
\\lshead{6.18}{Triad III}{LS 58}
\\vspace{1mm}
\\footnotesize
Divide grid into pentominoes (5 cells). Identical shapes cannot share an edge. Clued cells belong to regions with that letter's shape.
\\vspace{1mm}
\\centering
\\includegraphics[width=4.4cm]{ls58_puzzle_3_puzzle.pdf}
\\end{minipage}

\\newpage

% =========================================================================
% PAGE 10: LS 59 (One Square Series)
% =========================================================================

\\showcaseheader{LS 59: The One Square Series}{Each grid conceals exactly one unshaded square among rectangular fields and balance loops.}

\\begin{minipage}[t]{0.31\\textwidth}
\\lshead{6.19}{Territory (One Sq)}{LS 59}
\\vspace{1mm}
\\footnotesize
\\textbf{Rules:} Shade cells (no adjacent shaded). Unshaded form one connected area. Clues cannot be shaded and give the size of the largest unshaded rectangle overlapping them. Exactly ONE clue gives the size of the largest unshaded square.
\\vspace{1mm}
\\centering
\\includegraphics[width=4.6cm]{ls59_territory_one_square_puzzle.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.31\\textwidth}
\\lshead{6.20}{Choco Banana (One Sq)}{LS 59}
\\vspace{1mm}
\\footnotesize
\\textbf{Rules:} Standard Choco Banana rules apply (shaded rectangular, unshaded non-rectangular; clues indicate group size). In addition, exactly ONE unshaded clue in the entire grid represents an unshaded square.
\\vspace{1mm}
\\centering
\\includegraphics[width=4.6cm]{ls59_choco_banana_one_square_puzzle.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.31\\textwidth}
\\lshead{6.21}{Balance Loop}{LS 59}
\\vspace{1mm}
\\footnotesize
\\textbf{Rules:} Draw a single non-intersecting loop through cell centers. Standard Balance Loop rules apply. Exactly one white circle clue is hidden and must be deduced.
\\vspace{1mm}
\\centering
\\includegraphics[width=4.6cm]{ls59_balance_loop_hidden_white_puzzle.pdf}
\\end{minipage}

\\newpage

% =========================================================================
% PAGE 11: LS 60 & LS 61 (Connected & Contact)
% =========================================================================

\\showcaseheader{LS 60: Connected Unshaded Topology}{Canal View and Masyu mechanics augmented with a global connectivity condition for all unshaded cells.}

\\begin{minipage}[t]{0.48\\textwidth}
\\lshead{6.22}{Canal View (Connected)}{LS 60}
\\vspace{1mm}
\\footnotesize
\\textbf{Rules:} Classic Canal View rules apply (shaded connected, no $2\\times 2$). Unshaded clues count shaded cells in orthogonal lines. \\textbf{Global condition:} all unshaded cells must form one orthogonally connected region.
\\vspace{1mm}
\\centering
\\includegraphics[width=5.2cm]{ls60_canal_view_connected_puzzle.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.48\\textwidth}
\\lshead{6.23}{Masyu (Connected)}{LS 60}
\\vspace{1mm}
\\footnotesize
\\textbf{Rules:} Draw a non-intersecting loop through circles. White circles: straight, turn in next cell. Black circles: turn, straight for 2 cells. \\textbf{Global condition:} all unshaded (unused) cells must form one connected region.
\\vspace{1mm}
\\centering
\\includegraphics[width=5.2cm]{ls60_masyu_connected_puzzle.pdf}
\\end{minipage}

\\vspace{3mm}
\\hrule
\\vspace{2mm}

\\showcaseheadermini{LS 61: The Contact \\& Rampage Omnibus}{High-octane miniatures: symbolic Contact matching, boundary-hugging Rampage circuits, and turn-counting loops.}

\\begin{minipage}[t]{0.48\\textwidth}
\\lshead{6.24}{Contact ``Equal Sign''}{LS 61}
\\vspace{1mm}
\\footnotesize
\\textbf{Rules:} Draw a loop through cell centers. The loop must touch every ``='' symbol horizontally or vertically as specified by the clue orientation.
\\vspace{1mm}
\\centering
\\includegraphics[width=4.8cm]{ls61_contact_equal_sign_puzzle.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.48\\textwidth}
\\lshead{6.25}{Contact ``Plus''}{LS 61}
\\vspace{1mm}
\\footnotesize
\\textbf{Rules:} Draw a loop through cell centers. The loop must make orthogonal contacts with every ``+'' symbol across the grid according to Contact rules.
\\vspace{1mm}
\\centering
\\includegraphics[width=4.8cm]{ls61_contact_plus_puzzle.pdf}
\\end{minipage}

\\newpage

% =========================================================================
% PAGE 12: LS 61 (Contact Lenses & Rampage Series)
% =========================================================================

\\begin{minipage}[t]{0.48\\textwidth}
\\lshead{6.26}{Contact ``Lenses''}{LS 61}
\\vspace{1mm}
\\footnotesize
\\textbf{Rules:} Draw a loop visiting contact lens markers. The loop must correctly make contact with adjacent clues while avoiding self-intersections.
\\vspace{1mm}
\\centering
\\includegraphics[width=5.0cm]{ls61_contact_lenses_puzzle.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.48\\textwidth}
\\lshead{6.27}{Rampage ``Tilted Square''}{LS 61}
\\vspace{1mm}
\\footnotesize
\\textbf{Rules:} Draw a non-intersecting loop along grid lines visiting borders and vertices. Follow Rampage rules: segments must trace indicated geometric turns.
\\vspace{1mm}
\\centering
\\includegraphics[width=5.0cm]{ls61_rampage_tilted_square_puzzle.pdf}
\\end{minipage}

\\vspace{3mm}
\\hrule
\\vspace{3mm}

\\begin{minipage}[t]{0.48\\textwidth}
\\lshead{6.28}{Rampage ``Ox Loops''}{LS 61}
\\vspace{1mm}
\\footnotesize
\\textbf{Rules:} Draw a closed loop along grid lines. Numbers indicate consecutive edges used around clue vertices.
\\vspace{1mm}
\\centering
\\includegraphics[width=5.0cm]{ls61_rampage_ox_loops_puzzle.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.48\\textwidth}
\\lshead{6.29}{Rampage ``Roadblocks''}{LS 61}
\\vspace{1mm}
\\footnotesize
\\textbf{Rules:} Draw a loop navigating past shaded roadblocks and clue markers under standard Rampage loop constraints.
\\vspace{1mm}
\\centering
\\includegraphics[width=5.0cm]{ls61_rampage_roadblocks_puzzle.pdf}
\\end{minipage}

\\newpage

% =========================================================================
% PAGE 13: LS 61 (Turnaround) & LS 63 (Dual Full)
% =========================================================================

\\begin{minipage}[t]{0.31\\textwidth}
\\lsheads{6.30}{Turnaround Spiral}{LS 61}
\\vspace{1mm}
\\footnotesize
Center loop turns match clues.
\\vspace{1mm}
\\centering
\\includegraphics[width=4.0cm]{ls61_turnaround_spiral_puzzle.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.31\\textwidth}
\\lsheads{6.31}{Turnaround 9$\\times$9}{LS 61}
\\vspace{1mm}
\\footnotesize
Loop visits every cell center.
\\vspace{1mm}
\\centering
\\includegraphics[width=4.4cm]{ls61_turnaround_9x9_puzzle.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.31\\textwidth}
\\lsheads{6.32}{Turnaround 12$\\times$12}{LS 61}
\\vspace{1mm}
\\footnotesize
Full $12\\times 12$ loop traversal.
\\vspace{1mm}
\\centering
\\includegraphics[width=4.6cm]{ls61_turnaround_12x12_puzzle.pdf}
\\end{minipage}

\\vspace{4mm}
\\hrule
\\vspace{2mm}

\\showcaseheadermini{LS 63: Dual Genre Partitioning}{Partition a grid into two territories: one as Slitherlink (Full) and the other as Turnaround (Full).}

\\lshead{6.33}{Slitherlink (Full) + Turnaround (Full)}{LS 63}
\\vspace{1mm}

\\begin{minipage}[t]{0.54\\textwidth}
\\footnotesize
\\textbf{Rules:} Divide the grid into two regions of orthogonally connected cells. Solve one region as \\textbf{Slitherlink (Full)} (a single non-intersecting loop that visits ALL dots) and the other as \\textbf{Turnaround (Full)} (a loop through centers of ALL cells; clues count turns in the 3-cell window).
\\smallskip
\\centering
\\textbf{Example \\& Solution:}\\\\[1mm]
\\includegraphics[width=2.5cm]{ls63_slitherlink_turnaround_full_example.pdf}
\\hspace{2mm}
\\includegraphics[width=2.5cm]{ls63_slitherlink_turnaround_full_example_solution.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.44\\textwidth}
\\centering
\\textbf{Puzzle:}\\\\[1mm]
\\includegraphics[width=5.5cm]{ls63_slitherlink_turnaround_full_puzzle.pdf}
\\end{minipage}

\\newpage

% =========================================================================
% PAGE 14: LS 64, LS 65, LS 66
% =========================================================================

\\showcaseheader{LS 64: Reflective Geometry}{Laser-like loop paths bouncing across double-sided blue mirror lines across the grid.}

\\lshead{6.34}{Mirror Loop}{LS 64}
\\vspace{1mm}

\\begin{minipage}[t]{0.48\\textwidth}
\\footnotesize
\\textbf{Rules:} Draw a non-intersecting loop through cell centers. The blue edges are mirrors reflecting loop segments across to the other side up to the nearest border or mirror. Every mirror must reflect at least one loop segment. The loop may pass through a mirror.
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.50\\textwidth}
\\centering
\\includegraphics[width=5.4cm]{ls64_mirror_loop_puzzle.pdf}
\\end{minipage}

\\vspace{3mm}
\\hrule
\\vspace{2mm}

\\showcaseheadermini{LS 65: Co-op Classics \\& Tapa Rope}{Sequential rope-attached clue blocks dictate contiguous shaded segments along twisting paths.}

\\lshead{6.35}{Reprising LS39: Tapa Rope}{LS 65}
\\vspace{1mm}

\\begin{minipage}[t]{0.48\\textwidth}
\\footnotesize
\\textbf{Rules:} Shade cells so all shaded cells form one connected area without $2\\times 2$ shaded squares. Clues cannot be shaded and indicate the lengths of consecutive shaded blocks along the length of rope attached to the clue.
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.50\\textwidth}
\\centering
\\includegraphics[width=5.6cm]{ls65_tapa_rope_puzzle.pdf}
\\end{minipage}

\\vspace{3mm}
\\hrule
\\vspace{2mm}

\\showcaseheadermini{LS 66: Canal View Disco}{Canal View line-of-sight shading where each room must contain exactly two separated shaded islands.}

\\lshead{6.36}{Canal View (Disco)}{LS 66}
\\vspace{1mm}

\\begin{minipage}[t]{0.48\\textwidth}
\\footnotesize
\\textbf{Rules:} Canal View rules apply (shaded connected, no $2\\times 2$). Clues cannot be shaded and count shaded cells in orthogonal lines. A question mark (?) is an unknown positive number. In addition, each bold region contains exactly two separate connected shaded groups.
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.50\\textwidth}
\\centering
\\includegraphics[width=5.6cm]{ls66_canal_view_disco_puzzle.pdf}
\\end{minipage}

\\newpage

% =========================================================================
% PAGE 15: LS 67 & LS 68
% =========================================================================

\\showcaseheader{LS 67: Partial Pentominous \\& CB Inequality}{Sub-region shape containment in Pentominous, coupled with strict relational inequalities in Choco Banana.}

\\begin{minipage}[t]{0.48\\textwidth}
\\lshead{6.37}{Pentominous (Partial)}{LS 67}
\\vspace{1mm}
\\footnotesize
\\textbf{Rules:} Divide grid into pentominoes (5 cells each; identical shapes cannot touch). Clued cells belong to a pentomino region that the clued shape can fit inside without rotating/reflecting.
\\vspace{1mm}
\\centering
\\includegraphics[width=5.4cm]{ls67_pentominous_partial_puzzle.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.48\\textwidth}
\\lshead{6.38}{Choco Banana (Inequality)}{LS 67}
\\vspace{1mm}
\\footnotesize
\\textbf{Rules:} Standard Choco Banana rules apply (shaded rectangular, unshaded non-rectangular). Region sizes must strictly obey all inequality symbols between neighboring clues.
\\vspace{1mm}
\\centering
\\includegraphics[width=5.4cm]{ls67_choco_banana_inequality_puzzle.pdf}
\\end{minipage}

\\vspace{3mm}
\\hrule
\\vspace{2mm}

\\showcaseheadermini{LS 68: Pattern Square Permutations}{Each row and column of 2x2 blocks contains all six unique shading patterns without repeats.}

\\begin{minipage}[t]{0.48\\textwidth}
\\lshead{6.39}{Pattern Square (Size)}{LS 68}
\\vspace{1mm}
\\footnotesize
\\textbf{Rules:} Shade cells so each of six $2\\times 2$ shading patterns (or rotations) appears once per row/column of $2\\times 2$ bold regions. Clues are shaded and indicate group size.
\\vspace{1mm}
\\centering
\\includegraphics[width=5.5cm]{ls68_pattern_square_size_puzzle.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.48\\textwidth}
\\lshead{6.40}{Pattern Square (CTS)}{LS 68}
\\vspace{1mm}
\\footnotesize
\\textbf{Rules:} Shade cells so each of six $2\\times 2$ patterns appears once per row/column of bold regions. Outside clues give consecutive shaded run lengths in order (? = 1 block; * = any blocks).
\\vspace{1mm}
\\centering
\\includegraphics[width=5.5cm]{ls68_pattern_square_cts_puzzle.pdf}
\\end{minipage}

\\newpage

% =========================================================================
% PAGE 16: LS 69 & LS 70
% =========================================================================

\\showcaseheader{LS 69: Yajiring-ring}{Intersecting rectangular loop networks weaving through empty space without turning at crossings.}

\\lshead{6.41}{Yajiring-ring}{LS 69}
\\vspace{1mm}

\\begin{minipage}[t]{0.48\\textwidth}
\\footnotesize
\\textbf{Rules:} Shade some cells so no two shaded cells are orthogonally adjacent.
\\begin{itemize}
  \\setlength{\\itemsep}{1pt}
  \\item Draw rectangular loops through centers of empty cells so every empty cell is used.
  \\item Clues cannot be shaded and count shaded cells in that direction.
  \\item Sides of different rectangles may cross, but cannot turn at crossings or overlap.
\\end{itemize}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.50\\textwidth}
\\centering
\\includegraphics[width=5.6cm]{ls69_yajiring_ring_puzzle.pdf}
\\end{minipage}

\\vspace{3mm}
\\hrule
\\vspace{2mm}

\\showcaseheadermini{LS 70: Alphabet Asp}{Linguistic snake paths forming a complete lexicon of given words regulated by directional barriers.}

\\lshead{6.42}{Alphabet Asp}{LS 70}
\\vspace{1mm}

\\begin{minipage}[t]{0.48\\textwidth}
\\footnotesize
\\textbf{Rules:} Place letters into empty cells such that each connected group forms a given word.
\\begin{itemize}
  \\setlength{\\itemsep}{1pt}
  \\item Different words may not share an edge. All words appear exactly once.
  \\item Clues give the first letter seen in that direction. Clues block line of sight.
  \\item Each letter cannot see itself in another word unless blocked by a clue.
\\end{itemize}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.50\\textwidth}
\\centering
\\includegraphics[width=5.6cm]{ls70_alphabet_asp_puzzle.pdf}
\\end{minipage}

\\newpage

% =========================================================================
% PAGE 17: LS 71 (Choco Banana Tower)
% Architectural Showcase Page
% =========================================================================

\\showcaseheader{LS 71: Choco Banana 50-Story Tower}{The 50-Story Monolith: Scale 50 vertical stories of pure deduction! Balance rectangular chocolate blocks against irregular banana corridors from the ground floor to the summit.}

\\lshead{6.43}{Choco Banana Tower}{LS 71}
\\vspace{2mm}

\\begin{minipage}[t]{0.44\\textwidth}
\\footnotesize
\\textbf{Tower Construction Rules:}
\\begin{itemize}
  \\setlength{\\itemsep}{3pt}
  \\item Shade some cells so that all areas of orthogonally connected shaded cells are \\textbf{rectangular} (chocolate blocks).
  \\item All areas of orthogonally connected unshaded cells are \\textbf{non-rectangular} (banana corridors).
  \\item A number clue represents the exact size of its orthogonally connected group of shaded or unshaded cells.
\\end{itemize}

\\vspace{3mm}

\\begin{tcolorbox}[
  colback=cbdarkteal!8!white,
  colframe=cbdarkteal,
  boxrule=0.6pt,
  arc=1.5mm,
  left=3mm, right=3mm, top=2.5mm, bottom=2.5mm
]
  \\textbf{\\footnotesize Architectural Specifications:}\\\\[1.5mm]
  {\\scriptsize
  $\\bullet$ \\textbf{Dimensions:} $10$ columns $\\times 50$ vertical stories.\\\\
  $\\bullet$ \\textbf{Total Cells:} 500 challenge cells.\\\\
  $\\bullet$ \\textbf{Deduction Strategy:} Look for vertical bottlenecks where tall blocks constrain adjacent corridors.\\\\
  $\\bullet$ \\textbf{Online Solving:} \\texttt{tinyurl.com/2dbfbkl4}}
\\end{tcolorbox}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.52\\textwidth}
\\centering
\\includegraphics[height=21.0cm, keepaspectratio]{ls71_choco_banana_tower_puzzle.pdf}
\\end{minipage}

\\newpage

% =========================================================================
% PAGE 18: LS 72 to LS 75 (Grand Finale)
% =========================================================================

\\showcaseheadermini{LS 72: Pencils (Look-Air)}{Sightline non-visibility constraint between equal-sized pencils.}

\\begin{minipage}[t]{0.48\\textwidth}
\\lsheads{6.44}{Pencils (Look-Air)}{LS 72}
\\vspace{0.5mm}
\\scriptsize
\\textbf{Rules:} Normal Pencils rules apply. Two pencils of the same size cannot see each other along lines of non-pencil cells.
\\vspace{0.5mm}
\\centering
\\includegraphics[width=4.6cm]{ls72_pencils_look_air_puzzle.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.48\\textwidth}
\\showcaseheadermini{LS 73: Pentominous Myopia}{Arrows indicate orthogonal pathways to closest pentomino.}
\\lsheads{6.45}{Pentominous (Myopia)}{LS 73}
\\vspace{0.5mm}
\\scriptsize
\\textbf{Rules:} Pentomino regions (5 cells). Arrows point in all directions tying for closest pentomino of that shape.
\\vspace{0.5mm}
\\centering
\\includegraphics[width=4.6cm]{ls73_pentominous_myopia_puzzle.pdf}
\\end{minipage}

\\vspace{2mm}
\\hrule
\\vspace{1.5mm}

\\showcaseheadermini{LS 74: Choco Banana Thermo}{Region sizes strictly increase along thermometers.}

\\begin{minipage}[t]{0.48\\textwidth}
\\lsheads{6.46}{Choco Banana (Thermo)}{LS 74}
\\vspace{0.5mm}
\\scriptsize
\\textbf{Rules:} Choco Banana rules apply. Region sizes along thermometers must strictly increase from bulb to tip.
\\vspace{0.5mm}
\\centering
\\includegraphics[width=4.6cm]{ls74_choco_banana_thermo_puzzle.pdf}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.48\\textwidth}
\\showcaseheadermini{LS 75: Pentominous Irrwisch}{Grand Finale cipher: each clue letter 'A' is a distinct shape.}
\\lsheads{6.47}{Pentominous Irrwisch}{LS 75}
\\vspace{0.5mm}
\\scriptsize
\\textbf{Rules:} Standard Pentominous. Irrwisch variant: each instance of letter ``A'' represents a different pentomino shape!
\\vspace{0.5mm}
\\centering
\\includegraphics[width=4.6cm]{ls75_pentominous_irrwisch_puzzle.pdf}
\\end{minipage}
`;

fs.writeFileSync(outputPath, texContent, 'utf8');
console.log('Successfully written pristine updated logic_showcase.tex!');
