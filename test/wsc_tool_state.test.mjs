import assert from 'node:assert/strict';
import {test} from 'node:test';
import {validateToolState,parseToolBackup,loadToolState,saveToolState} from '../docs/src/wsc2026/toolState.mjs';
import {createToolSearch} from '../docs/src/wsc2026/toolSearch.mjs';
const flower=()=>({values:Array(90).fill(0),givens:Array(90).fill(false),centerNotes:Array.from({length:90},()=>[]),cornerNotes:Array.from({length:90},()=>[]),selected:0,mode:'normal',editMode:'set'});
test('backups validate before restoration, preserving notes and givens',()=>{
 const state=flower();state.values[0]=4;state.givens[0]=true;state.centerNotes[1]=[2,6];
 assert.deepEqual(parseToolBackup(JSON.stringify({version:1,tool:'flower',state}),'flower'),state);
 assert.throws(()=>parseToolBackup(JSON.stringify({version:1,tool:'flower',state}),'pentagram'));
 state.values[0]=10;assert.equal(validateToolState('flower',state),false);
 assert.equal(validateToolState('blind',{board:[null],solution:[],entries:[],revealed:[]}),false);
 assert.equal(validateToolState('hundred',{groupIndex:6,chosenNumber:24,query:'24'}),true);
});
test('unavailable or corrupted local storage does not discard a usable editor',()=>{
 globalThis.localStorage={getItem:()=>'{bad json',setItem:()=>{throw new Error('Quota exceeded');}};
 assert.equal(loadToolState('flower'),null);assert.equal(saveToolState('flower',flower()),false);
 delete globalThis.localStorage;
});
test('cancelling terminates the worker and ignores a late result',async()=>{
 const workers=[],busy=[];
 class FakeWorker{constructor(){workers.push(this);}postMessage(data){this.sent=data;}terminate(){this.terminated=true;}}
 globalThis.Worker=FakeWorker;
 try{
  const search=createToolSearch(value=>busy.push(value));const first=search.run('flower','generate',{clues:30}),old=workers[0];
  search.cancel();assert.equal(await first,null);assert.ok(old.terminated);
  const second=search.run('pentagram','solve',{values:[]});old.onmessage({data:{result:{status:'solved',solution:[1]}}});
  assert.equal(workers[1].terminated,undefined);workers[1].onmessage({data:{result:{status:'solved',solution:[2]}}});
  assert.deepEqual((await second).solution,[2]);assert.deepEqual(busy,[true,false,true,false]);
 }finally{delete globalThis.Worker;}
});
