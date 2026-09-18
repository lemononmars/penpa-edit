with open(r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\book.tex", "r", encoding="utf-8") as f:
    text = f.read()

idx2 = text.find(r"\pagestyle{fancy}" + "\n\n" + r"\include{sol_en}")
idx1 = text.rfind(r"\newpage", 0, idx2)

new_sol_cover = r"""\newpage
\thispagestyle{fancy}
\begin{center}
\vspace*{6mm}
\includegraphics[height=2.2cm, keepaspectratio]{logo.png}\\[3.5mm]
{\fontsize{24}{28}\selectfont \textbf{\color{cbdarkteal}OFFICIAL SOLUTIONS}}\\[1.5mm]
{\fontsize{11}{14}\selectfont \textbf{\color{black!70}Complete Logical Answer Keys \& Verified Solutions}}\\[3.5mm]
{\color{cbdarkteal}\rule{0.65\textwidth}{1.2pt}}\\[6mm]
\end{center}

\vspace{1mm}

\begin{center}
\begin{minipage}{0.88\textwidth}
\begin{tcolorbox}[
  colback=white,
  colframe=cbdarkteal,
  boxrule=0.9pt,
  arc=2mm,
  left=5mm, right=5mm, top=3.5mm, bottom=3.5mm,
  before=\vspace{2mm}, after=\vspace{4mm}
]
  \noindent{\textbf{\large\color{cbdarkteal}Competition Rounds 1--4}}\hfill{\footnotesize\bfseries\color{cbdarkteal}46 TOURNAMENT GRIDS}\\[1.5mm]
  {\small\raggedright Official competition answer keys for Popular Picks, Shading Showcase, Penta Party (Metapuzzle), and Warped Words.\par}
\end{tcolorbox}

\begin{tcolorbox}[
  colback=white,
  colframe=cbdarkteal,
  boxrule=0.9pt,
  arc=2mm,
  left=5mm, right=5mm, top=3.5mm, bottom=3.5mm,
  before=\vspace{2mm}, after=\vspace{4mm}
]
  \noindent{\textbf{\large\color{cbdarkteal}Special Section: Choco Banana City Bus}}\hfill{\footnotesize\bfseries\color{cbdarkteal}25 OMNIBUS GRIDS}\\[1.5mm]
  {\small\raggedright Comprehensive solutions across the entire graded bus line from 7$\times$7 starters to the 5$\times$35 expressway.\par}
\end{tcolorbox}

\begin{tcolorbox}[
  colback=white,
  colframe=cbdarkteal,
  boxrule=0.9pt,
  arc=2mm,
  left=5mm, right=5mm, top=3.5mm, bottom=3.5mm,
  before=\vspace{2mm}, after=\vspace{6mm}
]
  \noindent{\textbf{\large\color{cbdarkteal}Special Section: Logic Showcase}}\hfill{\footnotesize\bfseries\color{cbdarkteal}47 HYBRID GRIDS}\\[1.5mm]
  {\small\raggedright Full visual deduction keys for the avant-garde Logic Showcase series (LS 49--LS 75), including the 50-Story Tower.\par}
\end{tcolorbox}

\vspace{5mm}
\begin{center}
{\footnotesize\color{black!60}All solutions mathematically checked and independently verified $\bullet$ Zero guessing required}
\end{center}
\end{minipage}
\end{center}
\null
"""

text = text[:idx1] + new_sol_cover + text[idx2:]

with open(r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\book.tex", "w", encoding="utf-8") as f:
    f.write(text)

print("Replaced Solution Cover in book.tex with print-ready version!")
