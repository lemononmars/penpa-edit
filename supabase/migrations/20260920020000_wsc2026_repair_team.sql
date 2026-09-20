-- Repair installations where the link RPC was applied without the singleton-team table.
do $$ begin
 if (select count(*) from public.wsc2026_groups)>1 then
  raise exception 'Choose one WSC team before repairing the singleton team table.';
 end if;
end $$;

insert into public.wsc2026_groups(name)
select 'WSC 2026' where not exists(select 1 from public.wsc2026_groups);

create table if not exists public.wsc2026_team (
 singleton boolean primary key default true check(singleton),
 group_id uuid not null references public.wsc2026_groups
);

insert into public.wsc2026_team(singleton,group_id)
select true,id from public.wsc2026_groups
where not exists(select 1 from public.wsc2026_team);

alter table public.wsc2026_team enable row level security;
revoke all on public.wsc2026_team from anon,authenticated;
