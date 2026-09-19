import assert from 'node:assert/strict';import {wscAccess} from '../scripts/wsc-access.mjs';
const origin='https://practice.example';
const req=(path,init={})=>new Request(origin+path,init);
for(const path of ['/wsc2026/WSC2026IB.pdf','/wsc2026/r01-01.png','/wsc2026/clue-guide.html','/wsc2026/clue-guide']){
 const response=await wscAccess(req(path));assert.equal(response.status,302);assert(response.headers.get('location').startsWith('/wsc2026/?returnTo='));
}
assert.equal(await wscAccess(req('/wsc2026/?tab=solver')),null);
assert.equal((await wscAccess(req('/wsc2026/access',{method:'POST',body:JSON.stringify({password:'wrong'})}))).status,401);
const unlocked=await wscAccess(req('/wsc2026/access',{method:'POST',body:JSON.stringify({password:'กู้ชาติ'})}));assert.equal(unlocked.status,204);
const cookie=unlocked.headers.get('set-cookie');assert(cookie.includes('HttpOnly'));assert(cookie.includes('Secure'));
assert.equal(await wscAccess(req('/wsc2026/WSC2026IB.pdf',{headers:{cookie:cookie.split(';')[0]}})),null);
assert.equal((await wscAccess(req('/wsc2026/access',{method:'POST',headers:{Origin:'https://elsewhere.example'},body:JSON.stringify({password:'กู้ชาติ'})}))).status,403);
console.log('PASS protected PDF/image/guide URLs, password validation, cookie access and origin checks');
