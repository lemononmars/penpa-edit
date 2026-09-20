import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
const db=new PGlite();await db.exec('create role anon;create role authenticated;');
for(const name of ['20260918000000_wsc2026_practice.sql','20260919000000_wsc2026_single_team.sql','20260920000000_wsc2026_dev_links.sql','20260920010000_wsc2026_anonymous_links.sql','20260920020000_wsc2026_repair_team.sql','20260920030000_wsc2026_repair_private_api.sql','20260920040000_wsc2026_seven_members.sql'])await db.exec(fs.readFileSync('supabase/migrations/'+name,'utf8'));
await db.exec('set role anon');
async function api(action,key,payload={},password='กู้ชาติ'){return (await db.query('select public.wsc2026_api($1,$2::uuid,$3::jsonb) as data',[action,key,JSON.stringify({...payload,password})])).rows[0].data;}
const keys=Array.from({length:8},()=>randomUUID());
await assert.rejects(()=>api('join',keys[0],{username:'alice'},'wrong'),/password/);
const alice=await api('join',keys[0],{username:'alice'});
await assert.rejects(()=>api('create_group',keys[1],{username:'bob',name:'Other'}),/shared WSC team/);
for(let i=1;i<7;i++){const state=await api('join',keys[i],{username:'user'+i});assert.equal(state.group.id,alice.group.id);}
await assert.rejects(()=>api('join',keys[7],{username:'eighth'}),/seven members/);
await api('record',keys[0],{puzzle_ref:'r01-01',round_id:1,display_name:'Alice',seconds:23,outcome:'solved'});
assert.equal((await api('state',keys[1])).attempts.length,0);assert.equal((await api('state',keys[0])).attempts.length,1);
const linked=await api('add_link',keys[0],{booklet_ref:'r04-02',puzzle_url:'/#m=solve&p=saved-puzzle'});assert.equal(linked.puzzles[0].booklet_ref,'r04-02');assert.equal(linked.puzzles[0].round_id,4);assert.equal(linked.puzzles[0].variant_id,'classic');
const anonymousKey=randomUUID();const anonymous=await api('add_link',anonymousKey,{booklet_ref:'r06-05',puzzle_url:'/#m=solve&p=anonymous-puzzle'});assert.equal(anonymous.puzzles[0].booklet_ref,'r06-05');assert.equal(anonymous.puzzles[0].created_by,null);assert.equal((await api('links',anonymousKey)).puzzles.length,2);
await assert.rejects(()=>api('add_link',keys[0],{booklet_ref:'missing',puzzle_url:'/#p=saved'}),/Choose a WSC booklet puzzle/);
await assert.rejects(()=>api('add_link',keys[0],{booklet_ref:'r04-02',puzzle_url:'javascript:alert(1)'}),/valid saved/);
await assert.rejects(()=>db.query("select public.wsc2026_private_api('state',$1::uuid,'{}'::jsonb)",[keys[0]]),/permission denied/);
console.log('PASS single team, password enforcement, anonymous shared links, seven-member cap, private records, no legacy RPC bypass');await db.close();
