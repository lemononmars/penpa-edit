from pathlib import Path
import pymupdf,json
root=Path.cwd(); d=pymupdf.open('WSC2026IB.pdf'); out=root/'docs/public/wsc2026'
for pg,rect,name in [(8,(120,350,490,720),'samurai-example'),(32,(198,167,371,699),'relay-example'),(32,(398,167,577,699),'relay-solution')]:
 d[pg].get_pixmap(matrix=pymupdf.Matrix(2.3,2.3),clip=pymupdf.Rect(rect)).save(out/(name+'.png'))
p=root/'docs/src/wsc2026/catalog.json';data=json.loads(p.read_text(encoding='utf8'))
for item in data['puzzles']:
 if item['round']==2:item['example']='/wsc2026/samurai-example.png'
 if item['round']==11:item['example']='/wsc2026/relay-example.png';item['solution']='/wsc2026/relay-solution.png'
p.write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
