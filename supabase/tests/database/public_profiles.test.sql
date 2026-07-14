begin;
select plan(7);

set local role anon;
select set_config('request.jwt.claim.sub', '', true);

-- Alex Rivera (Vote111...) owns Neon Garden (published) and is Lead Dev in the
-- Solana Pay Pro team (published, owned by Marco).
select is(
  (select public.get_public_profile('Vote111111111111111111111111111111111111111')->>'display_name'),
  'Alex Rivera',
  'anonymous visitors can read a public profile by wallet'
);

select is(
  (
    select not (item ? 'auth_user_id') and not (item ? 'id')
    from public.get_public_profile('Vote111111111111111111111111111111111111111') item
  ),
  true,
  'public profiles never expose auth_user_id or profile ids'
);

select is(
  (select public.get_public_profile('99999999999999999999999999999999')),
  null,
  'an unknown wallet returns null instead of erroring'
);

select is(
  (select count(*)::integer from public.list_public_startups_by_wallet('Vote111111111111111111111111111111111111111')),
  2,
  'the profile lists published startups both owned and collaborated on'
);

select is(
  (
    select item->>'name'
    from public.list_public_startups_by_wallet('Vote111111111111111111111111111111111111111') item
    where item->>'owner_wallet' = 'Vote111111111111111111111111111111111111111'
  ),
  'Neon Garden',
  'owned startups are distinguishable through owner_wallet'
);

-- Marco (1111...) owns four startups but only Solana Pay Pro is published.
select is(
  (
    select count(*)::integer
    from public.list_public_startups_by_wallet('11111111111111111111111111111111') item
    where item->>'owner_wallet' = '11111111111111111111111111111111'
  ),
  1,
  'draft, pending, and archived startups never show up on a public profile'
);

select is(
  (
    select item->'mrr'
    from public.list_public_startups_by_wallet('Vote111111111111111111111111111111111111111') item
    where item->>'name' = 'Neon Garden'
  ),
  'null'::jsonb,
  'hidden MRR stays redacted on public profiles'
);

reset role;
select * from finish();
rollback;
