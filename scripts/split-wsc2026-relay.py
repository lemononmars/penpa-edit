"""Split the three stacked Round 11 relay grids into printable panels."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "docs" / "public" / "wsc2026"

# The arrows between the grids remain outside these bounds.
PANELS = ((0, 0, 391, 383), (0, 417, 391, 798), (0, 830, 391, 1214))

for kind in ("example", "solution"):
    image = Image.open(ASSETS / f"relay-{kind}.png").convert("RGB")
    for index, box in enumerate(PANELS, start=1):
        image.crop(box).save(ASSETS / f"relay-{kind}-{index}.png")

print("Split Round 11 relay into three example and three solution panels")
