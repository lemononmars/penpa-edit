import os

pb_dir = r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb"
book_tex_path = os.path.join(pb_dir, "book.tex")

with open(book_tex_path, "r", encoding="utf-8") as f:
    book_content = f.read()

if r"\usepackage[export]{adjustbox}" not in book_content:
    book_content = book_content.replace(
        r"\usepackage{graphicx, xcolor}",
        "\\usepackage{graphicx, xcolor}\n\\usepackage[export]{adjustbox}"
    )
    with open(book_tex_path, "w", encoding="utf-8") as f:
        f.write(book_content)
    print("Updated book.tex with adjustbox")
else:
    print("book.tex already has adjustbox")
