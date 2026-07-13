create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  wallet_address text not null unique,
  display_name text not null default '',
  job_title text not null default '',
  twitter_handle text,
  telegram_handle text,
  avatar text,
  bio text,
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_wallet_address_format check (wallet_address ~ '^[1-9A-HJ-NP-Za-km-z]{32,44}$'),
  constraint profiles_display_name_length check (char_length(display_name) <= 80),
  constraint profiles_job_title_length check (char_length(job_title) <= 80)
);

create table public.startups (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  logo text not null default '',
  one_liner text not null,
  description text not null default '',
  website text not null default '',
  twitter text not null default '',
  discord text,
  github text,
  stage text not null default 'Idea',
  is_raising boolean not null default false,
  acquisition_status text not null default 'not_open',
  mrr numeric,
  show_mrr boolean not null default false,
  team_size integer not null default 1,
  tech_stack text[] not null default '{}',
  category text[] not null default '{}',
  team jsonb not null default '[]'::jsonb,
  verification_status text not null default 'draft',
  listing_status text not null default 'draft',
  domain_verification_status text not null default 'not_started',
  x_verification_status text not null default 'not_started',
  verification_rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint startups_name_length check (char_length(name) between 2 and 80),
  constraint startups_one_liner_length check (char_length(one_liner) between 1 and 160),
  constraint startups_description_length check (char_length(description) <= 2000),
  constraint startups_stage_valid check (stage in ('Idea', 'MVP', 'Early-stage', 'Scaling', 'Established')),
  constraint startups_acquisition_status_valid check (acquisition_status in ('not_open', 'open_to_discuss')),
  constraint startups_mrr_non_negative check (mrr is null or mrr >= 0),
  constraint startups_team_size_positive check (team_size >= 1),
  constraint startups_tech_stack_limit check (cardinality(tech_stack) <= 10),
  constraint startups_category_limit check (cardinality(category) <= 5),
  constraint startups_team_is_array check (jsonb_typeof(team) = 'array'),
  constraint startups_verification_status_valid check (verification_status in ('draft', 'pending', 'verified', 'rejected')),
  constraint startups_listing_status_valid check (listing_status in ('draft', 'published', 'archived')),
  constraint startups_domain_check_valid check (domain_verification_status in ('not_started', 'pending', 'verified', 'failed')),
  constraint startups_x_check_valid check (x_verification_status in ('not_started', 'pending', 'verified', 'failed'))
);

create index startups_owner_profile_id_idx on public.startups(owner_profile_id);
create index startups_marketplace_idx on public.startups(verification_status, listing_status);
create index startups_category_idx on public.startups using gin(category);
create index startups_tech_stack_idx on public.startups using gin(tech_stack);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.reset_verification_on_identity_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.verification_status = 'verified'
    and (new.website is distinct from old.website or new.twitter is distinct from old.twitter) then
    new.verification_status = 'pending';
    new.domain_verification_status = 'pending';
    new.x_verification_status = 'pending';
    new.listing_status = 'draft';
    new.verification_rejection_reason = null;
  end if;
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger startups_reset_verification
before update on public.startups
for each row execute function public.reset_verification_on_identity_change();

create trigger startups_set_updated_at
before update on public.startups
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.startups enable row level security;

create policy profiles_authenticated_read
on public.profiles for select
to authenticated
using (true);

create policy profiles_update_own
on public.profiles for update
to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

create policy startups_owner_read
on public.startups for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = owner_profile_id and p.auth_user_id = auth.uid()
  )
);

create policy startups_owner_insert
on public.startups for insert
to authenticated
with check (
  verification_status = 'draft'
  and listing_status = 'draft'
  and domain_verification_status = 'not_started'
  and x_verification_status = 'not_started'
  and exists (
    select 1 from public.profiles p
    where p.id = owner_profile_id
      and p.auth_user_id = auth.uid()
      and char_length(p.display_name) between 2 and 80
      and char_length(p.job_title) between 2 and 80
  )
);

create policy startups_owner_update
on public.startups for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = owner_profile_id and p.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = owner_profile_id and p.auth_user_id = auth.uid()
  )
);

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, job_title, twitter_handle, telegram_handle, avatar, bio) on public.profiles to authenticated;

revoke all on public.startups from anon, authenticated;
grant select, insert on public.startups to authenticated;
grant update (
  name, logo, one_liner, description, website, twitter, discord, github,
  stage, is_raising, acquisition_status, mrr, show_mrr, team_size,
  tech_stack, category, team
) on public.startups to authenticated;

