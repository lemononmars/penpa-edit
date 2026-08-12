-- Run this after the existing 20260809 battle migrations.
-- It adds authenticated profiles, Glicko-2 ranked 1v1 battles, and public
-- classic-Sudoku Swiss tournaments for up to 64 players.

create table if not exists public.battle_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 24),
  rating double precision not null default 1500,
  rating_deviation double precision not null default 350,
  volatility double precision not null default 0.06,
  rated_games integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  draws integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.battle_profiles enable row level security;
drop policy if exists "battle profiles are readable" on public.battle_profiles;
create policy "battle profiles are readable" on public.battle_profiles for select using (true);
drop policy if exists "users update their battle profile" on public.battle_profiles;
create policy "users update their battle profile" on public.battle_profiles for update using (auth.uid()=id) with check (auth.uid()=id);
grant select on public.battle_profiles to anon, authenticated;
grant update(display_name) on public.battle_profiles to authenticated;

create or replace function public.create_battle_profile()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  insert into public.battle_profiles(id,display_name)
  values(new.id,left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),split_part(coalesce(new.email,'Player'),'@',1),'Player'),24))
  on conflict(id) do nothing;
  return new;
end $$;
drop trigger if exists create_battle_profile_after_signup on auth.users;
create trigger create_battle_profile_after_signup after insert on auth.users
for each row execute function public.create_battle_profile();

insert into public.battle_profiles(id,display_name)
select id,left(coalesce(nullif(trim(raw_user_meta_data->>'display_name'),''),split_part(coalesce(email,'Player'),'@',1),'Player'),24)
from auth.users on conflict(id) do nothing;

alter table public.battle_rooms add column if not exists ranked boolean not null default false;
alter table public.battle_players add column if not exists user_id uuid references auth.users(id) on delete set null;
create unique index if not exists battle_one_user_per_room on public.battle_players(room_id,user_id) where user_id is not null;

create table if not exists public.battle_rating_events (
  room_id uuid primary key references public.battle_rooms(id) on delete cascade,
  player_one uuid not null references public.battle_profiles(id),
  player_two uuid not null references public.battle_profiles(id),
  player_one_score double precision not null,
  player_one_before double precision not null,
  player_one_after double precision not null,
  player_two_before double precision not null,
  player_two_after double precision not null,
  created_at timestamptz not null default now()
);
alter table public.battle_rating_events enable row level security;
drop policy if exists "rating events are readable" on public.battle_rating_events;
create policy "rating events are readable" on public.battle_rating_events for select using(true);
grant select on public.battle_rating_events to anon,authenticated;

-- One-opponent Glicko-2 update. Ratings are stored on the familiar 1500 scale.
create or replace function public.glicko2_update(
  p_rating double precision,p_rd double precision,p_volatility double precision,
  p_opponent_rating double precision,p_opponent_rd double precision,p_score double precision,
  p_tau double precision default 0.5
) returns jsonb language plpgsql immutable set search_path=public,pg_temp as $$
declare
  scale constant double precision:=173.7178;
  mu double precision:=(p_rating-1500)/scale;
  phi double precision:=p_rd/scale;
  mu_j double precision:=(p_opponent_rating-1500)/scale;
  phi_j double precision:=p_opponent_rd/scale;
  g double precision; expected double precision; variance double precision; delta double precision;
  a double precision:=ln(p_volatility*p_volatility); aa double precision; bb double precision;
  fa double precision; fb double precision; fc double precision; cc double precision; epsilon constant double precision:=0.000001;
  phi_star double precision; phi_prime double precision; mu_prime double precision; sigma_prime double precision;
  k integer:=1;
