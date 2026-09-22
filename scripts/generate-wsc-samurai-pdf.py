"""Build the downloadable Round 2 booklet example with a full-page board."""
from pathlib import Path
import shutil
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'output/pdf/wsc2026-round-2.pdf'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
pdf = canvas.Canvas(str(OUTPUT), pagesize=A4)
pdf.setTitle('WSC 2026 - Round 2 Samurai practice')
width, height = A4
style = ParagraphStyle('rules', fontName='Helvetica', fontSize=11, leading=17)

def paragraph(text, x, y, available_width):
    p = Paragraph(text, style)
    _, used = p.wrap(available_width, height)
    p.drawOn(pdf, x, y - used)
    return y - used

def footer(page):
    pdf.setFont('Helvetica', 8)
    pdf.setFillColorRGB(.35, .4, .35)
    pdf.drawString(12*mm, 10*mm, 'WSC 2026 instruction booklet v1. Non-commercial practice. Rights remain with the authors.')
    pdf.drawRightString(width-12*mm, 10*mm, str(page))
    pdf.setFillColorRGB(0, 0, 0)

pdf.setFont('Helvetica', 10)
pdf.drawString(18*mm, height-25*mm, 'ROUND 02 / PANDU PUTRA')
pdf.setFont('Helvetica-Bold', 26)
pdf.drawString(18*mm, height-41*mm, 'Samurai Sudoku')
pdf.setFont('Helvetica', 12)
pdf.drawString(18*mm, height-51*mm, '35 minutes / 350 points')
y = paragraph('Five overlapping 9 x 9 grids form one board. Use digits 1-9 once in every row, column and 3 x 3 box of each grid. An overlapping box belongs to both grids.', 18*mm, height-67*mm, 174*mm)
rules = [
    ('TOP LEFT', 'No Three in a Line', 'No three consecutive cells along a marked line may all be odd or all be even.'),
    ('TOP RIGHT', 'Creasing', 'Digits along each marked line strictly increase or strictly decrease.'),
    ('CENTRE', 'Palindrome', 'Each marked line reads the same in both directions.'),
    ('BOTTOM LEFT & RIGHT', 'Clone Along Line', 'The marked lines contain the same digits in the same order, allowing either direction.'),
]
for position, name, rule in rules:
    y -= 9*mm
    y = paragraph(f'<b>{position} / {name}</b><br/>{rule}', 18*mm, y, 174*mm)
y -= 11*mm
paragraph('<b>Scoring</b><br/>Fully solved grids score 90, 80, 70, 60 and 50 points in the order completed. Each must be consistent with the overall solution.', 18*mm, y, 174*mm)
footer(1)
pdf.showPage()
pdf.setFont('Helvetica', 9)
pdf.drawString(10*mm, height-16*mm, 'WSC 2026 / ROUND 02 / BOOKLET EXAMPLE')
pdf.setFont('Helvetica-Bold', 18)
pdf.drawString(10*mm, height-26*mm, 'Samurai Sudoku')
pdf.setLineWidth(.7)
pdf.rect(width-43*mm, height-29*mm, 33*mm, 17*mm)
pdf.setFont('Helvetica', 7)
pdf.drawCentredString(width-26.5*mm, height-18*mm, 'TIME')
pdf.setFont('Helvetica', 11)
pdf.drawCentredString(width-26.5*mm, height-25*mm, '____ : ____')
pdf.setFont('Helvetica', 9)
pdf.drawCentredString(width/2, height-40*mm, 'Top left: No Three in a Line / Top right: Creasing')
pdf.drawCentredString(width/2, height-46*mm, 'Centre: Palindrome / Bottom left & right: Clone Along Line')
pdf.drawImage(str(ROOT/'docs/public/wsc2026/samurai-example.png'), 10*mm, 38*mm, width=190*mm, height=190*mm, preserveAspectRatio=True, anchor='c')
pdf.setFont('Helvetica', 9)
pdf.drawString(12*mm, 25*mm, 'Completed grids:   1 _____   2 _____   3 _____   4 _____   5 _____')
footer(2)
pdf.save()
shutil.copyfile(OUTPUT, ROOT/'docs/public/wsc2026/samurai-practice.pdf')
print(OUTPUT)
