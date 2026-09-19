importScripts('/js/sudoku_variants/wsc_rules.js','/js/wsc_topology.js');
onmessage=function(event){try{postMessage({result:WscTopology.solve(event.data)});}catch(e){postMessage({error:e.message});}};
