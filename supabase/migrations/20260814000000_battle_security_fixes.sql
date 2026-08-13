-- Security hardening migration for Sudoku Battle (2026-08-14)
-- 1. kick_battle_player: authenticated server-side kick so the client
--    never needs a raw UPDATE on battle_players.
-- 2. Explicit comment confirming no UPDATE RLS policy exists for
--    battle_rooms or battle_players – all mutations go through
--    security-definer RPCs only.

create or replace function public.kick_battle_player(
  p_room_id       uuid,
  p_host_token    uuid,
  p_target_player_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_room public.battle_rooms;
begin
  select * into target_room from public.battle_rooms where id = p_room_id;
  if target_room.id is null then raise exception 'Room not found.'; end if;
  if not exists (
    select 1 from public.battle_player_secrets
    where player_id = target_room.host_player_id and player_token = p_host_token
  ) then
    raise exception 'Only the host can remove players.';
  end if;
  if target_room.host_player_id = p_target_player_id then
    raise exception 'The host cannot be removed.';
  end if;
  if target_room.status <> 'lobby' then
    raise exception 'Players can only be removed in the lobby.';
  end if;
  update public.battle_players
    set left_at = now()
    where id = p_target_player_id and room_id = p_room_id and left_at is null;
end;
$$;

grant execute on function public.kick_battle_player(uuid, uuid, uuid) to anon, authenticated;

-- Confirm RLS policy audit: battle_rooms and battle_players have only a
-- SELECT policy. No UPDATE policy exists for anon/authenticated, so all
-- direct write attempts from the client are blocked by RLS. This comment
-- is intentional documentation for future auditors.
-- The abort_battle_room RPC already handles status='finished' idempotently;
-- the client-side raw-table fallback in abortBattle has been removed.
