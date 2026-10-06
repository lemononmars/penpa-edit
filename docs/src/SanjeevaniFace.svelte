<script lang="ts">export let marks:any[]=[];</script>
<svg viewBox="0 0 128 128" aria-hidden="true">
 <defs><clipPath id="face-clip"><rect width="128" height="128"/></clipPath></defs>
 <rect width="128" height="128" fill="#fffdf8"/>
 <g clip-path="url(#face-clip)">
 {#each [...marks].sort((a,b)=>(a.kind==='shade'?-1:0)-(b.kind==='shade'?-1:0)) as mark}
  <g transform={`translate(${64+mark.x*32} ${64-mark.y*32}) rotate(${-(mark.turn||0)*90}) scale(${mark.mirror?-1:1} 1)`}>
   {#if mark.kind==='shade'}<rect x={-mark.size*32} y={-mark.size*32} width={mark.size*64} height={mark.size*64} fill="#b9bcb7"/>
   {:else if mark.kind==='dot'}<circle r={mark.size*32} fill={mark.value==='white'?'#fffdf8':'#121915'} stroke="#121915" stroke-width="2"/>
   {:else if mark.kind==='star'}{@const radius=mark.size*14.7}<path d={`M${-radius} 0H${radius}M${-radius*.5} ${-radius*.866}L${radius*.5} ${radius*.866}M${-radius*.5} ${radius*.866}L${radius*.5} ${-radius*.866}`} stroke="#121915" stroke-width="2.5"/>
   {:else}<text y={mark.size*1.3} font-size={mark.size*37.8}>{mark.value}</text>{/if}
  </g>
 {/each}
 </g><rect x=".5" y=".5" width="127" height="127" fill="none" stroke="#34483d"/>
</svg>
<style>svg{display:block;width:100%;height:auto}text{font-family:Arial,sans-serif;font-weight:700;fill:#121915;text-anchor:middle;dominant-baseline:middle}</style>
