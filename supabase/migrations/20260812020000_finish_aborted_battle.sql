alter table public.battle_rooms drop constraint if exists battle_rooms_finish_reason_check;
alter table public.battle_rooms add constraint battle_rooms_finish_reason_check
  check(finish_reason is null or finish_reason in('solved','time_limit','forfeit','aborted'));

create or replace function public.abort_battle_room(p_room_id uuid,p_player_token uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not exists(select 1 from public.battle_rooms r join public.battle_player_secrets s on s.player_id=r.host_player_id
    where r.id=p_room_id and s.player_token=p_player_token) then
    raise exception 'Only the host can abort this battle.';
  end if;
  if not exists(select 1 from public.battle_rooms where id=p_room_id and status='playing') then
    raise exception 'This battle is not running.';
  end if;
  update public.battle_rooms
    set status='finished',finished_at=now(),finish_reason='aborted'
    where id=p_room_id;
end $$;

grant execute on function public.abort_battle_room(uuid,uuid) to anon,authenticated;
