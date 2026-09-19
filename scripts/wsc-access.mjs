// Shared by Vercel routing middleware and the local Vite server.
const PASSWORD = 'กู้ชาติ';
const COOKIE = 'wsc2026-access';
async function credential() {
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('wsc2026-access-v1:'+PASSWORD));
 return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function wscAccess(request) {
 const url=new URL(request.url);
 if(!url.pathname.startsWith('/wsc2026'))return null;
 const headers={'Cache-Control':'private, no-store'};
 if(url.pathname==='/wsc2026/access') {
  if(request.method!=='POST')return new Response(null,{status:405,headers});
  if(request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return new Response(null,{status:403,headers});
  let payload;try{const text=await request.text();if(text.length>1024)throw Error();payload=JSON.parse(text);}catch{return new Response(null,{status:400,headers});}
  if(payload.password!==PASSWORD)return new Response(null,{status:401,headers});
  return new Response(null,{status:204,headers:{...headers,'Set-Cookie':`${COOKIE}=${await credential()}; Path=/wsc2026; Max-Age=31536000; HttpOnly; SameSite=Strict${url.protocol==='https:'?'; Secure':''}`}});
 }
 // The entry document contains the password form; its app body is also gated.
 if(['/wsc2026','/wsc2026/','/wsc2026/index','/wsc2026/index.html'].includes(url.pathname))return null;
 const cookies=(request.headers.get('cookie')||'').split(';').map(s=>s.trim());
 if(cookies.includes(`${COOKIE}=${await credential()}`))return null;
 const destination='/wsc2026/?returnTo='+encodeURIComponent(url.pathname+url.search);
 return new Response(null,{status:302,headers:{...headers,Location:destination}});
}
