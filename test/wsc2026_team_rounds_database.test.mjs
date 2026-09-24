import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const db = new PGlite();
await db.exec('create role anon; create role authenticated;');
for (const name of ['20260918000000_wsc2026_practice.sql', '20260923000000_wsc2026_team_rounds.sql']) {
  await db.exec(readFileSync(`supabase/migrations/${name}`, 'utf8'));
}
const rounds = await db.query('select id, name, points, booklet_available from public.wsc2026_rounds where id in (8,9,13,14,15) order by id');
assert.deepEqual(rounds.rows.map(r => r.points), [1200, 800, 1600, 1800, 1200]);
assert(rounds.rows.every(r => r.booklet_available));
const entries = await db.query('select count(*)::integer as count from public.wsc2026_booklet_entries');
assert.equal(entries.rows[0].count, 130);
const unallocated = await db.query('select count(*)::integer as count from public.wsc2026_booklet_entries where round_id in (13,14) and points is null');
assert.equal(unallocated.rows[0].count, 21);
await db.close();
