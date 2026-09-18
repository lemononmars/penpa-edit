import os
import re
import json

with open("scratch/final_catalog.json", "r", encoding="utf-8") as f:
    cat = json.load(f)

# Extract column count and dimensions from each SVG
info = []
for item in cat:
    svg_file = f"generated/logic_showcase/{item['baseName']}.svg"
    if not os.path.exists(svg_file):
        continue
    with open(svg_file, "r", encoding="utf-8") as f:
        c = f.read()
    vb = re.search(r'viewBox="([^"]+)"', c)
    w_m = re.search(r'width="([^"]+)"', c)
    h_m = re.search(r'height="([^"]+)"', c)
    
    # In Penpa, cell size is typically 38 or 38px
    # Let's see viewBox: minx, miny, width, height
    vb_vals = [float(x) for x in vb.group(1).split()] if vb else [0, 0, 0, 0]
    width = float(w_m.group(1)) if w_m else vb_vals[2]
    height = float(h_m.group(1)) if h_m else vb_vals[3]
    
    # Let's count grid lines or estimate columns
    # Penpa standard cell size is 38px
    cols = round(width / 38.0)
    rows = round(height / 38.0)
    info.append({
        "baseName": item["baseName"],
        "width": width,
        "height": height,
        "cols": cols,
        "rows": rows
    })

print(f"{'BaseName':<45} | {'Width':<7} | {'Height':<7} | {'Cols':<5} | {'Rows':<5}")
print("-" * 80)
for r in info:
    print(f"{r['baseName']:<45} | {r['width']:<7.1f} | {r['height']:<7.1f} | {r['cols']:<5} | {r['rows']:<5}")

with open("scratch/puzzle_dimensions.json", "w", encoding="utf-8") as f:
    json.dump(info, f, indent=2)
