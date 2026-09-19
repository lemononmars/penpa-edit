-- One shared WSC team. Existing member credentials, puzzles and records are preserved.
-- Refuse an ambiguous upgrade rather than discard or combine private team data.
do $$ begin
 if (select count(*) from public.wsc2026_groups)>1 then
  raise exception 'Choose one WSC team before applying the single-team migration.';
 end if;
end $$;
create table public.wsc2026_team (
 singleton boolean primary key default true check(singleton),
 group_id uuid not null references public.wsc2026_groups
);
insert into public.wsc2026_groups(name)
select 'WSC 2026' where not exists(select 1 from public.wsc2026_groups);
insert into public.wsc2026_team(group_id) select id from public.wsc2026_groups;
alter table public.wsc2026_team enable row level security;
revoke all on public.wsc2026_team from anon, authenticated;
alter function public.wsc2026_api(text,uuid,jsonb) rename to wsc2026_private_api;
revoke all on function public.wsc2026_private_api(text,uuid,jsonb) from public,anon,authenticated;
create function public.wsc2026_api(p_action text,p_token uuid,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare team public.wsc2026_groups;
begin
 if coalesce(p_payload->>'password','') <> 'กู้ชาติ' then raise exception 'WSC password required.'; end if;
 select g.* into team from public.wsc2026_groups g join public.wsc2026_team t on t.group_id=g.id;
 if p_action='join' then
  return public.wsc2026_private_api('join_group',p_token,jsonb_build_object('username',p_payload->>'username','invite',team.invite_key));
 end if;
 if p_action in ('create_group','join_group') then raise exception 'Use the shared WSC team.'; end if;
 if not exists(select 1 from public.wsc2026_members where device_key=p_token and group_id=team.id) then raise exception 'Device key not recognized. Create a profile or restore your key.'; end if;
 return public.wsc2026_private_api(p_action,p_token,p_payload-'password');
end $$;
revoke all on function public.wsc2026_api(text,uuid,jsonb) from public;
grant execute on function public.wsc2026_api(text,uuid,jsonb) to anon,authenticated;