begin
  g:=1/sqrt(1+3*phi_j*phi_j/(pi()*pi()));
  expected:=1/(1+exp(-g*(mu-mu_j)));
  variance:=1/(g*g*expected*(1-expected));
  delta:=variance*g*(p_score-expected);
  aa:=a;
  if delta*delta>phi*phi+variance then bb:=ln(delta*delta-phi*phi-variance);
  else
    while k<100 loop
      bb:=a-k*p_tau;
      fb:=0.5*exp(bb)*(delta*delta-phi*phi-variance-exp(bb))/power(phi*phi+variance+exp(bb),2)-(bb-a)/(p_tau*p_tau);
      exit when fb<0;
      k:=k+1;
    end loop;
  end if;
  fa:=0.5*exp(aa)*(delta*delta-phi*phi-variance-exp(aa))/power(phi*phi+variance+exp(aa),2)-(aa-a)/(p_tau*p_tau);
  fb:=0.5*exp(bb)*(delta*delta-phi*phi-variance-exp(bb))/power(phi*phi+variance+exp(bb),2)-(bb-a)/(p_tau*p_tau);
  while abs(bb-aa)>epsilon loop
    cc:=aa+(aa-bb)*fa/(fb-fa);
    fc:=0.5*exp(cc)*(delta*delta-phi*phi-variance-exp(cc))/power(phi*phi+variance+exp(cc),2)-(cc-a)/(p_tau*p_tau);
    if fc*fb<=0 then aa:=bb; fa:=fb; else fa:=fa/2; end if;
    bb:=cc; fb:=fc;
  end loop;
  sigma_prime:=exp(aa/2);
  phi_star:=sqrt(phi*phi+sigma_prime*sigma_prime);
  phi_prime:=1/sqrt(1/(phi_star*phi_star)+1/variance);
  mu_prime:=mu+phi_prime*phi_prime*g*(p_score-expected);
  return jsonb_build_object('rating',1500+scale*mu_prime,'rd',least(350,scale*phi_prime),'volatility',sigma_prime);
end $$;

create or replace function public.apply_ranked_battle_result()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare p1 public.battle_players; p2 public.battle_players; r1 public.battle_profiles; r2 public.battle_profiles;
  s1 double precision; u1 jsonb; u2 jsonb;
begin
  if new.status<>'finished' or old.status='finished' or not new.ranked then return new; end if;
  if exists(select 1 from public.battle_rating_events where room_id=new.id) then return new; end if;
  if (select count(*) from public.battle_players where room_id=new.id and left_at is null and user_id is not null)<>2 then return new; end if;
  select * into p1 from public.battle_players where room_id=new.id and left_at is null and user_id is not null order by joined_at,id limit 1;
  select * into p2 from public.battle_players where room_id=new.id and left_at is null and user_id is not null and id<>p1.id order by joined_at,id limit 1;
  select * into r1 from public.battle_profiles where id=p1.user_id for update;
  select * into r2 from public.battle_profiles where id=p2.user_id for update;
  s1:=case when p1.score>p2.score then 1 when p1.score<p2.score then 0 else 0.5 end;
  u1:=public.glicko2_update(r1.rating,r1.rating_deviation,r1.volatility,r2.rating,r2.rating_deviation,s1);
  u2:=public.glicko2_update(r2.rating,r2.rating_deviation,r2.volatility,r1.rating,r1.rating_deviation,1-s1);
  insert into public.battle_rating_events(room_id,player_one,player_two,player_one_score,player_one_before,player_one_after,player_two_before,player_two_after)
  values(new.id,r1.id,r2.id,s1,r1.rating,(u1->>'rating')::double precision,r2.rating,(u2->>'rating')::double precision);
  update public.battle_profiles set rating=(u1->>'rating')::double precision,rating_deviation=(u1->>'rd')::double precision,
    volatility=(u1->>'volatility')::double precision,rated_games=rated_games+1,
    wins=wins+(s1=1)::int,losses=losses+(s1=0)::int,draws=draws+(s1=0.5)::int,updated_at=now() where id=r1.id;
  update public.battle_profiles set rating=(u2->>'rating')::double precision,rating_deviation=(u2->>'rd')::double precision,
    volatility=(u2->>'volatility')::double precision,rated_games=rated_games+1,
    wins=wins+(s1=0)::int,losses=losses+(s1=1)::int,draws=draws+(s1=0.5)::int,updated_at=now() where id=r2.id;
  return new;
end $$;
drop trigger if exists apply_ranked_battle_result_after_finish on public.battle_rooms;
create trigger apply_ranked_battle_result_after_finish after update of status on public.battle_rooms
for each row execute function public.apply_ranked_battle_result();

