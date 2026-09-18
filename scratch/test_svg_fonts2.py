import subprocess

svg_content = """<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
<rect width="100%" height="100%" fill="white"/>
<text x="50" y="50" font-family="'Segoe UI Symbol', 'Cambria Math'" font-size="30">6.7 Clues: &#x1D678; &#x1D4C1; &#x0398; &#x272A;</text>
<text x="50" y="100" font-family="'MS Gothic', 'Segoe UI Symbol', 'Cambria Math'" font-size="30">6.18 Clues (with U+2016): &#xFF5C; &#x2223; &#x007C; I &#x2016;</text>
<text x="50" y="150" font-family="'MS Gothic', 'Segoe UI Symbol', 'Cambria Math'" font-size="30">6.18 Clues (with ||): &#xFF5C; &#x2223; &#x007C; I ||</text>
<text x="50" y="200" font-family="'MS Gothic', 'Segoe UI Symbol', 'Cambria Math'" font-size="30">6.18 Clues (with U+3022): &#xFF5C; &#x2223; &#x007C; I &#x3022;</text>
</svg>"""

with open("scratch/font_check2.svg", "w", encoding="utf-8") as f:
    f.write(svg_content)

subprocess.run(["C:\\Program Files\\Inkscape\\inkscape.com", "scratch/font_check2.svg", "--without-gui", "--export-pdf=scratch/font_check2.pdf"], check=True)
subprocess.run(["pdftoppm", "-png", "-r", "150", "scratch/font_check2.pdf", "scratch/font_check2_preview"], check=True)
print("Converted font_check2.svg!")
