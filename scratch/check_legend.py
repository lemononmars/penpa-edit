import re

with open('generated/logic_showcase/ls58_puzzle_3_puzzle.svg', 'r', encoding='utf-8') as f:
    c = f.read()

matches = re.findall(r'<text[^>]*x="([^"]+)"[^>]*y="([^"]+)"[^>]*>([^<]+)</text>', c)
legend_items = [m for m in matches if float(m[1]) > 380]
legend_items.sort(key=lambda m: (round(float(m[0])), round(float(m[1]))))
for m in legend_items[::2]:
    print(f"x={float(m[0]):.1f}, y={float(m[1]):.1f}, text={ascii(m[2])}, codes={[f'U+{ord(ch):04X}' for ch in m[2]]}")
