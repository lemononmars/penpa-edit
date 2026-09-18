import fs from 'fs';

const solLsPath = 'C:/Users/sakul_bp6myy0/OneDrive/Downloads/Puzzles/CB Puzzle Contest/2026/pb/sol_ls.tex';
let content = fs.readFileSync(solLsPath, 'utf8');

// Find start of Page 3
const p3Marker = '% --- Page 3 of Solutions: 6.33 to 6.47 ---';
const parts = content.split(p3Marker);
if (parts.length !== 2) {
  console.error('Could not find Page 3 marker!');
  process.exit(1);
}

const page3Replacement = `% --- Page 3 of Solutions: 6.33 to 6.47 ---
\\begin{center}
{\\Large \\textbf{Official Solutions: Logic Showcase (Cont.)}}
\\end{center}
\\vspace{-3mm}

\\begin{center}
\\begin{tblr}{
   colspec={X[h,c]X[h,c]X[h,c]Q[h,c,30mm]},
   stretch = 0,
   rows = {abovesep=1pt, belowsep=1.5pt}
}
\\includegraphics[width=33mm]{ls63_slitherlink_turnaround_full_puzzle_solution.pdf}&
\\includegraphics[width=33mm]{ls64_mirror_loop_puzzle_solution.pdf}&
\\includegraphics[width=33mm]{ls65_tapa_rope_puzzle_solution.pdf}&
\\SetCell[r=5]{c} {%
  \\footnotesize \\textbf{6.43 CB Tower}\\\\[1mm]
  \\includegraphics[height=150mm, keepaspectratio]{ls71_choco_banana_tower_puzzle_solution.pdf}%
} \\\\
\\footnotesize \\textbf{6.33 Slither.+TA} & \\footnotesize \\textbf{6.34 Mirror Loop} & \\footnotesize \\textbf{6.35 Tapa Rope} & \\\\
\\includegraphics[width=33mm]{ls66_canal_view_disco_puzzle_solution.pdf}&
\\includegraphics[width=32mm]{ls67_pentominous_partial_puzzle_solution.pdf}&
\\includegraphics[width=33mm]{ls67_choco_banana_inequality_puzzle_solution.pdf}& \\\\
\\footnotesize \\textbf{6.36 CV Disco} & \\footnotesize \\textbf{6.37 Pento Partial} & \\footnotesize \\textbf{6.38 CB Inequality} & \\\\
\\includegraphics[width=33mm]{ls68_pattern_square_size_puzzle_solution.pdf}&
\\includegraphics[width=34mm]{ls68_pattern_square_cts_puzzle_solution.pdf}&
\\includegraphics[width=33mm]{ls69_yajiring_ring_puzzle_solution.pdf}& \\\\
\\footnotesize \\textbf{6.39 Pattern Size} & \\footnotesize \\textbf{6.40 Pattern CTS} & \\footnotesize \\textbf{6.41 Yajiring-ring} & \\\\
\\includegraphics[width=34mm]{ls70_alphabet_asp_puzzle_solution.pdf}&
\\includegraphics[width=33mm]{ls72_pencils_look_air_puzzle_solution.pdf}&
\\includegraphics[width=34mm]{ls73_pentominous_myopia_puzzle_solution.pdf}& \\\\
\\footnotesize \\textbf{6.42 Alphabet Asp} & \\footnotesize \\textbf{6.44 Pencils Air} & \\footnotesize \\textbf{6.45 Pento Myopia} & \\\\
\\includegraphics[width=34mm]{ls74_choco_banana_thermo_puzzle_solution.pdf}&
\\includegraphics[width=34mm]{ls75_pentominous_irrwisch_puzzle_solution.pdf}&
& \\\\
\\footnotesize \\textbf{6.46 CB Thermo} & \\footnotesize \\textbf{6.47 Pento Irrwisch} & & \\\\
\\end{tblr}
\\end{center}
`;

fs.writeFileSync(solLsPath, parts[0] + page3Replacement, 'utf8');
console.log('Successfully updated sol_ls.tex with prominent Choco Banana Tower layout!');
