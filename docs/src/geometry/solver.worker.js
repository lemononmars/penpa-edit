import '../../js/sudoku_variants/wsc_rules.js';
import '../../js/wsc_topology.js';

self.onmessage=event=>{
 try { self.postMessage({result:self.WscTopology.deduce(event.data,{maxNodes:300000})}); }
 catch(error){self.postMessage({error:error.message});}
};
