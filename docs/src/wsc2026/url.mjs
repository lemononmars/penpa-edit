export function safeUrl(value) {
 try { const url=new URL(value,location.origin); return ['http:','https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}

export function playerUrl(value) {
 const href=safeUrl(value);if(!href)return '';
 const url=new URL(href);
 const hash=url.hash.slice(1),query=url.search.slice(1);
 const hasPuzzle=source=>source.split('&').some(part=>part.startsWith('p=')&&part.length>2);
 const source=hasPuzzle(hash)?hash:hasPuzzle(query)?query:'';
 if(!source)return '';
 let foundMode=false;
 const parts=source.split('&').map(part=>{
  const separator=part.indexOf('='),key=separator<0?part:part.slice(0,separator);
  if(key==='m'){foundMode=true;return 'm=solve';}
  return part;
 });
 if(!foundMode)parts.unshift('m=solve');
 return '/#'+parts.join('&');
}