create or replace function public.create_battle_room_v3(p_player_name text,p_player_token uuid,p_grid_size smallint,p_variants text[],p_difficulty text,p_ranked boolean default false)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare created_room public.battle_rooms; created_player public.battle_players; account_id uuid:=auth.uid();
begin
  p_player_name:=left(trim(p_player_name),24);
  if char_length(p_player_name)<1 then raise exception 'Player name is required.'; end if;
  if p_grid_size not in(6,9) then raise exception 'Grid size must be 6 or 9.'; end if;
  if p_difficulty not in('easy','normal','hard') then raise exception 'Invalid difficulty.'; end if;
  if p_ranked and account_id is null then raise exception 'Sign in to create a ranked room.'; end if;
  insert into public.battle_rooms(code,status,grid_size,variants,puzzle_hash,difficulty,ranked)
  values(public.battle_room_code(),'preparing',p_grid_size,coalesce(p_variants,array['classic']::text[]),null,p_difficulty,p_ranked) returning * into created_room;
  insert into public.battle_players(room_id,name,color,user_id) values(created_room.id,p_player_name,'red',account_id) returning * into created_player;
  insert into public.battle_player_secrets(player_id,player_token) values(created_player.id,p_player_token);
  update public.battle_rooms set host_player_id=created_player.id where id=created_room.id returning * into created_room;
  return jsonb_build_object('room',to_jsonb(created_room),'player_id',created_player.id);
end $$;
grant execute on function public.create_battle_room_v3(text,uuid,smallint,text[],text,boolean) to anon,authenticated;

