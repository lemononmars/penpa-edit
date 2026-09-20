-- Repair installations where the public single-team wrapper exists but its private implementation does not.
create or replace function public.wsc2026_private_api(p_action text,p_token uuid,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare m public.wsc2026_members; g public.wsc2026_groups; v_ref text; v_round integer; v_name text;
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
  if (select count(*) from public.wsc2026_members where group_id=g.id)>=7 then raise exception 'This group already has seven members.'; end if;
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
revoke all on function public.wsc2026_private_api(text,uuid,jsonb) from public,anon,authenticated;
