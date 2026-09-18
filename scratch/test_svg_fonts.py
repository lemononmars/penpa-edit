import subprocess

svg_content = """<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
<rect width="100%" height="100%" fill="white"/>
<text x="50" y="50" font-family="Cambria Math" font-size="30">Cambria Math: &#x1D678; &#x1D4C1; &#x0398; &#x272A;</text>
<text x="50" y="100" font-family="Segoe UI Symbol" font-size="30">Segoe UI Symbol: &#x1D678; &#x1D4C1; &#x0398; &#x272A;</text>
<text x="50" y="150" font-family="MS Gothic" font-size="30">MS Gothic: &#xFF5C; &#x2223; &#x007C; I</text>
<text x="50" y="200" font-family="Consolas" font-size="30">Consolas: &#x1D678; &#x1D4C1; &#xFF5C; &#x2223; &#x007C; I</text>
<text x="50" y="250" font-family="Arial, 'Segoe UI Symbol', 'Cambria Math'" font-size="30">Fallback: &#x1D678; &#x1D4C1; &#xFF5C; &#x2223; &#x007C; I</text>
</svg>"""

with open("scratch/font_check.svg", "w", encoding="utf-8") as f:
    f.write(svg_content)

subprocess.run(["C:\\Program Files\\Inkscape\\inkscape.com", "scratch/font_check.svg", "--without-gui", "--export-pdf=scratch/font_check.pdf"], check=True)
subprocess.run(["pdftoppm", "-png", "-r", "150", "scratch/font_check.pdf", "scratch/font_check_preview"], check=True)
print("Done converting font_check.svg to PDF and PNG!")
