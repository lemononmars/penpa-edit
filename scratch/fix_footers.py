import os

pb_dir = r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb"
book_tex = os.path.join(pb_dir, "book.tex")
showcase_tex = os.path.join(pb_dir, "logic_showcase.tex")

# 1. Update book.tex Solution Cover pagestyle
with open(book_tex, "r", encoding="utf-8") as f:
    book_c = f.read()

book_c = book_c.replace(
    "% Solution Cover Page\n\\newpage\n\\thispagestyle{fancy}",
    "% Solution Cover Page\n\\newpage\n\\thispagestyle{empty}"
)
with open(book_tex, "w", encoding="utf-8") as f:
    f.write(book_c)
print("Updated book.tex solution cover pagestyle to empty.")

# 2. Update logic_showcase.tex header/footer
with open(showcase_tex, "r", encoding="utf-8") as f:
    ls_c = f.read()

old_footer = r"\fancyfoot[c]{\footnotesize Logic Showcase}"
new_footer = r"""\pagestyle{fancy}
\fancyhf{}
\fancyhead[LE,RO]{\footnotesize Special Section: Logic Showcase}
\fancyhead[RE,LO]{\footnotesize Code Breaker II}
\fancyfoot[LE,RO]{\footnotesize Page \thepage}
\fancyfoot[CE,CO]{\footnotesize Logic Showcase}
\fancyfoot[RE,LO]{\footnotesize Official Competition Book}"""

if old_footer in ls_c:
    ls_c = ls_c.replace(old_footer, new_footer)
    with open(showcase_tex, "w", encoding="utf-8") as f:
        f.write(ls_c)
    print("Updated logic_showcase.tex headers and footers.")
else:
    print("Old footer not found in logic_showcase.tex.")
