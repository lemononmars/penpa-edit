-- WSC practice: five-member groups, shared puzzles, private attempts and round plans.
-- Passwordless device credentials are random UUIDs; usernames are labels, never authorization.
create table public.wsc2026_rounds (id integer primary key check(id between 1 and 16), name text not null, minutes integer, points integer, booklet_available boolean not null);
insert into public.wsc2026_rounds values
(1,'Kuru Clan',55,600,true),
(2,'Pandu Putra',35,350,true),
(3,'Kauravas',50,650,true),
(4,'Acharya Drona',35,350,true),
(5,'Escape from Lakshagriha',40,450,true),
(6,'Quest for Celestial Weapons',45,500,true),
(7,'Pandavas in Disguise',50,700,true),
(8,'Team Round',null,null,false),
(9,'Team Round',null,null,false),
(10,'Dharma Yuddha',75,900,true),
(11,'Arjuna''s Revenge',35,350,true),
(12,'Ashwatthama is Dead?',40,400,true),
(13,'Team Round',null,null,false),
(14,'Team Round',null,null,false),
(15,'Team Round',null,null,false),
(16,'The Final Duel',60,450,true);
create table public.wsc2026_booklet_entries (id text primary key, round_id integer not null references public.wsc2026_rounds, name text not null, variant_id text not null, points integer not null);
insert into public.wsc2026_booklet_entries values
('r01-01',1,'Classic Sudoku','classic',25),
('r01-02',1,'Killer Sudoku','killer',90),
('r01-03',1,'Irregular Sudoku','irregular',30),
('r01-04',1,'Toroidal Sudoku','toroidal',120),
('r01-05',1,'Diagonal Sudoku','diagonal',75),
('r01-06',1,'Non Consecutive Sudoku','non consecutive',45),
('r01-07',1,'Extra Region Sudoku','extraregion',70),
('r01-08',1,'Odd Even Sudoku','odd even',80),
('r01-09',1,'Outside Sudoku','outside',65),
('r02-01',2,'Samurai Sudoku','samurai',350),
('r03-01',3,'Hundred Sudoku','hundred',55),
('r03-02',3,'Disjoint Hundred Sudoku','disjointhundred',80),
('r03-03',3,'Edge Difference Hundred Sudoku','edgedifferencehundred',105),
('r03-04',3,'Anti Diagonal Hundred Sudoku','antidiagonalhundred',55),
('r03-05',3,'Outside 234 Hundred Sudoku','outside234hundred',100),
('r03-06',3,'Inequality Hundred Sudoku','inequalityhundred',110),
('r03-07',3,'Sequence Hundred Sudoku','sequencehundred',60),
('r03-08',3,'Skyscraper Hundred Sudoku','skyscraperhundred',85),
('r04-01',4,'Classic Sudoku','classic',15),
('r04-02',4,'Classic Sudoku','classic',25),
('r04-03',4,'Classic Sudoku','classic',25),
('r04-04',4,'Classic Sudoku','classic',30),
('r04-05',4,'Classic Sudoku','classic',40),
('r04-06',4,'Classic Sudoku','classic',65),
('r04-07',4,'Classic Sudoku','classic',50),
('r04-08',4,'Classic Sudoku','classic',30),
('r04-09',4,'Classic Sudoku','classic',70),
('r05-01',5,'Flame Path Sudoku','flamepath',30),
('r05-02',5,'Sudoku with Names','sudokuwithnames',75),
('r05-03',5,'Coded Sudoku','coded',60),
('r05-04',5,'Tunnel Sudoku','tunnel',75),
('r05-05',5,'S for Sudoku','sforsudoku',75),
('r05-06',5,'Number 5 Still Alive Sudoku','number5stillalive',65),
('r05-07',5,'Escape Sudoku','wscescape',70),
('r06-01',6,'Attack the Leader Sudoku','attacktheleader',50),
('r06-02',6,'Fractal Sudoku','fractal',40),
('r06-03',6,'Trishula Sudoku','trishula',40),
('r06-04',6,'Divisor Sum Pairs Sudoku','divisorsumpairs',60),
('r06-05',6,'Magic Sword Sudoku','magicsword',75),
('r06-06',6,'Neighbouring Disparity Sudoku','neighbouringdisparity',95),
('r06-07',6,'Index to One Sudoku','indextoone',80),
('r06-08',6,'Prime Run Sum Sudoku','primerunsum',60),
('r07-01',7,'Arrow Sudoku','arrow',45),
('r07-02',7,'Missing Arrow Sudoku','missingarrow',95),
('r07-03',7,'Thermo Sudoku','thermo',60),
('r07-04',7,'Missing Thermo Sudoku','missingthermo',50),
('r07-05',7,'Kropki Pairs Sudoku','kropkipairs',25),
('r07-06',7,'Transparent Kropki Pairs Sudoku','transparentkropkipairs',40),
('r07-07',7,'Distances Sudoku','distances',80),
('r07-08',7,'Unordered Distances Sudoku','unordereddistances',75),
('r07-09',7,'Next to 9 Sudoku','nextto9',70),
('r07-10',7,'Next to x Sudoku','nexttox',70),
('r07-11',7,'Queen Sudoku','queen',45),
('r07-12',7,'Disguised Queen Sudoku','disguisedqueen',45),
('r10-01',10,'Diagonal Sudoku','diagonal',40),
('r10-02',10,'Anti Diagonal Sudoku','anti diagonal',35),
('r10-03',10,'Windoku','windoku',30),
('r10-04',10,'Anti Windoku','antiwindoku',35),
('r10-05',10,'Creasing Sudoku','creasing',35),
('r10-06',10,'Alternating Stripes Sudoku','alternatingstripes',70),
('r10-07',10,'Clone Sudoku','clone',65),
('r10-08',10,'Anti Clone Sudoku','anticlone',40),
('r10-09',10,'Inclusion Sudoku','quadruple',55),
('r10-10',10,'Exclusion Sudoku','exclusion',60),
('r10-11',10,'Maximin Sudoku','maximin',75),
('r10-12',10,'Minimax Sudoku','minimax',75),
('r10-13',10,'Touchy Sudoku','touchy',70),
('r10-14',10,'Non Consecutive Sudoku','non consecutive',25),
('r10-15',10,'Friends Sudoku','friends',55),
('r10-16',10,'Enemies Sudoku','enemies',55),
('r10-17',10,'Outside Sudoku','outside',25),
('r10-18',10,'Anti Outside Sudoku','antioutside',55),
('r11-01',11,'Classic Sudoku','classic',25),
('r11-02',11,'Classic Sudoku','classic',40),
('r11-03',11,'Classic Sudoku','classic',30),
('r11-04',11,'Classic Sudoku','classic',70),
('r11-05',11,'Classic Sudoku','classic',40),
('r11-06',11,'Classic Sudoku','classic',50),
('r11-07',11,'Classic Sudoku','classic',30),
('r11-08',11,'Classic Sudoku','classic',40),
('r11-09',11,'Classic Sudoku','classic',25),
('r12-01',12,'Pinocchio Sudoku','pinocchio',25),
('r12-02',12,'Expanded Sudoku','expanded',65),
('r12-03',12,'Inequality Sudoku','inequality',75),
('r12-04',12,'Multi Diagonal Sudoku','multidiagonal',40),
('r12-05',12,'Anti Knight Sudoku','anti knight',45),
('r12-06',12,'Extra Region Sudoku','extraregion',45),
('r12-07',12,'Star Sudoku','star',105),
('r16-qf01',16,'Outside 234 Sudoku','outside234',100),
('r16-qf02',16,'No Three in A Line Sudoku','nothreeinaline',100),
('r16-qf03',16,'Disguised Queen Sudoku','disguisedqueen',100),
('r16-qf04',16,'Killer Sudoku','killer',100),
('r16-sf01',16,'Even Sudoku','even',150),
('r16-sf02',16,'Odd Sudoku','odd',150),
('r16-f01',16,'Classic Sudoku','classic',200);
alter table public.wsc2026_rounds enable row level security;
alter table public.wsc2026_booklet_entries enable row level security;
create policy "Public WSC round reference" on public.wsc2026_rounds for select using (true);
create policy "Public WSC booklet reference" on public.wsc2026_booklet_entries for select using (true);
grant select on public.wsc2026_rounds,public.wsc2026_booklet_entries to anon,authenticated;

