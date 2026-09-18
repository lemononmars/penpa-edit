import subprocess

test_svg = """<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200">
<text x="20" y="50" font-family="Cambria Math, Segoe UI Symbol, sans-serif" font-size="30">&#x1D678; &#x1D4C1; &#x0398; &#x272A;</text>
<text x="20" y="100" font-family="MS Gothic, Segoe UI Symbol, Cambria Math, sans-serif" font-size="30">&#xFF5C; &#x2223; &#x007C; I</text>
<text x="20" y="150" font-family="Segoe UI Symbol, Cambria Math, sans-serif" font-size="30">&#x20D3;&#x20D3;</text>
</svg>"""

with open("scratch/test_font.svg", "w", encoding="utf-8") as f:
    f.write(test_svg)

cmd = ["C:\\Program Files\\Inkscape\\inkscape.com", "scratch/test_font.svg", "--export-filename=scratch/test_font.pdf"]
subprocess.run(cmd, check=True)
print("Exported test_font.pdf!")
