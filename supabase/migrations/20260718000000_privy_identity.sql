-- Privy replaces Supabase Auth as the identity system. Profiles are keyed by
-- the Privy DID from here on; auth_user_id stays only as a legacy marker for
-- rows created under SIWS (its FK must go so retiring auth.users can never
-- cascade-delete adopted profiles). Sessions are minted JWTs whose sub is
-- profiles.id, so every ownership predicate moves from
-- "p.auth_user_id = auth.uid()" to "p.id = auth.uid()".
--
-- Existing users are adopted lazily: the first Privy login whose linked wallet
-- matches profiles.wallet_address claims the row by setting privy_did (see
-- /api/auth/session). No data is rewritten here.

alter table public.profiles
add column privy_did text;

alter table public.profiles
add constraint profiles_privy_did_format check (privy_did is null or privy_did like 'did:privy:%');

create unique index profiles_privy_did_key on public.profiles (privy_did);

alter table public.profiles drop constraint profiles_auth_user_id_fkey;

-- Every Solana wallet linked to the Privy account, synced server-side from
-- Privy's linked_accounts on each login/link. Payments accept any of these as
-- the fee payer, so a user who linked their Phantom can pay from it even when
-- their profile identity is the embedded wallet.
create table public.user_wallets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  privy_did text not null,
  address text not null unique,
  wallet_type text not null,
  added_at timestamptz not null default now(),
  constraint user_wallets_address_format check (address ~ '^[1-9A-HJ-NP-Za-km-z]{32,44}$'),
  constraint user_wallets_type_valid check (wallet_type in ('embedded', 'external'))
);

create index user_wallets_profile_id_idx on public.user_wallets(profile_id);

alter table public.user_wallets enable row level security;

create policy user_wallets_read_own
on public.user_wallets for select
to authenticated
using (profile_id = auth.uid());

revoke all on public.user_wallets from anon, authenticated;
grant select on public.user_wallets to authenticated;

-- ---------------------------------------------------------------------------
-- Ownership predicate swap: auth_user_id -> id
-- ---------------------------------------------------------------------------

drop policy profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy startups_owner_read on public.startups;
create policy startups_owner_read
on public.startups for select
to authenticated
using (owner_profile_id = auth.uid());

-- The EXISTS stays here because inserting also requires a complete profile.
drop policy startups_owner_insert on public.startups;
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
      and p.id = auth.uid()
      and char_length(p.display_name) between 2 and 80
      and char_length(p.job_title) between 2 and 80
  )
);

drop policy startups_owner_update on public.startups;
create policy startups_owner_update
on public.startups for update
to authenticated
using (owner_profile_id = auth.uid())
with check (owner_profile_id = auth.uid());

drop policy payments_read_own on public.payments;
create policy payments_read_own
on public.payments for select
to authenticated
using (profile_id = auth.uid());

-- Storage: new uploads live under <profile_id>/... . The legacy branch keeps
-- files uploaded under the old <auth_user_id>/... folder manageable by the
-- adopted owner (avatar/logo replacement deletes the previous object).
drop policy media_select_own on storage.objects;
create policy media_select_own
on storage.objects for select
to authenticated
using (
  bucket_id = 'media'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or (storage.foldername(name))[1] in (
      select p.auth_user_id::text from public.profiles p
      where p.id = auth.uid() and p.auth_user_id is not null
    )
  )
);

drop policy media_insert_own on storage.objects;
create policy media_insert_own
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy media_update_own on storage.objects;
create policy media_update_own
on storage.objects for update
to authenticated
using (
  bucket_id = 'media'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or (storage.foldername(name))[1] in (
      select p.auth_user_id::text from public.profiles p
      where p.id = auth.uid() and p.auth_user_id is not null
    )
  )
)
with check (
  bucket_id = 'media'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or (storage.foldername(name))[1] in (
      select p.auth_user_id::text from public.profiles p
      where p.id = auth.uid() and p.auth_user_id is not null
    )
  )
);

drop policy media_delete_own on storage.objects;
create policy media_delete_own
on storage.objects for delete
to authenticated
using (
  bucket_id = 'media'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or (storage.foldername(name))[1] in (
      select p.auth_user_id::text from public.profiles p
      where p.id = auth.uid() and p.auth_user_id is not null
    )
  )
);

-- ---------------------------------------------------------------------------
-- security definer functions: latest body of each, ownership predicate swapped
-- ---------------------------------------------------------------------------

-- Latest body from 20260714150000_public_startup_details.sql.
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
        when p.id = auth.uid() or s.show_mrr then s.mrr
        else null
      end
    )
  from public.startups s
  join public.profiles p on p.id = s.owner_profile_id
  where s.id = startup_id
    and (
      p.id = auth.uid()
      or (s.verification_status = 'verified' and s.listing_status = 'published')
    );
$$;

-- Latest body from 20260715150000_profile_usernames.sql.
create or replace function public.get_startup_team_profiles(startup_id uuid)
returns setof jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'wallet_address', p.wallet_address,
    'username', p.username,
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
      owner_p.id = auth.uid()
      or (s.verification_status = 'verified' and s.listing_status = 'published')
    );
$$;

-- Latest body from 20260713000000_initial_schema.sql.
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