create table public.wsc2026_groups (
 id uuid primary key default gen_random_uuid(), name text not null check (length(name) between 1 and 80),
 invite_key uuid not null unique default gen_random_uuid(), created_at timestamptz not null default now()
);
create table public.wsc2026_members (
 id uuid primary key default gen_random_uuid(), group_id uuid not null references public.wsc2026_groups on delete cascade,
 username text not null check (username ~ '^[a-zA-Z0-9_-]{2,30}$'), device_key uuid not null unique,
 created_at timestamptz not null default now(), unique(group_id,username)
);
create unique index wsc2026_members_username on public.wsc2026_members(group_id,lower(username));
create table public.wsc2026_puzzles (
 id uuid primary key default gen_random_uuid(), group_id uuid not null references public.wsc2026_groups on delete cascade,
 created_by uuid not null references public.wsc2026_members, title text not null check(length(title) between 1 and 160),
 round_id integer not null references public.wsc2026_rounds, variant_id text not null,
 rules text not null default '', puzzle_url text not null default '', image text not null default '', solution_image text not null default '',
 created_at timestamptz not null default now(), check(length(image)<=4200000), check(length(solution_image)<=4200000),
 check(length(rules)<=10000), check(length(puzzle_url)<=20000), check(length(variant_id) between 1 and 100)
);
create table public.wsc2026_attempts (
 id uuid primary key default gen_random_uuid(), member_id uuid not null references public.wsc2026_members on delete cascade,
 puzzle_ref text not null, display_name text not null check(length(display_name) between 1 and 80),
 seconds integer not null check(seconds between 1 and 86400), outcome text not null check(outcome in ('solved','dnf','error')),
 notes text not null default '' check(length(notes)<=2000), solved_at timestamptz not null default now()
);
create table public.wsc2026_plans (
 member_id uuid not null references public.wsc2026_members on delete cascade, puzzle_ref text not null,
 round_id integer not null references public.wsc2026_rounds, planned boolean not null default true,
 primary key(member_id,puzzle_ref)
);
create index on public.wsc2026_puzzles(group_id,round_id);
create index on public.wsc2026_attempts(member_id,solved_at);
alter table public.wsc2026_groups enable row level security;
alter table public.wsc2026_members enable row level security;
alter table public.wsc2026_puzzles enable row level security;
alter table public.wsc2026_attempts enable row level security;
alter table public.wsc2026_plans enable row level security;
revoke all on public.wsc2026_groups, public.wsc2026_members, public.wsc2026_puzzles, public.wsc2026_attempts, public.wsc2026_plans from anon, authenticated;