create or replace function public.join_battle_room(p_room_code text,p_player_name text,p_player_token uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare target_room public.battle_rooms; target_player public.battle_players; chosen_color text; account_id uuid:=auth.uid();
begin
  select * into target_room from public.battle_rooms where code=upper(trim(p_room_code));
  if target_room.id is null then raise exception 'Room not found.'; end if;
  select p.* into target_player from public.battle_players p join public.battle_player_secrets s on s.player_id=p.id where p.room_id=target_room.id and s.player_token=p_player_token limit 1;
  if target_player.id is null then
    if target_room.status not in('preparing','lobby') then raise exception 'This battle is not open for joining.'; end if;
    if target_room.ranked and account_id is null then raise exception 'Sign in to join a ranked room.'; end if;
    if target_room.ranked and exists(select 1 from public.battle_players where room_id=target_room.id and user_id=account_id) then raise exception 'This account is already in the room.'; end if;
    if (select count(*) from public.battle_players where room_id=target_room.id and left_at is null)>=(case when target_room.ranked then 2 else 4 end) then raise exception 'This room is full.'; end if;
    p_player_name:=left(trim(p_player_name),24); if char_length(p_player_name)<1 then raise exception 'Player name is required.'; end if;
    select color into chosen_color from unnest(array['red','blue','green','orange']) color where color not in(select p.color from public.battle_players p where p.room_id=target_room.id and p.left_at is null) limit 1;
    insert into public.battle_players(room_id,name,color,left_at,user_id) values(target_room.id,p_player_name,coalesce(chosen_color,'red'),null,account_id) returning * into target_player;
    insert into public.battle_player_secrets(player_id,player_token) values(target_player.id,p_player_token);
  else update public.battle_players set last_seen_at=now(),left_at=null,name=left(trim(p_player_name),24) where id=target_player.id returning * into target_player;
  end if;
  return jsonb_build_object('room',to_jsonb(target_room),'player_id',target_player.id);
end $$;
grant execute on function public.join_battle_room(text,text,uuid) to anon,authenticated;

create or replace function public.start_battle_room(p_room_id uuid,p_player_token uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare target public.battle_rooms;
begin
  select r.* into target from public.battle_rooms r join public.battle_player_secrets s on s.player_id=r.host_player_id where r.id=p_room_id and s.player_token=p_player_token;
  if target.id is null then raise exception 'Only the host can start this battle.'; end if;
  if target.ranked and (select count(*) from public.battle_players where room_id=p_room_id and left_at is null and user_id is not null)<>2 then raise exception 'A ranked battle requires exactly two signed-in players.'; end if;
  update public.battle_rooms set status='playing',started_at=now()+interval '3 seconds',finished_at=null,finish_reason=null where id=p_room_id and status='lobby';
end $$;
grant execute on function public.start_battle_room(uuid,uuid) to anon,authenticated;

alter table public.battle_rooms drop constraint if exists battle_rooms_finish_reason_check;
alter table public.battle_rooms add constraint battle_rooms_finish_reason_check check(finish_reason is null or finish_reason in('solved','time_limit','forfeit'));

create or replace function public.leave_battle_room(p_room_id uuid,p_player_token uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare leaving_player public.battle_players; target public.battle_rooms; opponent_score int; next_host uuid;
begin
  select p.* into leaving_player from public.battle_players p join public.battle_player_secrets s on s.player_id=p.id where p.room_id=p_room_id and s.player_token=p_player_token limit 1;
  if leaving_player.id is null then return; end if;
  select * into target from public.battle_rooms where id=p_room_id for update;
  if target.status='playing' and (target.ranked or target.tournament_match_id is not null) then
    select max(score) into opponent_score from public.battle_players where room_id=p_room_id and id<>leaving_player.id and left_at is null;
    update public.battle_players set score=least(score,coalesce(opponent_score,score)+-1) where id=leaving_player.id;
    update public.battle_rooms set status='finished',finished_at=now(),finish_reason='forfeit' where id=p_room_id;
  end if;
  update public.battle_rooms set host_player_id=null where id=p_room_id and host_player_id=leaving_player.id;
  update public.battle_players set left_at=now() where id=leaving_player.id;
  if not exists(select 1 from public.battle_players where room_id=p_room_id and left_at is null) then
    if not target.ranked and target.tournament_match_id is null then delete from public.battle_rooms where id=p_room_id; end if;
    return;
  end if;
  select id into next_host from public.battle_players where room_id=p_room_id and left_at is null order by joined_at,id limit 1;
  update public.battle_rooms set host_player_id=coalesce(host_player_id,next_host) where id=p_room_id;
end $$;

create or replace function public.abort_battle_room(p_room_id uuid,p_player_token uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare target public.battle_rooms;
begin
  select r.* into target from public.battle_rooms r join public.battle_player_secrets s on s.player_id=r.host_player_id where r.id=p_room_id and s.player_token=p_player_token;
  if target.id is null then raise exception 'Only the host can abort this battle.'; end if;
  if target.ranked or target.tournament_match_id is not null then raise exception 'Ranked and tournament matches cannot be aborted.'; end if;
  if target.status<>'playing' then raise exception 'This battle is not running.'; end if;
  delete from public.battle_moves where room_id=p_room_id; delete from public.battle_room_secrets where room_id=p_room_id;
  update public.battle_players set score=0 where room_id=p_room_id;
  update public.battle_rooms set status='preparing',puzzle_hash=null,started_at=null,finished_at=null,finish_reason=null where id=p_room_id;
end $$;
grant execute on function public.leave_battle_room(uuid,uuid) to anon,authenticated;
grant execute on function public.abort_battle_room(uuid,uuid) to anon,authenticated;

create table if not exists public.battle_tournaments(
  id uuid primary key default gen_random_uuid(),code text not null unique default public.battle_room_code(),
  host_user_id uuid not null references auth.users(id) on delete cascade,status text not null default 'lobby' check(status in('lobby','playing','finished')),
  rounds smallint not null check(rounds between 1 and 10),current_round smallint not null default 0,variant text not null default 'classic' check(variant='classic'),created_at timestamptz not null default now()
);
create table if not exists public.battle_tournament_players(
  tournament_id uuid not null references public.battle_tournaments(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,match_points double precision not null default 0,buchholz double precision not null default 0,joined_at timestamptz not null default now(),primary key(tournament_id,user_id)
);
create table if not exists public.battle_tournament_player_secrets(
  tournament_id uuid not null,user_id uuid not null,player_token uuid not null,
  primary key(tournament_id,user_id),foreign key(tournament_id,user_id) references public.battle_tournament_players(tournament_id,user_id) on delete cascade
);
create table if not exists public.battle_tournament_matches(
  id uuid primary key default gen_random_uuid(),tournament_id uuid not null references public.battle_tournaments(id) on delete cascade,
  round_number smallint not null,table_number smallint not null,player_one uuid not null references auth.users(id),player_two uuid references auth.users(id),
  battle_room_id uuid references public.battle_rooms(id) on delete set null,result text check(result in('player_one','player_two','draw','bye')),status text not null default 'running' check(status in('running','finished')),
  unique(tournament_id,round_number,table_number)
);
alter table public.battle_rooms add column if not exists tournament_match_id uuid references public.battle_tournament_matches(id) on delete set null;

alter table public.battle_tournaments enable row level security; alter table public.battle_tournament_players enable row level security;
alter table public.battle_tournament_player_secrets enable row level security; alter table public.battle_tournament_matches enable row level security;
drop policy if exists "tournaments readable" on public.battle_tournaments; create policy "tournaments readable" on public.battle_tournaments for select using(true);
drop policy if exists "tournament players readable" on public.battle_tournament_players; create policy "tournament players readable" on public.battle_tournament_players for select using(true);
drop policy if exists "tournament matches readable" on public.battle_tournament_matches; create policy "tournament matches readable" on public.battle_tournament_matches for select using(true);
grant select on public.battle_tournaments,public.battle_tournament_players,public.battle_tournament_matches to anon,authenticated;
revoke all on public.battle_tournament_player_secrets from anon,authenticated;

create or replace function public.create_battle_tournament(p_rounds smallint,p_player_token uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare t public.battle_tournaments; profile public.battle_profiles;
begin
  if auth.uid() is null then raise exception 'Sign in to host a tournament.'; end if;
  if p_rounds not between 1 and 10 then raise exception 'Rounds must be between 1 and 10.'; end if;
  select * into profile from public.battle_profiles where id=auth.uid();
  insert into public.battle_tournaments(host_user_id,rounds) values(auth.uid(),p_rounds) returning * into t;
  insert into public.battle_tournament_players(tournament_id,user_id,display_name) values(t.id,auth.uid(),profile.display_name);
  insert into public.battle_tournament_player_secrets values(t.id,auth.uid(),p_player_token);
  return to_jsonb(t);
end $$;

create or replace function public.join_battle_tournament(p_code text,p_player_token uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare t public.battle_tournaments; profile public.battle_profiles;
begin
  if auth.uid() is null then raise exception 'Sign in to join a tournament.'; end if;
  select * into t from public.battle_tournaments where code=upper(trim(p_code));
  if t.id is null then raise exception 'Tournament not found.'; end if; if t.status<>'lobby' then raise exception 'Tournament already started.'; end if;
  if (select count(*) from public.battle_tournament_players where tournament_id=t.id)>=64 then raise exception 'Tournament is full.'; end if;
  select * into profile from public.battle_profiles where id=auth.uid();
  insert into public.battle_tournament_players(tournament_id,user_id,display_name) values(t.id,auth.uid(),profile.display_name) on conflict do nothing;
  insert into public.battle_tournament_player_secrets values(t.id,auth.uid(),p_player_token) on conflict(tournament_id,user_id) do update set player_token=excluded.player_token;
  return to_jsonb(t);
end $$;

create or replace function public.start_battle_tournament_round(p_tournament_id uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare t public.battle_tournaments; p1 uuid; p2 uuid; match_id uuid; room public.battle_rooms; bp1 public.battle_players; bp2 public.battle_players;
  token1 uuid; token2 uuid; table_no int:=0; next_round int;
begin
  select * into t from public.battle_tournaments where id=p_tournament_id for update;
  if t.host_user_id<>auth.uid() then raise exception 'Only the host can start a round.'; end if;
  if t.status='finished' then raise exception 'Tournament is finished.'; end if;
  if (select count(*) from public.battle_tournament_players where tournament_id=t.id)<2 then raise exception 'At least two players are required.'; end if;
  if exists(select 1 from public.battle_tournament_matches where tournament_id=t.id and round_number=t.current_round and status='running') then raise exception 'The current round is not finished.'; end if;
  next_round:=t.current_round+1; if next_round>t.rounds then raise exception 'All rounds are complete.'; end if;
  create temporary table swiss_pool(user_id uuid primary key,sort_order bigint,paired boolean default false) on commit drop;
  insert into swiss_pool(user_id,sort_order)
  select tp.user_id,row_number() over(order by tp.match_points desc,tp.buchholz desc,coalesce(bp.rating,1500) desc,tp.joined_at,tp.user_id)
  from public.battle_tournament_players tp left join public.battle_profiles bp on bp.id=tp.user_id where tp.tournament_id=t.id;
  loop
    select user_id into p1 from swiss_pool where not paired order by sort_order limit 1; exit when p1 is null;
    update swiss_pool set paired=true where user_id=p1;
    select s.user_id into p2 from swiss_pool s where not s.paired and not exists(
      select 1 from public.battle_tournament_matches m where m.tournament_id=t.id and ((m.player_one=p1 and m.player_two=s.user_id) or (m.player_one=s.user_id and m.player_two=p1))
    ) order by s.sort_order limit 1;
    if p2 is null then select user_id into p2 from swiss_pool where not paired order by sort_order limit 1; end if;
    table_no:=table_no+1;
    if p2 is null then
      insert into public.battle_tournament_matches(tournament_id,round_number,table_number,player_one,result,status) values(t.id,next_round,table_no,p1,'bye','finished');
      update public.battle_tournament_players set match_points=match_points+1 where tournament_id=t.id and user_id=p1;
    else
      update swiss_pool set paired=true where user_id=p2;
      insert into public.battle_tournament_matches(tournament_id,round_number,table_number,player_one,player_two) values(t.id,next_round,table_no,p1,p2) returning id into match_id;
      insert into public.battle_rooms(code,status,grid_size,variants,puzzle_hash,difficulty,ranked,tournament_match_id)
        values(public.battle_room_code(),'preparing',9,array['classic']::text[],null,'normal',false,match_id) returning * into room;
      select player_token into token1 from public.battle_tournament_player_secrets where tournament_id=t.id and user_id=p1;
      select player_token into token2 from public.battle_tournament_player_secrets where tournament_id=t.id and user_id=p2;
      insert into public.battle_players(room_id,name,color,user_id) select room.id,display_name,'red',p1 from public.battle_tournament_players where tournament_id=t.id and user_id=p1 returning * into bp1;
      insert into public.battle_players(room_id,name,color,user_id) select room.id,display_name,'blue',p2 from public.battle_tournament_players where tournament_id=t.id and user_id=p2 returning * into bp2;
      insert into public.battle_player_secrets values(bp1.id,token1),(bp2.id,token2);
      update public.battle_rooms set host_player_id=bp1.id where id=room.id;
      update public.battle_tournament_matches set battle_room_id=room.id where id=match_id;
    end if;
    p1:=null;p2:=null;
  end loop;
  update public.battle_tournaments set status='playing',current_round=next_round where id=t.id;
end $$;

create or replace function public.finish_tournament_match()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare m public.battle_tournament_matches; p1score int;p2score int; outcome text; tournament_rounds int;tournament_current int;
begin
  if new.status<>'finished' or old.status='finished' or new.tournament_match_id is null then return new; end if;
  select * into m from public.battle_tournament_matches where id=new.tournament_match_id for update; if m.status='finished' then return new; end if;
  select score into p1score from public.battle_players where room_id=new.id and user_id=m.player_one;
  select score into p2score from public.battle_players where room_id=new.id and user_id=m.player_two;
  outcome:=case when p1score>p2score then 'player_one' when p2score>p1score then 'player_two' else 'draw' end;
  update public.battle_tournament_matches set status='finished',result=outcome where id=m.id;
  update public.battle_tournament_players set match_points=match_points+(case when outcome='player_one' then 1 when outcome='draw' then .5 else 0 end) where tournament_id=m.tournament_id and user_id=m.player_one;
  update public.battle_tournament_players set match_points=match_points+(case when outcome='player_two' then 1 when outcome='draw' then .5 else 0 end) where tournament_id=m.tournament_id and user_id=m.player_two;
  update public.battle_tournament_players tp set buchholz=coalesce((select sum(opp.match_points) from public.battle_tournament_matches tm join public.battle_tournament_players opp on opp.tournament_id=tm.tournament_id and opp.user_id=case when tm.player_one=tp.user_id then tm.player_two else tm.player_one end where tm.tournament_id=tp.tournament_id and tm.status='finished' and tm.player_two is not null and tp.user_id in(tm.player_one,tm.player_two)),0) where tp.tournament_id=m.tournament_id;
  select rounds,current_round into tournament_rounds,tournament_current from public.battle_tournaments where id=m.tournament_id;
  if tournament_current>=tournament_rounds and not exists(select 1 from public.battle_tournament_matches where tournament_id=m.tournament_id and status='running') then update public.battle_tournaments set status='finished' where id=m.tournament_id; end if;
  return new;
end $$;
drop trigger if exists finish_tournament_match_after_battle on public.battle_rooms;
create trigger finish_tournament_match_after_battle after update of status on public.battle_rooms for each row execute function public.finish_tournament_match();

grant execute on function public.create_battle_tournament(smallint,uuid) to authenticated;
grant execute on function public.join_battle_tournament(text,uuid) to authenticated;
grant execute on function public.start_battle_tournament_round(uuid) to authenticated;

do $$ begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='battle_tournaments') then alter publication supabase_realtime add table public.battle_tournaments; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='battle_tournament_players') then alter publication supabase_realtime add table public.battle_tournament_players; end if;
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='battle_tournament_matches') then alter publication supabase_realtime add table public.battle_tournament_matches; end if;
end $$;
