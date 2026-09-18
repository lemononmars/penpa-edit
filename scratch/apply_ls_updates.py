import os
import re

tex_path = r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\logic_showcase.tex"

with open(tex_path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Remove all \textbf{Puzzle (...)}\\[1mm]
p_pattern = r'\\textbf\{Puzzle\s*\([^\)]+\)\}\\\\\[[0-9]+mm\]\s*'
text, count = re.subn(p_pattern, '', text)
print(f"Removed {count} occurrences of 'Puzzle (...)'")

# 2. 6.24-26 in the same line on Page 12
old_contact_page12 = r"""\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\lshead{6.24}{Contact ``Equal Sign''}
\vspace{1mm}
\centering
\includegraphics[valign=t, width=\dimexpr 6\cellsizeM\relax]{ls61_contact_equal_sign_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\lshead{6.25}{Contact ``Plus''}
\vspace{1mm}
\centering
\includegraphics[valign=t, width=\dimexpr 8\cellsizeM\relax]{ls61_contact_plus_puzzle.pdf}
\end{minipage}"""

new_contact_page12 = r"""\begin{minipage}[t]{0.31\textwidth}\vspace{0pt}
\lsheadmini{6.24}{Contact ``Equal Sign''}
\vspace{1mm}
\centering
\includegraphics[valign=t, width=\dimexpr 6\cellsizeM\relax]{ls61_contact_equal_sign_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.33\textwidth}\vspace{0pt}
\lsheadmini{6.25}{Contact ``Plus''}
\vspace{1mm}
\centering
\includegraphics[valign=t, width=\dimexpr 8\cellsizeM\relax]{ls61_contact_plus_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.33\textwidth}\vspace{0pt}
\lsheadmini{6.26}{Contact ``Lenses''}
\vspace{1mm}
\centering
\includegraphics[valign=t, width=\dimexpr 8\cellsizeM\relax]{ls61_contact_lenses_puzzle.pdf}
\end{minipage}"""

if old_contact_page12 in text:
    text = text.replace(old_contact_page12, new_contact_page12)
    print("Updated 6.24-6.26 to same line on Page 12")
else:
    print("Warning: old_contact_page12 not found!")

# 3. Page 13: Remove 6.26 from Page 13 top and put 6.27-29 in the same line
old_page13_content = r"""\enlargethispage{1.5cm}
\lshead{6.26}{Contact ``Lenses''}
\begin{center}
\includegraphics[valign=t, width=\dimexpr 8\cellsizeM\relax]{ls61_contact_lenses_puzzle.pdf}
\end{center}

\vspace{2mm}
\hrule
\vspace{2mm}

\showcaseheadermini{LS 61: Rampage Loop Series}{Bulls bursting through domino boundaries along linear trajectories.}

\noindent
\begin{tcolorbox}[colback=blue7!6, colframe=blue7, boxrule=0.8pt, arc=1.2mm, left=3mm, right=3mm, top=1.8mm, bottom=1.8mm]
\small\raggedright
\textbf{Rules (Rampage Loop):}
Divide the grid into dominoes. Each number represents a rampaging bull: the bull starts in its domino, moves to the other cell of the domino, then breaks through the opposite short edge into a new domino, and repeats. The number indicates how many dominoes the bull passes through. If the bull never leaves the grid, the number is infinity ($\infty$).
\end{tcolorbox}

\vspace{2mm}

\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\lshead{6.27}{Rampage ``Tilted Square''}
\vspace{1mm}
\centering
\includegraphics[valign=t, width=\dimexpr 8\cellsizeM\relax]{ls61_rampage_tilted_square_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}\vspace{0pt}
\lshead{6.28}{Rampage ``Ox Loops''}
\vspace{1mm}
\centering
\includegraphics[valign=t, width=\dimexpr 8\cellsizeM\relax]{ls61_rampage_ox_loops_puzzle.pdf}
\end{minipage}

\vspace{3mm}

\begin{center}
\begin{minipage}{0.48\textwidth}
\lshead{6.29}{Rampage ``Roadblocks''}
\vspace{1mm}
\centering
\includegraphics[valign=t, width=\dimexpr 8\cellsizeM\relax]{ls61_rampage_roadblocks_puzzle.pdf}
\end{minipage}
\end{center}"""

new_page13_content = r"""\enlargethispage{1.5cm}
\showcaseheadermini{LS 61: Rampage Loop Series}{Bulls bursting through domino boundaries along linear trajectories.}

\noindent
\begin{tcolorbox}[colback=blue7!6, colframe=blue7, boxrule=0.8pt, arc=1.2mm, left=3mm, right=3mm, top=1.8mm, bottom=1.8mm]
\small\raggedright
\textbf{Rules (Rampage Loop):}
Divide the grid into dominoes. Each number represents a rampaging bull: the bull starts in its domino, moves to the other cell of the domino, then breaks through the opposite short edge into a new domino, and repeats. The number indicates how many dominoes the bull passes through. If the bull never leaves the grid, the number is infinity ($\infty$).
\end{tcolorbox}

\vspace{2mm}

\begin{minipage}[t]{0.32\textwidth}\vspace{0pt}
\lsheadmini{6.27}{Rampage ``Tilted Square''}
\vspace{1mm}
\centering
\includegraphics[valign=t, width=\dimexpr 8\cellsizeM\relax]{ls61_rampage_tilted_square_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.32\textwidth}\vspace{0pt}
\lsheadmini{6.28}{Rampage ``Ox Loops''}
\vspace{1mm}
\centering
\includegraphics[valign=t, width=\dimexpr 8\cellsizeM\relax]{ls61_rampage_ox_loops_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.32\textwidth}\vspace{0pt}
\lsheadmini{6.29}{Rampage ``Roadblocks''}
\vspace{1mm}
\centering
\includegraphics[valign=t, width=\dimexpr 8\cellsizeM\relax]{ls61_rampage_roadblocks_puzzle.pdf}
\end{minipage}"""

if old_page13_content in text:
    text = text.replace(old_page13_content, new_page13_content)
    print("Updated Page 13: Rampage 6.27-29 in same line")
else:
    print("Warning: old_page13_content not found!")

# 4. 6.30-32 titles to "Turnaround"
old_turnaround = r"""\begin{minipage}[t]{0.245\textwidth}\vspace{0pt}
\lsheadmini{6.30}{Spiral (7$\times$7)}
\vspace{1mm}
\centering
\includegraphics[valign=t, width=\dimexpr 7\cellsizeM\relax]{ls61_turnaround_spiral_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.32\textwidth}\vspace{0pt}
\lsheadmini{6.31}{9$\times$9 Grid}
\vspace{1mm}
\centering
\includegraphics[valign=t, width=\dimexpr 9\cellsizeM\relax]{ls61_turnaround_9x9_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.42\textwidth}\vspace{0pt}
\lsheadmini{6.32}{12$\times$12 Grid}
\vspace{1mm}
\centering
\includegraphics[valign=t, width=\dimexpr 12\cellsizeM\relax]{ls61_turnaround_12x12_puzzle.pdf}
\end{minipage}"""

new_turnaround = r"""\begin{minipage}[t]{0.245\textwidth}\vspace{0pt}
\lsheadmini{6.30}{Turnaround}
\vspace{1mm}
\centering
\includegraphics[valign=t, width=\dimexpr 7\cellsizeM\relax]{ls61_turnaround_spiral_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.32\textwidth}\vspace{0pt}
\lsheadmini{6.31}{Turnaround}
\vspace{1mm}
\centering
\includegraphics[valign=t, width=\dimexpr 9\cellsizeM\relax]{ls61_turnaround_9x9_puzzle.pdf}
\end{minipage}
\hfill
\begin{minipage}[t]{0.42\textwidth}\vspace{0pt}
\lsheadmini{6.32}{Turnaround}
\vspace{1mm}
\centering
\includegraphics[valign=t, width=\dimexpr 12\cellsizeM\relax]{ls61_turnaround_12x12_puzzle.pdf}
\end{minipage}"""

if old_turnaround in text:
    text = text.replace(old_turnaround, new_turnaround)
    print("Updated 6.30-32 titles to Turnaround")
else:
    print("Warning: old_turnaround not found!")

# 5. 6.40 CTS dimension: 17 columns
old_cts = r"\includegraphics[valign=t, width=\dimexpr 14\cellsizeS\relax]{ls68_pattern_square_cts_puzzle.pdf}"
new_cts = r"\includegraphics[valign=t, width=\dimexpr 17\cellsizeS\relax]{ls68_pattern_square_cts_puzzle.pdf}"
if old_cts in text:
    text = text.replace(old_cts, new_cts)
    print("Updated 6.40 CTS width to 17 cellsizeS")
else:
    print("Warning: old_cts not found!")

# 6. 6.44-47: mimic 6.33 structure (no placeholder boxes)
old_ls72_75 = r"""% =========================================================================
% PAGE 19: LS 72 (Pencils Look-Air) - FULL WIDTH
% =========================================================================
\enlargethispage{1.0cm}

\showcaseheader{LS 72: Pencils (Look-Air Sightlines)}{Sightline restriction: matching-size pencils cannot see each other along lines of body cells.}

\vspace{1mm}
\begin{tcolorbox}[colback=blue7!5, colframe=blue7, boxrule=0.6pt, arc=1.2mm, left=4mm, right=4mm, top=2.5mm, bottom=2.5mm]
\small\raggedright
\textbf{Rules:} Normal Pencils rules apply. Draw pencils consisting of a lead (triangle/arrow) and a rectangular body. Pencils cannot overlap. Two pencils of the same size cannot see each other along straight lines of non-pencil body cells.
\end{tcolorbox}

\vspace{3mm}

\begin{center}
\begin{minipage}{0.96\linewidth}
\fbox{\parbox[c][3.8cm]{0.47\linewidth}{\centering\footnotesize\color{gray!80} Example Space}}
\hfill
\fbox{\parbox[c][3.8cm]{0.47\linewidth}{\centering\footnotesize\color{gray!80} Example Solution Space}}
\end{minipage}
\end{center}

\vspace{3mm}

\lshead{6.44}{Pencils (Look-Air)}

\vspace{2mm}
\begin{center}
\includegraphics[valign=t, width=\dimexpr 8\cellsizeM\relax]{ls72_pencils_look_air_puzzle.pdf}
\end{center}

\newpage

% =========================================================================
% PAGE 20: LS 73 (Pentominous Myopia) - FULL WIDTH
% =========================================================================
\enlargethispage{1.0cm}

\showcaseheader{LS 73: Pentominous (Myopia)}{Closest-shape directional clues: arrows point toward nearest pentominoes of that shape.}

\vspace{1mm}
\begin{tcolorbox}[colback=blue7!5, colframe=blue7, boxrule=0.6pt, arc=1.2mm, left=4mm, right=4mm, top=2.5mm, bottom=2.5mm]
\small\raggedright
\textbf{Rules:} Divide the grid into pentominoes (5 cells each). Matching pentominoes cannot touch orthogonally. Arrow clues point in all directions that tie for containing the closest pentomino of the indicated shape.
\end{tcolorbox}

\vspace{3mm}

\begin{center}
\begin{minipage}{0.96\linewidth}
\fbox{\parbox[c][3.8cm]{0.47\linewidth}{\centering\footnotesize\color{gray!80} Example Space}}
\hfill
\fbox{\parbox[c][3.8cm]{0.47\linewidth}{\centering\footnotesize\color{gray!80} Example Solution Space}}
\end{minipage}
\end{center}

\vspace{3mm}

\lshead{6.45}{Pentominous (Myopia)}

\vspace{2mm}
\begin{center}
\includegraphics[valign=t, width=\dimexpr 10\cellsizeM\relax]{ls73_pentominous_myopia_puzzle.pdf}
\end{center}

\newpage

% =========================================================================
% PAGE 21: LS 74 (Choco Banana Thermo) - FULL WIDTH
% =========================================================================
\enlargethispage{1.0cm}

\showcaseheader{LS 74: Choco Banana (Thermo)}{Thermal gradient: region sizes strictly increase from bulb to tip.}

\vspace{1mm}
\begin{tcolorbox}[colback=blue7!5, colframe=blue7, boxrule=0.6pt, arc=1.2mm, left=4mm, right=4mm, top=2.5mm, bottom=2.5mm]
\small\raggedright
\textbf{Rules:} Standard Choco Banana rules apply (shaded areas rectangular, unshaded non-rectangular). Thermometer clues indicate monotonic progression: region sizes along each thermometer must strictly increase from the round bulb to the flat tip.
\end{tcolorbox}

\vspace{3mm}

\begin{center}
\begin{minipage}{0.96\linewidth}
\fbox{\parbox[c][3.8cm]{0.47\linewidth}{\centering\footnotesize\color{gray!80} Example Space}}
\hfill
\fbox{\parbox[c][3.8cm]{0.47\linewidth}{\centering\footnotesize\color{gray!80} Example Solution Space}}
\end{minipage}
\end{center}

\vspace{3mm}

\lshead{6.46}{Choco Banana (Thermo)}

\vspace{2mm}
\begin{center}
\includegraphics[valign=t, width=\dimexpr 8\cellsizeM\relax]{ls74_choco_banana_thermo_puzzle.pdf}
\end{center}

\newpage

% =========================================================================
% PAGE 22: LS 75 (Pentominous Irrwisch) - FULL WIDTH
% =========================================================================
\enlargethispage{1.0cm}

\showcaseheader{LS 75: Pentominous Irrwisch (Cipher Finale)}{Cipher variant: each instance of letter A represents a different pentomino shape!}

\vspace{1mm}
\begin{tcolorbox}[colback=blue7!5, colframe=blue7, boxrule=0.6pt, arc=1.2mm, left=4mm, right=4mm, top=2.5mm, bottom=2.5mm]
\small\raggedright
\textbf{Rules:} Standard Pentominous rules apply: divide the grid into pentominoes of 5 cells each such that matching pentominoes do not touch orthogonally. Irrwisch cipher variant: each instance of the letter A represents a different, unknown pentomino shape across the grid!
\end{tcolorbox}

\vspace{3mm}

\begin{center}
\begin{minipage}{0.96\linewidth}
\fbox{\parbox[c][3.8cm]{0.47\linewidth}{\centering\footnotesize\color{gray!80} Example Space}}
\hfill
\fbox{\parbox[c][3.8cm]{0.47\linewidth}{\centering\footnotesize\color{gray!80} Example Solution Space}}
\end{minipage}
\end{center}

\vspace{3mm}

\lshead{6.47}{Pentominous Irrwisch}

\vspace{2mm}
\begin{center}
\includegraphics[valign=t, width=\dimexpr 10\cellsizeM\relax]{ls75_pentominous_irrwisch_puzzle.pdf}
\end{center}"""

new_ls72_75 = r"""% =========================================================================
% PAGE 20: LS 72 (Pencils Look-Air) & LS 73 (Pentominous Myopia)
% =========================================================================
\enlargethispage{1.0cm}

\showcaseheadermini{LS 72: Pencils (Look-Air Sightlines)}{Sightline restriction: matching-size pencils cannot see each other along lines of body cells.}
\lshead{6.44}{Pencils (Look-Air)}

\begin{minipage}[t]{0.54\textwidth}\vspace{0pt}
\raggedright\footnotesize
\textbf{Rules:} Normal Pencils rules apply. Draw pencils consisting of a lead (triangle/arrow) and a rectangular body. Pencils cannot overlap. Two pencils of the same size cannot see each other along straight lines of non-pencil body cells.
\end{minipage}
\hfill
\begin{minipage}[t]{0.44\textwidth}\vspace{0pt}
\centering
\includegraphics[valign=t, width=\dimexpr 8\cellsizeM\relax]{ls72_pencils_look_air_puzzle.pdf}
\end{minipage}

\vspace{3mm}
\hrule
\vspace{2.5mm}

\showcaseheadermini{LS 73: Pentominous (Myopia)}{Closest-shape directional clues: arrows point toward nearest pentominoes of that shape.}
\lshead{6.45}{Pentominous (Myopia)}

\begin{minipage}[t]{0.54\textwidth}\vspace{0pt}
\raggedright\footnotesize
\textbf{Rules:} Divide the grid into pentominoes (5 cells each). Matching pentominoes cannot touch orthogonally. Arrow clues point in all directions that tie for containing the closest pentomino of the indicated shape.
\end{minipage}
\hfill
\begin{minipage}[t]{0.44\textwidth}\vspace{0pt}
\centering
\includegraphics[valign=t, width=\dimexpr 10\cellsizeM\relax]{ls73_pentominous_myopia_puzzle.pdf}
\end{minipage}

\newpage

% =========================================================================
% PAGE 21: LS 74 (Choco Banana Thermo) & LS 75 (Pentominous Irrwisch)
% =========================================================================
\enlargethispage{1.0cm}

\showcaseheadermini{LS 74: Choco Banana (Thermo)}{Thermal gradient: region sizes strictly increase from bulb to tip.}
\lshead{6.46}{Choco Banana (Thermo)}

\begin{minipage}[t]{0.54\textwidth}\vspace{0pt}
\raggedright\footnotesize
\textbf{Rules:} Standard Choco Banana rules apply (shaded areas rectangular, unshaded non-rectangular). Thermometer clues indicate monotonic progression: region sizes along each thermometer must strictly increase from the round bulb to the flat tip.
\end{minipage}
\hfill
\begin{minipage}[t]{0.44\textwidth}\vspace{0pt}
\centering
\includegraphics[valign=t, width=\dimexpr 8\cellsizeM\relax]{ls74_choco_banana_thermo_puzzle.pdf}
\end{minipage}

\vspace{3mm}
\hrule
\vspace{2.5mm}

\showcaseheadermini{LS 75: Pentominous Irrwisch (Cipher Finale)}{Cipher variant: each instance of letter A represents a different pentomino shape!}
\lshead{6.47}{Pentominous Irrwisch}

\begin{minipage}[t]{0.54\textwidth}\vspace{0pt}
\raggedright\footnotesize
\textbf{Rules:} Standard Pentominous rules apply: divide the grid into pentominoes of 5 cells each such that matching pentominoes do not touch orthogonally. Irrwisch cipher variant: each instance of the letter A represents a different, unknown pentomino shape across the grid!
\end{minipage}
\hfill
\begin{minipage}[t]{0.44\textwidth}\vspace{0pt}
\centering
\includegraphics[valign=t, width=\dimexpr 10\cellsizeM\relax]{ls75_pentominous_irrwisch_puzzle.pdf}
\end{minipage}"""

# Note: step 1 already removed \textbf{Puzzle (...)}\\[1mm] from old_ls72_75, so check matching
if old_ls72_75 in text:
    text = text.replace(old_ls72_75, new_ls72_75)
    print("Updated LS 72-75 layout to mimic 6.33")
else:
    # try matching without the Puzzle line
    old_ls72_75_no_p = re.sub(p_pattern, '', old_ls72_75)
    if old_ls72_75_no_p in text:
        text = text.replace(old_ls72_75_no_p, new_ls72_75)
        print("Updated LS 72-75 layout (no_p) to mimic 6.33")
    else:
        print("Warning: old_ls72_75 not found!")

with open(tex_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Saved updated logic_showcase.tex")
