import {generatePracticeSet} from './vibhishana.mjs';
self.onmessage=({data})=>{try{self.postMessage({set:generatePracticeSet(data.type,data.seed,data.size)});}catch(error){self.postMessage({error:error.message});}};
