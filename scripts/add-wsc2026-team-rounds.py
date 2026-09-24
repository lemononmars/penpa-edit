"""Import the new team-round examples from the WSC 2026 v2 booklet.

Run with the bundled Python runtime (PyMuPDF required). This script preserves
existing individual-round entries and their hand-reviewed variant mappings.
"""
import json
import pathlib
import shutil
import sys
import pymupdf

ROOT = pathlib.Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'docs/public/wsc2026'
SOURCE = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else PUBLIC / 'WSC2026IB.pdf'
CATALOG = ROOT / 'docs/src/wsc2026/catalog.json'

# number, title, variant ID, points, physical PDF page, crop top, crop bottom, rule
TEAM = {
  8: [(1, 'Pips Sudoku', 'pips', 1200, 27, 90, 530, 'Fill a 6x6 grid with 1–6 once per row, column and 2x3 box. Represent each digit with the matching pip count. The competition puzzle is solved blindfolded with tactile stickers.')],
  9: [
    (1, 'Flower Sudoku', 'flower', 175, 30, 12, 300, 'Fill the 90-cell flower with 1–9 once in each of its ten nine-cell rows, columns and outlined regions. Rows and columns run around the flower in opposite directions.'),
    (2, 'Perfect Squares Pentagram Sudoku', 'perfectsquares', 125, 31, 80, 346, 'Pentagram rules apply. Each marked adjacent pair, read in the direction of the outside arrow, forms a two-digit perfect square; all such pairs are marked.'),
    (3, 'Arithmetic Pairs Pentagram Sudoku', 'arithmetic', 125, 31, 345, 755, 'Pentagram rules apply. A circled number is obtainable from its two adjacent digits using addition, subtraction, multiplication or exact division.'),
    (4, 'Division Pentagram Sudoku', 'division', 125, 32, 13, 244, 'Pentagram rules apply. A circled number is the exact quotient of the larger adjacent digit divided by the smaller.'),
    (5, 'Product Killer Pentagram Sudoku', 'productkiller', 125, 32, 243, 474, 'Pentagram rules apply. The product of the digits in each cage equals its corner clue; cage digits do not repeat.'),
    (6, 'Killer Pentagram Sudoku', 'killer', 125, 32, 473, 755, 'Pentagram rules apply. The sum of the digits in each cage equals its corner clue; cage digits do not repeat.'),
  ],
  13: [
    (1, 'Classic Sudoku', 'classic', None, 46, 47, 265, 'Standard 9x9 Sudoku. Its marked patterns transfer to the seven linked variant grids at matching positions.'),
    (2, 'Battenburg Sudoku', 'battenburg', None, 46, 265, 495, 'Every 2x2 checkerboard of two odd and two even digits is marked; all such patterns match the Classic grid.'),
    (3, 'Diagonally Consecutive Sudoku', 'diagonallyconsecutive', None, 46, 495, 755, 'Diagonally adjacent cells joined by a bar contain consecutive digits. All possible bars are marked.'),
    (4, 'Equal Sums Sudoku', 'equalsums', None, 47, 13, 246, 'A cross marks four cells whose opposite diagonal pairs have equal sums. All possible crosses are marked.'),
    (5, 'Perfect Squares Sudoku', 'perfectsquares', None, 47, 246, 473, 'Marked adjacent digits read left to right or top to bottom form a two-digit perfect square. All such pairs are marked.'),
    (6, 'Rossini Sudoku', 'rossini', None, 47, 473, 755, 'An outside arrow indicates that the first three digits increase in its direction. All possible arrows are marked.'),
    (7, 'Repeated Neighbours Sudoku', 'repeatedneighbors', None, 48, 13, 245, 'Shade every cell with a digit appearing more than once among its orthogonal neighbours.'),
    (8, 'XV Sudoku', 'xv', None, 48, 245, 755, 'A V joins adjacent digits summing to 5; an X joins digits summing to 10. All possible marks are shown.'),
  ],
  14: [
    (1, 'Classic Sudoku', 'classic', None, 54, 47, 265, 'The centre Classic Sudoku connects to one arm in each direction.'),
    (2, 'Exclusion Sudoku', 'exclusion', None, 54, 265, 485, 'A digit at an intersection of four cells does not appear in any of those cells.'),
    (3, 'Non Consecutive On Line Sudoku', 'nonconsecutiveonline', None, 54, 485, 755, 'Digits next to one another on a marked line are not consecutive.'),
    (4, 'Weighted Killer Sudoku', 'weightedkiller', None, 55, 13, 245, 'A cage clue sums white digits and twice each shaded digit. Digits do not repeat in a cage.'),
    (5, 'Consecutive Pairs Sudoku', 'consecutivepairs', None, 55, 245, 475, 'A circle joins consecutive adjacent digits. Unmarked pairs may also be consecutive.'),
    (6, 'Renban Sudoku', 'renbanline', None, 55, 475, 755, 'Each line contains distinct consecutive digits in any order.'),
    (7, 'Slot Machine Sudoku', 'slotmachine', None, 56, 13, 245, 'Marked rows or columns contain the same cyclic digit sequence, wrapped around the grid.'),
    (8, 'Odd Sum Pairs Sudoku', 'oddsumpairs', None, 56, 245, 475, 'A circle joins adjacent digits with an odd sum. Unmarked pairs may also have an odd sum.'),
    (9, 'Multi Diagonal Sudoku', 'multidiagonal', None, 56, 475, 755, 'Digits do not repeat on any marked diagonal.'),
    (10, '258 Sudoku', '258', None, 57, 13, 275, 'In each row, the digit in column 2 gives the column containing 2, column 5 gives the column containing 5, and column 8 gives the column containing 8.'),
    (11, 'Differences Sudoku', 'differences', None, 57, 275, 493, 'A number between adjacent cells gives the absolute difference of their digits.'),
    (12, 'Entropic Lines Sudoku', 'entropiclines', None, 57, 493, 755, 'Every three successive line cells contain one low (1–3), one middle (4–6) and one high (7–9) digit.'),
    (13, 'Missing Thermo Sudoku', 'missingthermo', None, 58, 13, 755, 'Digits increase from a missing bulb at one open end of each thermometer to its other ends.'),
  ],
  15: [
    (1, 'Shifted Sudoku', 'shifted', 150, 60, 70, 755, 'Classic row and column rules apply; some 3x3 boxes wrap around the grid.'),
    (2, 'Inside Skyscraper Sudoku', 'insideskyscraper', 125, 61, 410, 755, 'An arrow cell gives the number of visible skyscrapers looking in its direction, using digits as heights.'),
    (3, 'Pointing Digits Sudoku', 'pointingdigits', 125, 62, 13, 243, 'If an arrow cell contains X, another X lies exactly X steps away along its arrow. Not all arrows are marked.'),
    (4, 'Sum Detector Sudoku', 'sumdetector', 125, 62, 243, 472, 'The arrow cell equals the sum of some consecutive digits in the indicated direction. Not all arrows are marked.'),
    (5, 'Point to Next Sudoku', 'pointtonext', 125, 62, 472, 755, 'An arrow cell containing X points to a cell containing X+1. Not all arrows are marked.'),
    (6, 'Search 9 Sudoku', 'search9', 125, 63, 13, 244, 'Each arrow points to exactly one 9; its own digit gives the distance to that 9.'),
    (7, '3 Up Sudoku', 'threeup', 125, 63, 244, 755, 'An arrow indicates that its first three cells, including the arrow cell, are in ascending order in the arrow direction.'),
  ],
}

