-- The room password is sufficient for viewing and adding shared playable links.
alter table public.wsc2026_puzzles alter column created_by drop not null;

create or replace function public.wsc2026_api(p_action text,p_token uuid,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
 team public.wsc2026_groups;
 member public.wsc2026_members;
 entry public.wsc2026_booklet_entries;
 link text;
begin
 if coalesce(p_payload->>'password','') <> 'กู้ชาติ' then raise exception 'WSC password required.'; end if;
 select g.* into team from public.wsc2026_groups g join public.wsc2026_team t on t.group_id=g.id;
 if p_action='join' then
  return public.wsc2026_private_api('join_group',p_token,jsonb_build_object('username',p_payload->>'username','invite',team.invite_key));
 end if;
 if p_action in ('create_group','join_group') then raise exception 'Use the shared WSC team.'; end if;
 select m.* into member from public.wsc2026_members m where m.device_key=p_token and m.group_id=team.id;
 if p_action='links' then
  return jsonb_build_object('puzzles',(select coalesce(jsonb_agg(to_jsonb(p) order by created_at desc),'[]'::jsonb) from public.wsc2026_puzzles p where p.group_id=team.id));
 end if;
 if p_action='add_link' then
  select b.* into entry from public.wsc2026_booklet_entries b where b.id=p_payload->>'booklet_ref';
  if entry.id is null then raise exception 'Choose a WSC booklet puzzle.'; end if;
  link=trim(coalesce(p_payload->>'puzzle_url',''));
  if length(link)>20000 or link !~ '^(https?://|/[^/])' then raise exception 'Paste a valid saved Sudotoku or Penpa link.'; end if;
  insert into public.wsc2026_puzzles(group_id,created_by,title,round_id,variant_id,puzzle_url,booklet_ref)
  values(team.id,member.id,entry.name,entry.round_id,entry.variant_id,link,entry.id);
  return jsonb_build_object('puzzles',(select coalesce(jsonb_agg(to_jsonb(p) order by created_at desc),'[]'::jsonb) from public.wsc2026_puzzles p where p.group_id=team.id));
 end if;
 if member.id is null then raise exception 'Device key not recognized. Create a profile or restore your key.'; end if;
 return public.wsc2026_private_api(p_action,p_token,p_payload-'password');
end $$;
revoke all on function public.wsc2026_api(text,uuid,jsonb) from public;
grant execute on function public.wsc2026_api(text,uuid,jsonb) to anon,authenticated;
