import { wscAccess } from './wsc-access.mjs';
function install(server) {
 server.middlewares.use(async(req,res,next)=>{
  if(!req.url?.startsWith('/wsc2026'))return next();
  const origin=`${req.socket.encrypted?'https':'http'}://${req.headers.host}`;
  try {
   let body;
   if(req.method==='POST') {
    const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>1024){res.statusCode=413;res.end();return;}chunks.push(chunk);}body=Buffer.concat(chunks);
   }
   const request=new Request(new URL(req.url,origin),{method:req.method,headers:req.headers,body});
   const response=await wscAccess(request);
   res.setHeader('Cache-Control','private, no-store');
   if(!response)return next();
   res.statusCode=response.status;response.headers.forEach((v,k)=>res.setHeader(k,v));res.end(Buffer.from(await response.arrayBuffer()));
  }catch{res.statusCode=500;res.end('Unable to check WSC access.');}
 });
}
export function wscAccessPlugin(){return {name:'wsc-access',configureServer:install,configurePreviewServer:install};}
