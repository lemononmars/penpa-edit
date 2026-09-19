import pymupdf, re, json, pathlib, shutil
root=pathlib.Path(__file__).resolve().parents[1]
out=root/'docs/public/wsc2026'; out.mkdir(parents=True,exist_ok=True)
doc=pymupdf.open(root/'WSC2026IB.pdf')
rounds=[(1,'Kuru Clan',55,600,6),(2,'Pandu Putra',35,350,9),(3,'Kauravas',50,650,11),(4,'Acharya Drona',35,350,14),(5,'Escape from Lakshagriha',40,450,15),(6,'Quest for Celestial Weapons',45,500,18),(7,'Pandavas in Disguise',50,700,21),(8,'Team Round',None,None,None),(9,'Team Round',None,None,None),(10,'Dharma Yuddha',75,900,26),(11,"Arjuna's Revenge",35,350,33),(12,'Ashwatthama is Dead?',40,400,34),(13,'Team Round',None,None,None),(14,'Team Round',None,None,None),(15,'Team Round',None,None,None),(16,'The Final Duel',60,450,37)]
entries=[]
for pi,page in enumerate(doc):
    p=pi+1
    if p<6: continue
    rnd=max((r for r in rounds if r[4] and r[4]<=p),key=lambda r:r[4])[0]
    blocks=page.get_text('blocks')
    heads=[]
    for b in blocks:
        t=' '.join(b[4].split())
        m=re.match(r'(?:(QF|SF)\s+(\d+)\.|(F)\.|([\d, ]+)\.)\s*(.+?)\s+([\d +]+)\s+points',t)
        if m: heads.append((b,m))
        elif rnd==2 and t.startswith('Samurai Sudoku') and 'points' in t: heads.append((b,None))
    heads.sort(key=lambda a:a[0][1])
    for hi,(b,m) in enumerate(heads):
        end=heads[hi+1][0][1]-3 if hi+1<len(heads) else 756
        ruleblocks=[z for z in blocks if z[1]>=b[3]-1 and z[1]<end and z[0]<100 and re.search(r'[A-Za-z]{3}',z[4]) and 'Instructions Booklet' not in z[4]]
        rule=' '.join(' '.join(z[4].split()) for z in ruleblocks)
        # Rules are positioned before the example; later full-page explanations remain intact.
        if m:
            name=m[5]; nums=[int(x) for x in re.findall(r'\d+',m[4] or m[2] or '1')]; points=[int(x) for x in re.findall(r'\d+',m[6])]; stage=m[1] or m[3] or ''
        else: name='Samurai Sudoku'; nums=[1]; points=[350]; stage=''
        key=f'r{rnd:02}-{stage.lower()}{nums[0]:02}'
        page.get_pixmap(matrix=pymupdf.Matrix(1.8,1.8),clip=pymupdf.Rect(32,b[1]-3,581,end)).save(out/(key+'.png'))
        illustrationStart=max([z[3] for z in ruleblocks if z[1]<b[3]+150]+[b[3]])
        if rnd not in (2,11):
            for suffix,x1,x2 in [('example',32,307),('solution',307,581)]:
                page.get_pixmap(matrix=pymupdf.Matrix(2.3,2.3),clip=pymupdf.Rect(x1,illustrationStart,x2,end)).save(out/(key+'-'+suffix+'.png'))
        for j,num in enumerate(nums):
            eid=f'r{rnd:02}-{stage.lower()}{num:02}'
            entries.append(dict(id=eid,round=rnd,number=num,stage=stage,name=name,points=points[min(j,len(points)-1)],rules=rule,page=p,image=f'/wsc2026/{key}.png',example=f'/wsc2026/{key}-example.png' if rnd not in (2,11) else None,solution=f'/wsc2026/{key}-solution.png' if rnd not in (2,11) else None))
    if rnd==2 and p==10:
        page.get_pixmap(matrix=pymupdf.Matrix(1.8,1.8),clip=pymupdf.Rect(32,10,581,756)).save(out/'samurai-solution.png')
        for e in entries:
            if e['round']==2: e['solution']='/wsc2026/samurai-solution.png'
shutil.copy2(root/'WSC2026IB.pdf',out/'WSC2026IB.pdf')
data=dict(version=1,source='WSC2026IB.pdf',published='2026-09-16',rounds=[dict(id=r[0],name=r[1],minutes=r[2],points=r[3],page=r[4],available=r[4] is not None) for r in rounds],puzzles=entries)
(root/'docs/src/wsc2026').mkdir(exist_ok=True)
catalog_path = root/'docs/src/wsc2026/catalog.json'
if catalog_path.exists():
    previous = {p['id']: p for p in json.loads(catalog_path.read_text(encoding='utf8'))['puzzles']}
    for entry in entries:
        for field in ('variantId', 'variants'):
            if field in previous.get(entry['id'], {}): entry[field] = previous[entry['id']][field]
        if ' Hundred Sudoku' in entry['name']:
            entry['rules'] = next(p['rules'] for p in entries if p['name']=='Hundred Sudoku')+' '+entry['rules']
(root/'docs/src/wsc2026/catalog.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Extracted',len(entries),'puzzle entries')
print('\n'.join(f"{e['id']} {e['name']} ({e['points']})" for e in entries))

# Preserve special composite crops and trim excess whitespace in every printable image.
import runpy
runpy.run_path(str(root/'scripts/finalize-wsc2026-examples.py'))
runpy.run_path(str(root/'scripts/trim-wsc2026-examples.py'))
