import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
const db=new PGlite();await db.exec('create role anon; create role authenticated;');await db.exec(fs.readFileSync('supabase/migrations/20260918000000_wsc2026_practice.sql','utf8'));await db.exec('set role anon');
async function api(action,token,payload={}){const r=await db.query('select public.wsc2026_api($1,$2::uuid,$3::jsonb) as data',[action,token,JSON.stringify(payload)]);return r.rows[0].data;}
const alice=randomUUID(),bob=randomUUID(),outsider=randomUUID();let state=await api('create_group',alice,{username:'alice',name:'Test team'});const invite=state.group.invite;const sb=await api('join_group',bob,{username:'bob',invite});assert.equal(sb.members.length,2);
await api('record',alice,{puzzle_ref:'r01-01',round_id:1,display_name:'Alice',seconds:123,outcome:'solved'});assert.equal((await api('state',bob)).attempts.length,0);assert.equal((await api('state',alice)).attempts.length,1);
await api('plan',alice,{puzzle_ref:'r01-01',round_id:1,planned:true});assert.equal((await api('state',alice)).plans[0].planned,true);assert.equal((await api('state',bob)).plans.length,0);
await api('plan',alice,{puzzle_ref:'r01-01',round_id:1,planned:false});assert.equal((await api('state',alice)).plans[0].planned,false);
state=await api('add_puzzle',alice,{title:'Sample',round_id:5,variant_id:'tunnel',image:'data:image/png;base64,aGVsbG8='});assert.equal((await api('state',bob)).puzzles.length,1);
await api('create_group',outsider,{username:'outsider',name:'Other team'});await assert.rejects(()=>api('record',outsider,{puzzle_ref:'practice:'+state.puzzles[0].id,round_id:5,display_name:'No',seconds:5,outcome:'solved'}),/does not belong/);
for(let i=0;i<3;i++)await api('join_group',randomUUID(),{username:'user'+i,invite});await assert.rejects(()=>api('join_group',randomUUID(),{username:'sixth',invite}),/five members/);
await assert.rejects(()=>api('state',randomUUID()),/not recognized/);await assert.rejects(()=>db.query('select * from public.wsc2026_members'),/permission denied/);await assert.rejects(()=>db.query('select * from public.wsc2026_attempts'),/permission denied/);
await assert.rejects(()=>api('add_puzzle',alice,{title:'Bad',round_id:1,variant_id:'classic',image:'javascript:alert(1)'}),/PNG/);
await assert.rejects(()=>api('record',alice,{puzzle_ref:'r01-01',round_id:2,display_name:'Alice',seconds:3,outcome:'solved'}),/reference/);
await assert.rejects(()=>api('record',alice,{puzzle_ref:'r01-01',round_id:1,display_name:'Alice',seconds:-1,outcome:'solved'}));
console.log('PASS: migration, five-member cap, shared puzzles, private attempts/plans, token recovery, RLS and cross-group rejection');await db.close();
