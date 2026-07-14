-- Opens published startup data to anonymous visitors. Startup detail pages are
-- now fully public, and the marketplace listing is readable without a session
-- (the frontend soft-gates it behind a blur overlay, which is a signup nudge,
-- not a security boundary).
--
-- Anonymous access goes only through these RPCs. The profiles table itself
-- stays authenticated-only: get_startup_team_profiles exposes just the public
-- fields of the people on one accessible startup, so anon cannot enumerate
-- arbitrary profiles or ever see auth_user_id.

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
  where s.verification_status = 'verified'
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
  where s.id = startup_id
    and (
      p.auth_user_id = auth.uid()
      or (s.verification_status = 'verified' and s.listing_status = 'published')
    );
$$;

-- Public profile fields for the owner and team members of one startup, used by
-- the public detail page. Same access rule as get_accessible_startup: the
-- startup must be published, or yours.
create or replace function public.get_startup_team_profiles(startup_id uuid)
returns setof jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'wallet_address', p.wallet_address,
    'display_name', p.display_name,
    'job_title', p.job_title,
    'avatar', p.avatar,
    'bio', p.bio,
    'twitter_handle', p.twitter_handle,
    'telegram_handle', p.telegram_handle,
    'joined_at', p.joined_at
  )
  from public.startups s
  join public.profiles owner_p on owner_p.id = s.owner_profile_id
  join public.profiles p
    on p.id = s.owner_profile_id
    or p.wallet_address in (select jsonb_array_elements(s.team) ->> 'walletAddress')
  where s.id = startup_id
    and (
      owner_p.auth_user_id = auth.uid()
      or (s.verification_status = 'verified' and s.listing_status = 'published')
    );
$$;

grant execute on function public.list_published_startups(text, text[], text[], text[], boolean, text) to anon;
grant execute on function public.get_accessible_startup(uuid) to anon;

revoke all on function public.get_startup_team_profiles(uuid) from public, anon;
grant execute on function public.get_startup_team_profiles(uuid) to anon, authenticated;
