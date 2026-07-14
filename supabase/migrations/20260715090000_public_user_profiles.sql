-- Public user profile pages (/u/<wallet>). Two anon-safe RPCs, following the
-- same rules as the public startup RPCs: only public profile fields ever leave
-- the database (never auth_user_id or profile ids), and only startups that are
-- verified and published are listed.

-- Public fields for one profile, looked up by wallet.
create or replace function public.get_public_profile(wallet text)
returns jsonb
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
  from public.profiles p
  where p.wallet_address = wallet;
$$;

-- Published startups the wallet is involved in, either as the owner or tagged
-- in the team jsonb. The frontend splits owned vs collaborations by comparing
-- owner_wallet with the profile wallet. Hidden MRR stays redacted.
create or replace function public.list_public_startups_by_wallet(wallet text)
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
      p.wallet_address = wallet
      or exists (
        select 1 from jsonb_array_elements(s.team) member
        where member ->> 'walletAddress' = wallet
      )
    )
  order by s.created_at desc;
$$;

revoke all on function public.get_public_profile(text) from public, anon;
revoke all on function public.list_public_startups_by_wallet(text) from public, anon;
grant execute on function public.get_public_profile(text) to anon, authenticated;
grant execute on function public.list_public_startups_by_wallet(text) to anon, authenticated;
