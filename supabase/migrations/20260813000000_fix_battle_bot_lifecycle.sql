alter table public.battle_players
  add column if not exists is_bot boolean not null default false;

-- Older bot calls inherited auth.uid() from the host through join_battle_room.
update public.battle_players
set is_bot=true,user_id=null
where name in ('🤖 Bot Alpha','🤖 Bot Beta','🤖 Bot Gamma');

create or replace function public.join_battle_bot(
  p_room_id uuid,
  p_host_token uuid,
  p_bot_name text,
  p_bot_token uuid
)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare target_room public.battle_rooms; created_bot public.battle_players; chosen_color text;
begin
  select * into target_room from public.battle_rooms where id=p_room_id for update;
  if target_room.id is null then raise exception 'Room not found.'; end if;
  if not exists(select 1 from public.battle_player_secrets s where s.player_id=target_room.host_player_id and s.player_token=p_host_token) then
    raise exception 'Only the host can add bots.';
  end if;
  if target_room.ranked or target_room.tournament_match_id is not null then
    raise exception 'Bots are not allowed in ranked or tournament battles.';
  end if;
  if target_room.status<>'lobby' then raise exception 'Bots can only be added in the lobby.'; end if;
  if (select count(*) from public.battle_players where room_id=p_room_id and left_at is null)>=4 then raise exception 'This room is full.'; end if;
  if p_bot_name not in ('🤖 Bot Alpha','🤖 Bot Beta','🤖 Bot Gamma') then raise exception 'Invalid bot name.'; end if;
  select color into chosen_color from unnest(array['red','blue','green','orange']) color
    where color not in(select p.color from public.battle_players p where p.room_id=p_room_id and p.left_at is null) limit 1;
  insert into public.battle_players(room_id,name,color,left_at,user_id,is_bot)
  values(p_room_id,p_bot_name,coalesce(chosen_color,'red'),null,null,true)
  returning * into created_bot;
  insert into public.battle_player_secrets(player_id,player_token) values(created_bot.id,p_bot_token);
  return jsonb_build_object('player_id',created_bot.id);
end $$;

grant execute on function public.join_battle_bot(uuid,uuid,text,uuid) to anon,authenticated;

-- A bot heartbeat must never keep a room alive after every human has left.
create or replace function public.expire_battle_rooms()
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
  update public.battle_rooms
    set status='finished',finished_at=started_at+interval '20 minutes',finish_reason='time_limit'
    where status='playing' and started_at is not null and now()>=started_at+interval '20 minutes';
  delete from public.battle_rooms r
    where not exists(
      select 1 from public.battle_players p
      where p.room_id=r.id and not coalesce(p.is_bot,false) and p.left_at is null
        and p.last_seen_at>now()-interval '60 seconds'
    );
end $$;

-- Clean legacy bot-only rooms as soon as the migration lands.
select public.expire_battle_rooms();
