-- Tech stack becomes optional for verification. Not every listed project is
-- software: Community startups run events, and the Services categories
-- (Legal, Marketing, Recruiting...) were never tech-based either. The cap of
-- 10 technologies stays; only the minimum of 1 goes away.
-- Body otherwise identical to 20260718000000_privy_identity.sql.
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
    and p.id = auth.uid()
    and char_length(p.display_name) between 2 and 80
    and char_length(p.job_title) between 2 and 80;

  if target.id is null then
    raise exception 'Startup not found, profile incomplete, or unauthorized';
  end if;

  if char_length(target.description) not between 200 and 2000
    or target.website !~ '^https?://'
    or target.twitter = ''
    or cardinality(target.category) not between 1 and 5
    or cardinality(target.tech_stack) > 10
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