create or replace function public.list_published_startups(
  search_text text default null,
  categories text[] default null,
  stages text[] default null,
  technologies text[] default null,
  raising boolean default null,
  acquisition text default null
)
returns setof jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select to_jsonb(s)
    || jsonb_build_object(
      'owner_wallet', p.wallet_address,
      'mrr', case when s.show_mrr then s.mrr else null end
    )
  from public.startups s
  join public.profiles p on p.id = s.owner_profile_id
  where auth.uid() is not null
    and s.verification_status = 'verified'
    and s.listing_status = 'published'
    and (
      search_text is null
      or s.name ilike '%' || search_text || '%'
      or s.one_liner ilike '%' || search_text || '%'
    )
    and (categories is null or cardinality(categories) = 0 or s.category && categories)
    and (stages is null or cardinality(stages) = 0 or s.stage = any(stages))
    and (technologies is null or cardinality(technologies) = 0 or s.tech_stack && technologies)
    and (raising is null or s.is_raising = raising)
    and (acquisition is null or s.acquisition_status = acquisition)
  order by s.created_at desc;
$$;

create or replace function public.get_accessible_startup(startup_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select to_jsonb(s)
    || jsonb_build_object(
      'owner_wallet', p.wallet_address,
      'mrr', case
        when p.auth_user_id = auth.uid() or s.show_mrr then s.mrr
        else null
      end
    )
  from public.startups s
  join public.profiles p on p.id = s.owner_profile_id
  where auth.uid() is not null
    and s.id = startup_id
    and (
      p.auth_user_id = auth.uid()
      or (s.verification_status = 'verified' and s.listing_status = 'published')
    );
$$;

create or replace function public.request_startup_verification(startup_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.startups;
begin
  select s.* into target
  from public.startups s
  join public.profiles p on p.id = s.owner_profile_id
  where s.id = startup_id
    and p.auth_user_id = auth.uid()
    and char_length(p.display_name) between 2 and 80
    and char_length(p.job_title) between 2 and 80;

  if target.id is null then
    raise exception 'Startup not found, profile incomplete, or unauthorized';
  end if;

  if char_length(target.description) not between 200 and 2000
    or target.website !~ '^https?://'
    or target.twitter = ''
    or cardinality(target.category) not between 1 and 5
    or cardinality(target.tech_stack) not between 1 and 10
    or target.team_size < 1 then
    raise exception 'Startup does not meet verification requirements';
  end if;

  update public.startups
  set verification_status = 'pending',
      listing_status = 'draft',
      domain_verification_status = 'pending',
      x_verification_status = 'pending',
      verification_rejection_reason = null
  where id = startup_id
  returning * into target;

  return to_jsonb(target);
end;
$$;

create or replace function public.publish_startup(startup_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.startups;
begin
  select s.* into target
  from public.startups s
  join public.profiles p on p.id = s.owner_profile_id
  where s.id = startup_id and p.auth_user_id = auth.uid();

  if target.id is null then
    raise exception 'Startup not found or unauthorized';
  end if;
  if target.verification_status <> 'verified' then
    raise exception 'Only verified startups can be published';
  end if;

  update public.startups set listing_status = 'published'
  where id = startup_id returning * into target;
  return to_jsonb(target);
end;
$$;

create or replace function public.archive_startup(startup_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.startups;
begin
  update public.startups s
  set listing_status = 'archived'
  from public.profiles p
  where s.id = startup_id
    and p.id = s.owner_profile_id
    and p.auth_user_id = auth.uid()
  returning s.* into target;

  if target.id is null then
    raise exception 'Startup not found or unauthorized';
  end if;
  return to_jsonb(target);
end;
$$;

revoke all on function public.list_published_startups(text, text[], text[], text[], boolean, text) from public, anon;
revoke all on function public.get_accessible_startup(uuid) from public, anon;
revoke all on function public.request_startup_verification(uuid) from public, anon;
revoke all on function public.publish_startup(uuid) from public, anon;
revoke all on function public.archive_startup(uuid) from public, anon;

grant execute on function public.list_published_startups(text, text[], text[], text[], boolean, text) to authenticated;
grant execute on function public.get_accessible_startup(uuid) to authenticated;
grant execute on function public.request_startup_verification(uuid) to authenticated;
grant execute on function public.publish_startup(uuid) to authenticated;
grant execute on function public.archive_startup(uuid) to authenticated;
