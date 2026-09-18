# 1. Update logic_showcase.tex for Tower page layout
with open(r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\logic_showcase.tex", "r", encoding="utf-8") as f:
    text = f.read()

old_tower = r"""% =========================================================================
% PAGE 17: LS 71 (Choco Banana Tower)
% Architectural Showcase Page
% =========================================================================
\enlargethispage{1.5cm}

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
\includegraphics[height=17.5cm, keepaspectratio]{ls71_choco_banana_tower_puzzle.pdf}
\end{minipage}"""

new_tower = r"""% =========================================================================
% PAGE 17: LS 71 (Choco Banana Tower)
% Architectural Showcase Page
% =========================================================================
\enlargethispage{0.6cm}

\lshead{6.43}{Choco Banana Tower}{LS 71}
\vspace{1mm}

\begin{minipage}[t]{0.46\textwidth}
\begin{tcolorbox}[
  colback=cbdarkteal!7!white,
  colframe=cbdarkteal,
  boxrule=0.5pt,
  arc=1.2mm,
  left=2mm, right=2mm, top=1.2mm, bottom=1.2mm
]
  \textbf{\footnotesize LS 71 Showcase:}\\[0.5mm]
  {\scriptsize Scale 50 vertical stories of pure deduction balancing rectangular chocolate blocks and banana corridors.}
\end{tcolorbox}

\vspace{1mm}

\footnotesize
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
  \textbf{\footnotesize Architectural Specs:}\\[0.8mm]
  {\scriptsize
  $\bullet$ \textbf{Dimensions:} $10$ columns $\times 50$ vertical stories.\\
  $\bullet$ \textbf{Total Cells:} 500 challenge cells.\\
  $\bullet$ \textbf{Strategy:} Vertical bottlenecks constrain adjacent corridors.\\
  $\bullet$ \textbf{Online Solving:} \texttt{tinyurl.com/2dbfbkl4}}
\end{tcolorbox}
\end{minipage}
\hfill
\begin{minipage}[t]{0.50\textwidth}
\centering
\includegraphics[height=16.6cm, keepaspectratio]{ls71_choco_banana_tower_puzzle.pdf}
\end{minipage}"""

assert old_tower in text, "old_tower block not found"
text = text.replace(old_tower, new_tower)

with open(r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\logic_showcase.tex", "w", encoding="utf-8") as f:
    f.write(text)

# 2. Update book.tex for back cover pill plural
with open(r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\book.tex", "r", encoding="utf-8") as f:
    btext = f.read()

btext = btext.replace("6 COMPENDIUM SECTION}", "6 COMPENDIUM SECTIONS}")

with open(r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\book.tex", "w", encoding="utf-8") as f:
    f.write(btext)

print("Refined Tower layout and back cover plural!")
