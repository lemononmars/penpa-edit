with open(r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\sol_ls.tex", "r", encoding="utf-8") as f:
    text = f.read()

# Remove initial empty newpage if present
if text.startswith("% =========================================================================\n% OFFICIAL SOLUTIONS: LOGIC SHOWCASE\n% =========================================================================\n\n\\newpage"):
    text = text.replace("% =========================================================================\n% OFFICIAL SOLUTIONS: LOGIC SHOWCASE\n% =========================================================================\n\n\\newpage\n", "% =========================================================================\n% OFFICIAL SOLUTIONS: LOGIC SHOWCASE\n% =========================================================================\n")

# Now let's fix Page 3 of Solutions (6.33 to 6.47)
old_p3_header = """% --- Page 3 of Solutions: 6.33 to 6.47 ---
\\begin{center}
{\\Large \\textbf{Official Solutions: Logic Showcase (Cont.)}}
\\end{center}
\\vspace{-3mm}

\\begin{center}
\\begin{tblr}{
   colspec={X[h,c]X[h,c]X[h,c]Q[h,c,30mm]},
   stretch = 0,
   rows = {abovesep=1pt, belowsep=1.5pt}
}"""

new_p3_header = """% --- Page 3 of Solutions: 6.33 to 6.47 ---
\\enlargethispage{2.0cm}
\\begin{center}
{\\Large \\textbf{Official Solutions: Logic Showcase (Cont.)}}
\\end{center}
\\vspace{-5mm}

\\begin{tblr}{
   colspec={X[h,c]X[h,c]X[h,c]Q[h,c,30mm]},
   stretch = 0,
   rows = {abovesep=0.5pt, belowsep=0.8pt}
}"""

text = text.replace(old_p3_header, new_p3_header)
text = text.replace("height=150mm", "height=138mm")
# Also remove the matching \end{center} after \end{tblr}
text = text.replace("\\end{tblr}\n\\end{center}\n", "\\end{tblr}\n")

with open(r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\sol_ls.tex", "w", encoding="utf-8") as f:
    f.write(text)

print("Updated sol_ls.tex successfully!")
