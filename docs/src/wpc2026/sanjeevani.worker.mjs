import {generatePyramid} from './sanjeevani.mjs';
self.onmessage=({data})=>{try{self.postMessage({puzzle:generatePyramid(data.layers,data.seed)});}catch(error){self.postMessage({error:error.message});}};
