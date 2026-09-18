import os
import subprocess

inkscape_path = r"C:\Program Files\Inkscape\inkscape.com"
graphics_dir = r"C:\Users\sakul_bp6myy0\OneDrive\Downloads\Puzzles\CB Puzzle Contest\2026\pb\graphics"

def fix_6_7():
    for suffix in ["_puzzle", "_puzzle_solution"]:
        svg_file = f"generated/logic_showcase/ls51_choco_banana_treasure_hunt{suffix}.svg"
        if not os.path.exists(svg_file):
            continue
        with open(svg_file, "r", encoding="utf-8") as f:
            c = f.read()
        
        # Replace Helvetica,Arial with Segoe UI Symbol, Cambria Math, sans-serif
        c = c.replace('font-family="Helvetica,Arial"', 'font-family="\'Segoe UI Symbol\', \'Cambria Math\', Arial, sans-serif"')
        c = c.replace("font-family='Helvetica,Arial'", "font-family=\"'Segoe UI Symbol', 'Cambria Math', Arial, sans-serif\"")
        
        fixed_svg = f"scratch/ls51_choco_banana_treasure_hunt{suffix}.svg"
        with open(fixed_svg, "w", encoding="utf-8") as f:
            f.write(c)
        
        out_pdf = os.path.join(graphics_dir, f"ls51_choco_banana_treasure_hunt{suffix}.pdf")
        cmd = [inkscape_path, fixed_svg, "--without-gui", "--export-text-to-path", f"--export-pdf={out_pdf}"]
        subprocess.run(cmd, check=True)
        print(f"Exported {out_pdf}")

def fix_6_18():
    for suffix in ["_puzzle", "_puzzle_solution"]:
        svg_file = f"generated/logic_showcase/ls58_puzzle_3{suffix}.svg"
        if not os.path.exists(svg_file):
            continue
        with open(svg_file, "r", encoding="utf-8") as f:
            c = f.read()
        
        # Replace combining marks \u20d3\u20d3 with \u2016 (Double Vertical Line)
        c = c.replace("\u20d3\u20d3", "\u2016")
        c = c.replace("&#x20D3;&#x20D3;", "&#x2016;")
        
        # Replace font family with MS Gothic, Segoe UI Symbol, Cambria Math
        c = c.replace('font-family="Helvetica,Arial"', 'font-family="\'MS Gothic\', \'Segoe UI Symbol\', \'Cambria Math\', sans-serif"')
        c = c.replace("font-family='Helvetica,Arial'", "font-family=\"'MS Gothic', 'Segoe UI Symbol', 'Cambria Math', sans-serif\"")
        
        fixed_svg = f"scratch/ls58_puzzle_3{suffix}.svg"
        with open(fixed_svg, "w", encoding="utf-8") as f:
            f.write(c)
        
        out_pdf = os.path.join(graphics_dir, f"ls58_puzzle_3{suffix}.pdf")
        cmd = [inkscape_path, fixed_svg, "--without-gui", "--export-text-to-path", f"--export-pdf={out_pdf}"]
        subprocess.run(cmd, check=True)
        print(f"Exported {out_pdf}")

fix_6_7()
fix_6_18()
print("All fixed PDFs generated with vector text-to-path!")
