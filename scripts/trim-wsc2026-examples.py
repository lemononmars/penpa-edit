from pathlib import Path
from PIL import Image,ImageChops
for f in Path('docs/public/wsc2026').glob('*.png'):
 if f.stem.endswith(('-example','-solution')):
  im=Image.open(f).convert('RGB'); diff=ImageChops.difference(im,Image.new('RGB',im.size,'white')).convert('L'); box=diff.point(lambda p:255 if p>25 else 0).getbbox()
  if box:
   x1,y1,x2,y2=box; im.crop((max(0,x1-8),max(0,y1-8),min(im.width,x2+8),min(im.height,y2+8))).save(f)
