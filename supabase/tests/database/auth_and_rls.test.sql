begin;
select plan(14);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000',
  '30000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', null, '', now(), now(), now(), '{}', '{}'
);

update public.profiles
set auth_user_id = '30000000-0000-4000-8000-000000000001'
where id = '10000000-0000-4000-8000-000000000001';

set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000001', true);

select is(
  (select count(*)::integer from public.startups),
  4,
  'owners can query every state of their own startups'
);

select is(
  (select count(*)::integer from public.list_published_startups()),
  4,
  'authenticated users can query only published and verified marketplace rows'
);

select is(
  (
    select item->'mrr'
    from public.list_published_startups() item
    where item->>'name' = 'Neon Garden'
  ),
  'null'::jsonb,
  'hidden MRR is redacted by the marketplace RPC'
);

select is(
  (
    select item->>'mrr'
    from public.list_published_startups() item
    where item->>'name' = 'Solana Pay Pro'
  ),
  '12500',
  'visible MRR is returned by the marketplace RPC'
);

select throws_ok(
  $$select public.publish_startup('20000000-0000-4000-8000-000000000003')$$,
  'Only verified startups can be published',
  'pending startups cannot be published'
);

select throws_ok(
  $$insert into public.profiles (auth_user_id, wallet_address) values ('30000000-0000-4000-8000-000000000001', '11111111111111111111111111111111')$$,
  '42501',
  'permission denied for table profiles',
  'authenticated clients cannot bypass verified server-side profile provisioning'
);

select is(
  (select public.archive_startup('20000000-0000-4000-8000-000000000008')->>'listing_status'),
  'archived',
  'owners can archive their startup through the controlled RPC'
);

reset role;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);

select is(
  (select count(*)::integer from public.list_published_startups()),
  4,
  'anonymous visitors can list the published marketplace'
);

select is(
  (
    select item->'mrr'
    from public.list_published_startups() item
    where item->>'name' = 'Neon Garden'
  ),
  'null'::jsonb,
  'hidden MRR stays redacted for anonymous visitors'
);

select is(
  (select public.get_accessible_startup('20000000-0000-4000-8000-000000000001')->>'name'),
  'Solana Pay Pro',
  'anonymous visitors can read a published startup detail'
);

select is(
  (select public.get_accessible_startup('20000000-0000-4000-8000-000000000003')),
  null,
  'anonymous visitors cannot read a non-published startup'
);

-- Solana Pay Pro: the owner also appears in the team jsonb, so the two entries
-- (owner/CEO wallet + Lead Dev wallet) must come back as exactly 2 profiles.
select is(
  (select count(*)::integer from public.get_startup_team_profiles('20000000-0000-4000-8000-000000000001')),
  2,
  'anonymous visitors get the deduplicated owner and team profiles of a published startup'
);

select is(
  (select bool_and(not (item ? 'auth_user_id') and not (item ? 'id'))
   from public.get_startup_team_profiles('20000000-0000-4000-8000-000000000001') item),
  true,
  'team profiles never expose auth_user_id or profile ids'
);

select is(
  (select count(*)::integer from public.get_startup_team_profiles('20000000-0000-4000-8000-000000000003')),
  0,
  'team profiles of a non-published startup stay hidden from anonymous visitors'
);

select * from finish();
rollback;
