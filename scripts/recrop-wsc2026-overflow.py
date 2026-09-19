"""Restore examples clipped at the page's bottom or right edge."""

from pathlib import Path
import re

import pymupdf


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs" / "public" / "wsc2026"

# The source extractor used a conservative 581 x 756 point page boundary.
# These six entries reach the physical page edge and need the complete 612 x 792 area.
CROPS = {
    # id: (zero-based page, panel top, content bottom)
    "r01-03": (5, 547.6, 766.5),
    "r03-03": (10, 528.2, 764.1),
    "r05-05": (15, 484.0, 703.0),
    "r06-05": (18, 484.0, 760.6),
    "r06-08": (19, 506.1, 759.5),
    "r07-08": (22, 504.9, 758.6),
}


document = pymupdf.open(ROOT / "WSC2026IB.pdf")
for puzzle_id, (page_index, top, bottom) in CROPS.items():
    page = document[page_index]
    clip = pymupdf.Rect(32, top, min(610, page.rect.width), min(bottom, page.rect.height))
    pixmap = page.get_pixmap(matrix=pymupdf.Matrix(1.8, 1.8), clip=clip, alpha=False)
    pixmap.save(OUTPUT / f"{puzzle_id}.png")

    blocks = page.get_text("blocks")
    heading = min(blocks, key=lambda block: abs(block[1] - (top + 3)))
    rule_blocks = [
        block
        for block in blocks
        if block[1] >= heading[3] - 1
        and block[1] < 763
        and block[0] < 100
        and re.search(r"[A-Za-z]{3}", block[4])
        and "Instructions Booklet" not in block[4]
    ]
    illustration_top = max(
        [block[3] for block in rule_blocks if block[1] < heading[3] + 150]
        + [heading[3]]
    )
    for suffix, left, right in (("example", 32, 307), ("solution", 307, 610)):
        panel = pymupdf.Rect(left, illustration_top, right, bottom)
        page.get_pixmap(
            matrix=pymupdf.Matrix(2.3, 2.3), clip=panel, alpha=False
        ).save(OUTPUT / f"{puzzle_id}-{suffix}.png")

print(f"Recropped {len(CROPS)} WSC examples")
