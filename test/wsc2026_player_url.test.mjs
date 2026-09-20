import assert from 'node:assert/strict';
import test from 'node:test';
import links from '../docs/src/wsc2026/round1Playable.json' with { type: 'json' };

globalThis.location={origin:'https://sudotoku.example'};
const {playerUrl}=await import('../docs/src/wsc2026/url.mjs');

function rawParameter(source,name){
 const match=new RegExp(`(?:^|&)${name}=([^&]*)`).exec(source);
 return match?.[1]||'';
}

test('playerUrl preserves Base64 puzzle and answer payload bytes',()=>{
 for(const [id,link] of Object.entries(links)){
  const original=new URL(link).hash.slice(1);
  const normalized=playerUrl(link).slice(2);
  assert.equal(rawParameter(normalized,'p'),rawParameter(original,'p'),`${id} puzzle payload`);
  assert.equal(rawParameter(normalized,'a'),rawParameter(original,'a'),`${id} answer payload`);
  const puzzlePayload=rawParameter(normalized,'p'),answerPayload=rawParameter(normalized,'a');
  assert.doesNotMatch(puzzlePayload,/%[0-9a-f]{2}|\s/i,`${id} puzzle payload remains raw Base64`);
  assert.doesNotMatch(answerPayload,/%[0-9a-f]{2}|\s/i,`${id} answer payload remains raw Base64`);
  assert.doesNotThrow(()=>atob(puzzlePayload),`${id} puzzle payload decodes`);
  assert.doesNotThrow(()=>atob(answerPayload),`${id} answer payload decodes`);
 }
});
