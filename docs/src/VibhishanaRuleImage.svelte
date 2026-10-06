<script lang="ts">
 export let type:string;export let rule:number;
</script>
<svg viewBox="0 0 150 88" role="img" aria-label={`Rule ${rule} illustration`}>
 <rect x="1" y="1" width="148" height="86" rx="7" fill="#f7f9f5" stroke="#dae2d7"/>
 {#if type==='loops'}
  {#if rule===1}<path d="M35 20H115V66H35Z" class="loop"/>{#each [[35,20],[75,20],[115,20],[35,43],[115,43],[35,66],[75,66],[115,66]] as p}<circle cx={p[0]} cy={p[1]} r="4" fill="white" stroke="#20382e"/>{/each}
  {:else if rule===2}<path d="M25 66V25H70 M90 25H135" class="loop"/><circle cx="25" cy="25" r="8" fill="#20382e"/><circle cx="112" cy="25" r="8" fill="white" stroke="#20382e" stroke-width="2"/>
  {:else if rule===3}<path d="M25 25H125V64H25Z" class="loop"/>{#each [[25,25],[125,25],[125,64],[25,64]] as p,i}<circle cx={p[0]} cy={p[1]} r="8" fill={i%2?'white':'#20382e'} stroke="#20382e" stroke-width="2"/>{/each}
  {:else}<rect x="62" y="32" width="26" height="26" fill="#c6ccc5"/><text x="75" y="50">2</text><path d="M30 65V20H110V40H130" class="loop"/><circle cx="30" cy="20" r="5" class="accent"/><circle cx="110" cy="20" r="5" class="accent"/>{/if}
 {:else if type==='shading'}
  {#if rule===1||rule===3}{#each Array(9) as _,i}<rect x={42+i%3*22} y={12+Math.floor(i/3)*22} width="22" height="22" fill={(rule===1?[0,2,3,7]:[1,3,5,7]).includes(i)?'#54775d':'white'} stroke="#a9b9a9"/>{/each}<circle cx="75" cy="45" r="11" fill="white" stroke="#20382e"/><text x="75" y="50">4</text>
  {:else if rule===2}<rect x="22" y="17" width="105" height="54" fill="white" stroke="#20382e" stroke-width="2"/>{#each [0,1,2] as i}<rect x={49+i*25} y="42" width="24" height="26" fill="#54775d"/>{/each}<text x="33" y="32" class="small">3</text>
  {:else}{#each [0,1,2,3] as i}<rect x={25+i*25} y="31" width="25" height="25" fill="#54775d" stroke="white"/>{/each}<path d="M30 66L120 20" class="bad"/>{/if}
 {:else if type==='numbers'}
  {#if rule===1}{#each [1,3,5] as v,i}<text x={42+i*33} y="47">{v}</text>{/each}<path d="M25 65L125 23" class="bad"/>
  {:else if rule===2}<text x="19" y="43">3</text>{#each [2,1,4,3,6] as v,i}<rect x={35+i*19} y={68-v*7} width="15" height={v*7} fill="#54775d"/>{/each}
  {:else if rule===3}<text x="17" y="48">3</text>{#each [5,3,1,4] as v,i}<rect x={35+i*24} y="27" width="24" height="30" fill={i<2?'#dcefd7':'white'} stroke="#a9b9a9"/><text x={47+i*24} y="48">{v}</text>{/each}
  {:else}<rect x="35" y="22" width="80" height="44" fill="white" stroke="#20382e" stroke-dasharray="4 3"/><text x="55" y="49">1</text><text x="95" y="49">2</text>{/if}
 {:else}
  {#if rule===1}{#each Array(9) as _,i}<rect x={42+i%3*22} y={12+Math.floor(i/3)*22} width="22" height="22" fill={[0,1,7].includes(i)?'#54775d':'white'} stroke="#a9b9a9"/>{/each}<text x="75" y="50">3</text>
  {:else if rule===2}<text x="20" y="48">3</text>{#each [0,1,2,3,4] as i}<rect x={35+i*19} y="29" width="19" height="25" fill={i<3?'#54775d':'white'} stroke="#a9b9a9"/>{/each}
  {:else if rule===3}<rect x="44" y="22" width="25" height="25" fill="#54775d"/><rect x="69" y="47" width="25" height="25" fill="#54775d"/><path d="M45 72L103 20" class="bad"/>
  {:else}{#each [3,2,1] as length,i}{#each Array(length) as _,j}<rect x={28+j*24} y={10+i*24} width="22" height="20" fill="#54775d"/>{/each}{/each}{/if}
 {/if}
</svg>
<style>svg{display:block;width:100%;max-width:180px;margin:6px auto;user-select:none}text{font:20px Arial;text-anchor:middle;fill:#20382e}.small{font-size:12px}.loop{fill:none;stroke:#315e43;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.accent{fill:#e8b440;stroke:white}.bad{fill:none;stroke:#b75a4d;stroke-width:3}</style>