ROUND_INFO = {
  8: ("Gandhari's Solidarity", 40, 1200, 27),
  9: ("Draupadi's Swayamvara", 25, 800, 29),
  13: ('Daanveer Karna', 40, 1600, 44),
  14: ('The Game of Dice', 45, 1800, 49),
  15: ('Chakravyuha', 35, 1200, 59),
}
TEAM_RULES = {
  8: 'Blindfolded 6x6 pips Sudoku on a tactile board. Points are awarded per correct cell (up to 1200); fully correct early submissions receive a position bonus of up to 300.',
  9: 'One Flower Sudoku (175 points) joins five eight-digit Pentagram Sudokus (125 each). At each connection one flower digit transfers and another is excluded from the star.',
  13: 'Solve a Classic grid and seven unlabeled variants. Every variant decoration occurs in the same position on the Classic grid, and vice versa. Match variants A–G to their names. Points: up to 400 for matching, 1100 for variants and 100 for Classic.',
  14: 'Place four three-grid arms around the Classic centre. At each join, the first three digits in corresponding rows or columns match in any order. Points: 100 for matching all arms, 100 for Classic and up to 1600 for variants.',
  15: 'Rotate four connected circular sheets to align seven Sudokus. Spoke-connected cells match; identify the six unlabeled variants around the Shifted centre. Points: up to 300 for matching, 750 for variants and 150 for Shifted.',
}

def main():
    doc = pymupdf.open(SOURCE)
    data = json.loads(CATALOG.read_text(encoding='utf-8'))
    old = {p['id']: p for p in data['puzzles']}
    if data.get('version', 1) < 2:
        for entry in data['puzzles']:
            if entry['round'] == 10: entry['page'] += 8
            elif entry['round'] in (11, 12): entry['page'] += 7
            elif entry['round'] == 16: entry['page'] += 28
    for rnd, (name, minutes, points, page) in ROUND_INFO.items():
        data['rounds'][rnd-1].update(name=name, minutes=minutes, points=points, page=page, available=True, teamRules=TEAM_RULES[rnd])
    for rnd, records in TEAM.items():
        for number, title, variant, points, page, top, bottom, rules in records:
            eid = f'r{rnd:02}-{number:02}'
            image = f'/wsc2026/{eid}.png'
            pix = doc[page-1].get_pixmap(matrix=pymupdf.Matrix(1.6, 1.6), clip=pymupdf.Rect(32, top, 581, bottom), alpha=False)
            pix.save(PUBLIC / f'{eid}.png')
            old[eid] = dict(id=eid, round=rnd, number=number, stage='', name=title, points=points,
                            rules=rules, page=page, image=image, example=image, solution=None, variantId=variant)
    data['puzzles'] = sorted(old.values(), key=lambda p: (p['round'], p['number']))
    data.update(version=2, source='WSC2026_IB_v2_20260922.pdf', published='2026-09-22')
    CATALOG.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    if SOURCE.resolve() != (PUBLIC / 'WSC2026IB.pdf').resolve():
        shutil.copy2(SOURCE, PUBLIC / 'WSC2026IB.pdf')
    print('Imported', sum(map(len, TEAM.values())), 'team-round entries; total', len(data['puzzles']))

if __name__ == '__main__': main()
