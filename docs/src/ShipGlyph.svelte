<script lang="ts">
 export let x=0;export let y=0;export let size=58;export let connections=0;
 $: s=size*.34;
 $: angle=connections===1?-90:connections===2?0:connections===4?90:180;
 $: single=connections===0;
 $: head=[1,2,4,8].includes(connections);
</script>
<g transform={`translate(${x} ${y})`} class="ship-glyph">
 {#if single}<circle r={s} class="single"/>
 {:else if head}<path transform={`rotate(${angle})`} d={`M 0 ${-s} H ${size*.42} V ${s} H 0 A ${s} ${s} 0 0 1 0 ${-s} Z`} class="head"/>
 {:else}<rect x={-s} y={-s} width={s*2} height={s*2} class="middle"/>{/if}
</g>
<style>.ship-glyph{fill:#2875ae;pointer-events:none}</style>