create or replace function public.wsc2026_api(p_action text, p_token uuid, p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare m public.wsc2026_members; g public.wsc2026_groups; v_ref text; v_round integer; v_name text; v_id uuid;
begin
 if p_token is null then raise exception 'A device key is required.'; end if;
 select * into m from public.wsc2026_members where device_key=p_token;
 if p_action in ('create_group','join_group') then
  if m.id is not null then raise exception 'This device key already belongs to a member.'; end if;
  v_name=trim(p_payload->>'username');
  if v_name is null or v_name !~ '^[a-zA-Z0-9_-]{2,30}$' then raise exception 'Use 2-30 letters, numbers, underscores or hyphens for your username.'; end if;
  if p_action='create_group' then
   insert into public.wsc2026_groups(name) values(trim(p_payload->>'name')) returning * into g;
  else
   select * into g from public.wsc2026_groups where invite_key=(p_payload->>'invite')::uuid for update;
   if g.id is null then raise exception 'Group invite not found.'; end if;
  end if;
  if (select count(*) from public.wsc2026_members where group_id=g.id)>=5 then raise exception 'This group already has five members.'; end if;
  if exists(select 1 from public.wsc2026_members where group_id=g.id and lower(username)=lower(v_name)) then
   raise exception 'Username already registered. Restore its device key to use another browser.';
  end if;
  insert into public.wsc2026_members(group_id,username,device_key) values(g.id,v_name,p_token) returning * into m;
 end if;
 if m.id is null then raise exception 'Device key not recognized. Join a group or restore your key.'; end if;
 select * into g from public.wsc2026_groups where id=m.group_id;
 if p_action='add_puzzle' then
  if coalesce(p_payload->>'image','') !~ '^(data:image/(png|jpeg|webp);base64,|https://|$)' or coalesce(p_payload->>'solution_image','') !~ '^(data:image/(png|jpeg|webp);base64,|https://|$)' then raise exception 'Use a PNG, JPEG, WebP or HTTPS image.'; end if;
  if coalesce(p_payload->>'puzzle_url','') !~ '^(https?://|/[^/]|$)' then raise exception 'Invalid puzzle URL.'; end if;
  if coalesce(p_payload->>'image','')='' then raise exception 'Upload a printable puzzle image.'; end if;
  insert into public.wsc2026_puzzles(group_id,created_by,title,round_id,variant_id,rules,puzzle_url,image,solution_image)
  values(m.group_id,m.id,trim(p_payload->>'title'),(p_payload->>'round_id')::integer,p_payload->>'variant_id',coalesce(p_payload->>'rules',''),coalesce(p_payload->>'puzzle_url',''),p_payload->>'image',coalesce(p_payload->>'solution_image',''));
 elsif p_action in ('record','plan') then
  v_ref=p_payload->>'puzzle_ref'; v_round=(p_payload->>'round_id')::integer;
  if v_ref like 'practice:%' then
   if not exists(select 1 from public.wsc2026_puzzles where id=substring(v_ref from 10)::uuid and group_id=m.group_id and round_id=v_round) then raise exception 'Puzzle does not belong to this group or round.'; end if;
  elsif not exists(select 1 from public.wsc2026_booklet_entries where id=v_ref and round_id=v_round) then
   raise exception 'Invalid booklet puzzle reference.';
  end if;
  if p_action='record' then
   insert into public.wsc2026_attempts(member_id,puzzle_ref,display_name,seconds,outcome,notes) values(m.id,v_ref,trim(p_payload->>'display_name'),(p_payload->>'seconds')::integer,p_payload->>'outcome',coalesce(p_payload->>'notes',''));
  else
   insert into public.wsc2026_plans(member_id,puzzle_ref,round_id,planned) values(m.id,v_ref,v_round,(p_payload->>'planned')::boolean)
   on conflict(member_id,puzzle_ref) do update set planned=excluded.planned,round_id=excluded.round_id;
  end if;
 elsif p_action='delete_attempt' then
  delete from public.wsc2026_attempts where id=(p_payload->>'id')::uuid and member_id=m.id;
 elsif p_action not in ('state','create_group','join_group') then raise exception 'Unknown practice action.';
 end if;
 return jsonb_build_object(
  'member',jsonb_build_object('id',m.id,'username',m.username),
  'group',jsonb_build_object('id',g.id,'name',g.name,'invite',g.invite_key),
  'members',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'username',username) order by created_at),'[]'::jsonb) from public.wsc2026_members where group_id=g.id),
  'puzzles',(select coalesce(jsonb_agg(to_jsonb(p) order by created_at desc),'[]'::jsonb) from public.wsc2026_puzzles p where group_id=g.id),
  'attempts',(select coalesce(jsonb_agg(to_jsonb(a) order by solved_at desc),'[]'::jsonb) from public.wsc2026_attempts a where member_id=m.id),
  'plans',(select coalesce(jsonb_agg(to_jsonb(c)),'[]'::jsonb) from public.wsc2026_plans c where member_id=m.id));
end $$;
revoke all on function public.wsc2026_api(text,uuid,jsonb) from public;
grant execute on function public.wsc2026_api(text,uuid,jsonb) to anon,authenticated;
