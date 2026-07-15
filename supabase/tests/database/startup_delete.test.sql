begin;
select plan(6);

-- Seed fixtures: startups '...0001' (published) and '...0003' both belong to
-- profile '...0001'; profile '...0002' owns someone else's startups.

update public.startups
set listing_status = 'archived'
where id = '20000000-0000-4000-8000-000000000003';

-- A payment against the soon-to-be-deleted startup: the ledger must survive
-- the deletion.
select public.apply_verified_payment(
  'sig-delete-1', '11111111111111111111111111111111',
  '10000000-0000-4000-8000-000000000001', 'featured_listing_7d',
  '20000000-0000-4000-8000-000000000003', 20000000,
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '30000000-0000-4000-8000-000000000001',
    'authenticated', 'authenticated', null, '', now(), now(), now(), '{}', '{}'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '30000000-0000-4000-8000-000000000002',
    'authenticated', 'authenticated', null, '', now(), now(), now(), '{}', '{}'
  );

update public.profiles
set auth_user_id = '30000000-0000-4000-8000-000000000001'
where id = '10000000-0000-4000-8000-000000000001';

update public.profiles
set auth_user_id = '30000000-0000-4000-8000-000000000002'
where id = '10000000-0000-4000-8000-000000000002';

set local role authenticated;
select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000002', true);

select throws_ok(
  $$select public.delete_startup('20000000-0000-4000-8000-000000000003')$$,
  'P0001',
  'Startup not found, not archived, or unauthorized',
  'a non-owner cannot delete an archived startup'
);

select set_config('request.jwt.claim.sub', '30000000-0000-4000-8000-000000000001', true);

select throws_ok(
  $$select public.delete_startup('20000000-0000-4000-8000-000000000001')$$,
  'P0001',
  'Startup not found, not archived, or unauthorized',
  'a published startup must be archived before it can be deleted'
);

select is(
  (select public.delete_startup('20000000-0000-4000-8000-000000000003')->>'id'),
  '20000000-0000-4000-8000-000000000003',
  'the owner can delete their archived startup'
);

reset role;

select is(
  (select count(*)::integer from public.startups where id = '20000000-0000-4000-8000-000000000003'),
  0,
  'the deleted startup is gone'
);

select is(
  (select count(*)::integer from public.payments where tx_signature = 'sig-delete-1'),
  1,
  'the payments ledger survives the deletion'
);

set local role anon;
select set_config('request.jwt.claim.sub', '', true);

select throws_ok(
  $$select public.delete_startup('20000000-0000-4000-8000-000000000001')$$,
  '42501',
  'permission denied for function delete_startup',
  'anonymous users cannot execute delete_startup'
);

select * from finish();
rollback;
