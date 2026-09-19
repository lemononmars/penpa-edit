<script lang="ts">
 import { variations } from './variationCatalog';
 let open=false, text='{}', message='';
 const items=variations.filter(v=>v.tags.includes('wsc2026')&&v.status==='available');
 let variant='trishula';
 const c=(row:number,col:number)=>({row,col});
 const examples:any={
  trishula:[{cells:[c(0,0),c(1,1),c(2,2)],tips:[c(0,2),c(0,3),c(1,3)]}],
  attacktheleader:[{origin:c(4,4),directions:['up','right'],cells:Array.from({length:81},(_,i)=>c(Math.floor(i/9),i%9))}],
  neighbouringdisparity:[{origin:c(4,4),cells:[c(3,3),c(3,5)]}],
  sforsudoku:[{cells:[c(0,0)],allowed:[1,3,4,7,9]}],
  clonealongline:[{cells:[c(0,0),c(0,1),c(0,2)],other:[c(3,0),c(3,1),c(3,2)]}],
  anticlone:[{cells:[c(0,0),c(0,1)],other:[c(3,0),c(3,1)]}],
  unordereddistances:[{cells:Array.from({length:9},(_,i)=>c(0,i)),x:2,y:7,distance:4}],
  missingthermo:[{cells:[c(0,0),c(0,1),c(0,2),c(1,1)],paths:[[c(0,0),c(0,1),c(0,2)],[c(0,1),c(1,1)]]}]
 };
 function board(){return (window as any).pu;}
 function load(){text=JSON.stringify(board()?.pu_q?.wsc2026Clues||{},null,2);message='';}
 function example(){let value;try{value=JSON.parse(text);}catch{value={};}value[variant]=examples[variant]||[{cells:[c(0,0),c(0,1),c(0,2)]}];text=JSON.stringify(value,null,2);message='Example inserted. Replace coordinates and values with your puzzle clues before applying.';}
 function save(){try{const data=JSON.parse(text);const validators=(window as any).Wsc2026Rules;if(!data||Array.isArray(data)||typeof data!=='object')throw new Error('Enter an object keyed by variant ID.');for(const [kind,clues] of Object.entries(data)){if(!Array.isArray(clues)||!clues.length||!clues.every(q=>validators?.valid({...q,kind})))throw new Error('Invalid clues for '+kind+'. Check required fields and zero-based cell coordinates.');}if(!board()?.pu_q)throw new Error('Open a puzzle first.');board().pu_q.wsc2026Clues=data;board().redraw();message='Clues applied and included in saved puzzle links.';}catch(e:any){message=e.message;}}
</script>
<details ontoggle={e=>{open=(e.currentTarget as HTMLDetailsElement).open;if(open)load();}}><summary>WSC 2026 clue editor</summary><p>Use normal marks where supported. For advanced WSC shapes, enter exact cells here. Coordinates start at row 0, column 0. Select the variant in the main dropdown too.</p><p><a href="/wsc2026/clue-guide.html" target="_blank" rel="noreferrer">Clue formats and examples ↗</a></p><label>Example variant<select bind:value={variant}>{#each items as v}<option value={v.value}>{v.name}</option>{/each}</select></label><button onclick={example}>Insert example</button><label>Structured clues<textarea bind:value={text} rows="12" spellcheck="false"></textarea></label><button onclick={save}>Apply clues</button><button onclick={load}>Reload saved clues</button><p role="status">{message}</p></details>
<style>details{background:#f7f9f5;border:1px solid #d3dbd0;border-radius:8px;padding:12px;margin:12px 0;font-size:12px}summary{cursor:pointer;font-weight:bold}p{line-height:1.5}label{display:block;margin:12px 0}select,textarea{display:block;max-width:100%;width:100%;margin-top:6px}textarea{font:12px monospace}button{margin:3px;padding:6px}</style>
