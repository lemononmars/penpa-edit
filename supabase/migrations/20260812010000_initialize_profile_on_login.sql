create or replace function public.ensure_battle_profile(p_display_name text default null)
returns public.battle_profiles
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  account_id uuid := auth.uid();
  profile public.battle_profiles;
  chosen_name text;
begin
  if account_id is null then
    raise exception 'Sign in to initialize a battle profile.';
  end if;

  chosen_name := left(coalesce(nullif(trim(p_display_name), ''), 'Player'), 24);
  insert into public.battle_profiles (id, display_name)
  values (account_id, chosen_name)
  on conflict (id) do nothing;

  select * into profile from public.battle_profiles where id = account_id;
  return profile;
end;
$$;

revoke all on function public.ensure_battle_profile(text) from public, anon;
grant execute on function public.ensure_battle_profile(text) to authenticated;
