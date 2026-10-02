<script lang="ts">
 import { hundredCombinationGroups } from './wsc2026/references.js';
 let groupIndex=3, query='', chosenNumber:number|null=null;
 const digits=Array.from({length:9},(_,i)=>i+1);
 const total=hundredCombinationGroups.reduce((sum,group)=>sum+group.combinations.length,0);
 $: group=hundredCombinationGroups[groupIndex];
 $: terms=group.combinations.map((text)=>({text,values:text.split(' + ').map(Number)}));
 $: matches=terms.filter(({values})=>(chosenNumber===null||values.includes(chosenNumber)) && query.trim().split(/[\s,+]+/).filter(Boolean).every((term)=>values.includes(Number(term))));
 $: pairCounts=Object.fromEntries(Array.from({length:81},(_,i)=>{const number=(Math.floor(i/9)+1)*10+i%9+1;return [number,terms.filter(({values})=>values.includes(number)).length];}));
 function chooseGroup(index:number){groupIndex=index;chosenNumber=null;query='';}
</script>

<section class="hundred-tool" aria-labelledby="hundred-title">
 <header><div><p class="eyebrow">ROUND 3 · NUMBER REFERENCE</p><h2 id="hundred-title">Make 100</h2><p>Find the numbers that can share a row. Every sum uses distinct digits and fits the available shaded cells.</p></div><div class="total"><strong>{total}</strong><span>valid combinations</span></div></header>
 <div class="workspace">
  <nav class="group-picker" aria-label="Combination groups">
   <h3>Choose the row’s numbers</h3>
   {#each hundredCombinationGroups as entry,index}<button class:active={groupIndex===index} aria-pressed={groupIndex===index} onclick={()=>chooseGroup(index)}><span>{entry.label}</span><b>{entry.combinations.length}</b></button>{/each}
   <p>Addends may appear in any order. The digit pairs below each occur in a full combination; pairs cannot always be combined freely.</p>
   <a href="/wsc2026/?round=3">Round 3 rules &amp; puzzles ↗</a>
  </nav>
  <div class="group-content">
   <div class="group-heading"><h3>{group.label}</h3><span>{group.combinations.length} sums</span></div>
   <div class="lookup-layout">
    <section class="pair-lookup" aria-labelledby="pair-title"><h4 id="pair-title">Which two-digit numbers fit?</h4><p>Rows = tens · columns = units. Select a number to see its full sums.</p>
     <div class="pair-matrix" role="group" aria-label="Two-digit number lookup">
      <span class="axis-corner" aria-hidden="true">↘</span>{#each digits as digit}<span class="axis" aria-label={`Units ${digit}`}>{digit}</span>{/each}
      {#each digits as tens}<span class="axis" aria-label={`Tens ${tens}`}>{tens}</span>{#each digits as units}{@const number=tens*10+units}<button class:available={pairCounts[number]>0} class:selected={chosenNumber===number} disabled={!pairCounts[number]} aria-label={`${number}: ${pairCounts[number]} combinations`} aria-pressed={chosenNumber===number} title={`${pairCounts[number]} combinations`} onclick={()=>chosenNumber=chosenNumber===number?null:number}>{number}</button>{/each}{/each}
     </div>
     {#if chosenNumber!==null}<button class="reset" onclick={()=>chosenNumber=null}>Clear {chosenNumber} filter ×</button>{:else}<p class="matrix-hint">Colored numbers appear in at least one valid sum.</p>{/if}
    </section>
    <section class="results" aria-labelledby="sums-title">
     <label class="search">Find a number or several numbers<input type="search" bind:value={query} placeholder="e.g. 24 or 24, 76"/></label>
     <div class="results-heading"><h4 id="sums-title">Full combinations</h4><span aria-live="polite">{matches.length} / {group.combinations.length}</span></div>
     <div class="sums">
      {#each matches as combination}<div class="sum" aria-label={`${combination.text} equals 100`}>{#each combination.values as value,index}{#if index}<span class="plus">+</span>{/if}<strong class:chosen={value===chosenNumber}>{value}</strong>{/each}<span class="equals">= 100</span></div>{:else}<p class="no-results">No combinations contain these numbers. Try another group or clear the filters.</p>{/each}
     </div>
    </section>
   </div>
  </div>
 </div>
</section>

<style>
 .hundred-tool{margin:24px 0;padding:28px;background:#fff;border:1px solid #dce1d6;border-radius:10px;color:#20382e}header{display:flex;justify-content:space-between;gap:30px;padding-bottom:24px;border-bottom:1px solid #dce1d6}h2{font-size:32px;margin:0 0 8px}header p:not(.eyebrow){max-width:620px;margin:0;color:#697467;line-height:1.55}.eyebrow{font-size:11px;font-weight:700;letter-spacing:1.4px;color:#6a7869;margin:0 0 8px}.total{display:flex;flex-direction:column;justify-content:center;text-align:right;flex-shrink:0}.total strong{font-size:36px;font-weight:500}.total span{font-size:12px;color:#697467}.workspace{display:grid;grid-template-columns:240px minmax(0,1fr);gap:28px;margin-top:24px}h3,h4{margin:0}.group-picker h3{font-size:13px;margin-bottom:12px}.group-picker button{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;text-align:left;background:#f8faf6;border:1px solid #dce1d6;border-radius:8px;padding:13px 12px;margin-bottom:8px;color:#415948;line-height:1.45;font:inherit;font-size:13px;cursor:pointer}.group-picker button b{background:#e9eee4;border-radius:5px;padding:3px 6px;font-size:11px}.group-picker button.active{background:#244d3b;color:white;border-color:#244d3b}.group-picker button.active b{background:#476a57;color:#fff}.group-picker p{font-size:12px;color:#697467;line-height:1.7;margin:20px 0 12px}a{color:#315e43;font-size:13px}.group-heading{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:24px}.group-heading h3{font-size:19px}.group-heading>span{font-size:12px;color:#697467;white-space:nowrap}.lookup-layout{display:grid;grid-template-columns:minmax(250px,330px) minmax(0,1fr);gap:24px}.pair-lookup h4,.results h4{font-size:14px}.pair-lookup p{font-size:12px;color:#697467;line-height:1.5}.pair-matrix{display:grid;grid-template-columns:20px repeat(9,minmax(0,1fr));gap:3px}.axis{display:grid;place-items:center;font-size:11px;font-weight:700;color:#6c796b}.axis-corner{font-size:12px;color:#8a9385}.pair-matrix button{aspect-ratio:1;padding:0;border:1px solid #ebeee7;border-radius:4px;background:#fafbf8;color:#b7bdb1;font-size:clamp(10px,1vw,13px);font-weight:500;cursor:pointer}.pair-matrix button:disabled{cursor:default}.pair-matrix button.available{background:#e0eee4;border-color:#b9d0c0;color:#244d3b}.pair-matrix button.selected{background:#244d3b;color:#fff;border-color:#244d3b}.reset{margin-top:12px;border:0;background:transparent;color:#315e43;padding:0;font-size:12px;cursor:pointer}.matrix-hint{font-size:11px!important}.search{display:flex;flex-direction:column;gap:8px;font-size:12px;color:#697467}.search input{width:100%;box-sizing:border-box;padding:11px 12px;font:inherit;font-size:14px;border:1px solid #c5cec4;border-radius:7px;background:#fbfcf9}.results-heading{display:flex;justify-content:space-between;gap:12px;align-items:center;margin:20px 0 10px}.results-heading span{font-size:12px;color:#697467}.sums{display:grid;gap:7px;max-height:650px;overflow:auto;padding-right:4px}.sum{display:flex;align-items:center;gap:7px;padding:12px;border:1px solid #dce1d6;border-radius:7px;background:#f8faf6;font-variant-numeric:tabular-nums;flex-wrap:wrap}.sum strong{font-size:17px;font-weight:500;color:#244d3b}.sum strong.chosen{background:#d2e7d9;border-radius:4px;padding:2px 4px}.plus{color:#99a394}.equals{font-size:12px;color:#8b9787;margin-left:auto}.no-results{font-size:13px;line-height:1.6;color:#697467}@media(max-width:1050px){.lookup-layout{grid-template-columns:1fr}.pair-lookup{max-width:400px}.pair-matrix button{font-size:14px}}@media(max-width:760px){.hundred-tool{padding:18px}header{gap:18px}.total strong{font-size:28px}.total span{max-width:100px}h2{font-size:28px}.workspace{grid-template-columns:1fr}.group-picker{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.group-picker h3,.group-picker p,.group-picker a{grid-column:1/-1}.group-picker button{margin:0}.group-picker p{margin:8px 0}.group-heading{margin-bottom:18px}.pair-lookup{max-width:460px}.sums{max-height:500px}}
</style>