-- Latest body from 20260713000000_initial_schema.sql.
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
  where s.id = startup_id and p.id = auth.uid();

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

-- Latest body from 20260713000000_initial_schema.sql.
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
    and p.id = auth.uid()
  returning s.* into target;

  if target.id is null then
    raise exception 'Startup not found or unauthorized';
  end if;
  return to_jsonb(target);
end;
$$;

-- Latest body from 20260715200000_delete_startup.sql.
create or replace function public.delete_startup(startup_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.startups;
begin
  delete from public.startups s
  using public.profiles p
  where s.id = startup_id
    and p.id = s.owner_profile_id
    and p.id = auth.uid()
    and s.listing_status = 'archived'
  returning s.* into target;

  if target.id is null then
    raise exception 'Startup not found, not archived, or unauthorized';
  end if;
  return to_jsonb(target);
end;
$$;

-- ---------------------------------------------------------------------------
-- Privy session provisioning (service_role only)
--
-- service_role has no direct table access in this schema, so everything the
-- token exchange needs goes through definer functions, same pattern as
-- apply_verified_payment / admin_review_startup.
-- ---------------------------------------------------------------------------

-- Resolves the profile for a verified Privy login, in one atomic step:
-- find by DID, else adopt the oldest legacy SIWS profile that owns one of the
-- linked wallets, else create a fresh profile. Then mirrors the linked-wallet
-- set into user_wallets (the payer allowlist for verify-payment).
-- in_wallets: jsonb array of {"address": text, "wallet_type": "embedded"|"external"}.
-- Raises 'wallet_already_linked' when a linked wallet belongs to another DID.
create or replace function public.resolve_privy_profile(in_did text, in_wallets jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.profiles;
  addresses text[];
  primary_wallet text;
begin
  if in_did is null or in_did not like 'did:privy:%' then
    raise exception 'Invalid Privy DID';
  end if;
  if jsonb_typeof(in_wallets) is distinct from 'array' or jsonb_array_length(in_wallets) = 0 then
    raise exception 'At least one linked wallet is required';
  end if;

  select array_agg(w ->> 'address') into addresses from jsonb_array_elements(in_wallets) as w;

  select * into target from public.profiles where privy_did = in_did;

  if target.id is null then
    -- Serialize concurrent adoptions of the same legacy profile.
    select * into target
    from public.profiles
    where wallet_address = any(addresses)
    order by (privy_did is null) desc, joined_at asc
    limit 1
    for update;

    if target.id is not null and target.privy_did is not null and target.privy_did <> in_did then
      raise exception 'wallet_already_linked';
    end if;

    if target.id is not null and target.privy_did is null then
      update public.profiles set privy_did = in_did where id = target.id returning * into target;
    end if;

    if target.id is null then
      -- New user: the embedded wallet (when present) is the public identity.
      select coalesce(
        (select w ->> 'address' from jsonb_array_elements(in_wallets) as w where w ->> 'wallet_type' = 'embedded' limit 1),
        addresses[1]
      ) into primary_wallet;

      begin
        insert into public.profiles (privy_did, wallet_address)
        values (in_did, primary_wallet)
        returning * into target;
      exception when unique_violation then
        -- Either this DID won a concurrent race (fine, reuse the row) or the
        -- wallet address belongs to someone else's profile.
        select * into target from public.profiles where privy_did = in_did;
        if target.id is null then
          raise exception 'wallet_already_linked';
        end if;
      end;
    end if;
  end if;

  -- Mirror the linked set: drop wallets that were unlinked in Privy, upsert
  -- the rest. A re-linked address moves back to this profile.
  delete from public.user_wallets
  where profile_id = target.id and address <> all(addresses);

  insert into public.user_wallets (profile_id, privy_did, address, wallet_type)
  select target.id, in_did, w ->> 'address', w ->> 'wallet_type'
  from jsonb_array_elements(in_wallets) as w
  on conflict (address) do update
  set profile_id = excluded.profile_id,
      privy_did = excluded.privy_did,
      wallet_type = excluded.wallet_type;

  return to_jsonb(target);
end;
$$;

-- Server-side session hydration: the profile behind a verified privy-token
-- cookie, or null.
create or replace function public.get_profile_by_privy_did(in_did text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select to_jsonb(p) from public.profiles p where p.privy_did = in_did;
$$;

-- The payer allowlist verify-payment checks the on-chain fee payer against:
-- the profile's identity wallet plus every wallet linked through Privy.
create or replace function public.get_payment_payer_context(in_profile_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'profile_id', p.id,
    'wallet_address', p.wallet_address,
    'wallets', coalesce((select jsonb_agg(w.address) from public.user_wallets w where w.profile_id = p.id), '[]'::jsonb)
  )
  from public.profiles p
  where p.id = in_profile_id;
$$;

revoke all on function public.resolve_privy_profile(text, jsonb) from public, anon, authenticated;
grant execute on function public.resolve_privy_profile(text, jsonb) to service_role;
revoke all on function public.get_profile_by_privy_did(text) from public, anon, authenticated;
grant execute on function public.get_profile_by_privy_did(text) to service_role;
revoke all on function public.get_payment_payer_context(uuid) from public, anon, authenticated;
grant execute on function public.get_payment_payer_context(uuid) to service_role;
