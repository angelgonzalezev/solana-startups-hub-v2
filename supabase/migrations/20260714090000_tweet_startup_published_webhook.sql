-- Calls the tweet-new-startup edge function the first time a startup
-- transitions to listing_status = 'published'. announced_at is set through
-- mark_startup_announced() after a successful tweet, so re-publishing an
-- archived startup never tweets twice.
--
-- service_role has no direct table access in this schema, so the trigger
-- (running as the table owner) resolves the founder handle and launch number
-- itself and ships them in the webhook payload.
--
-- The function URL and shared secret live in Vault so the migration contains
-- no environment-specific values:
--   select vault.create_secret('https://<project-ref>.supabase.co/functions/v1', 'edge_functions_url');
--   select vault.create_secret('<random-string>', 'tweet_webhook_secret');
-- If either secret is missing the trigger is a no-op, so local development and
-- test databases are unaffected.

create extension if not exists pg_net;

alter table public.startups
add column announced_at timestamptz;

create or replace function public.notify_tweet_startup_published()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  functions_url text;
  webhook_secret text;
  founder public.profiles;
  launch_number bigint;
begin
  select decrypted_secret into functions_url
  from vault.decrypted_secrets
  where name = 'edge_functions_url';

  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets
  where name = 'tweet_webhook_secret';

  if functions_url is null or webhook_secret is null then
    return new;
  end if;

  select * into founder from public.profiles where id = new.owner_profile_id;

  select count(*) + 1 into launch_number
  from public.startups
  where announced_at is not null;

  perform net.http_post(
    url := functions_url || '/tweet-new-startup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', webhook_secret
    ),
    body := jsonb_build_object(
      'type', TG_OP,
      'record', to_jsonb(new),
      'launch_number', launch_number,
      'twitter_handle', founder.twitter_handle,
      'display_name', founder.display_name
    ),
    timeout_milliseconds := 5000
  );

  return new;
exception when others then
  -- Never block publishing because the announcement failed.
  raise warning 'tweet-new-startup webhook failed: %', sqlerrm;
  return new;
end;
$$;

create trigger startups_tweet_on_publish
after update on public.startups
for each row
when (
  new.listing_status = 'published'
  and old.listing_status is distinct from 'published'
  and new.announced_at is null
)
execute function public.notify_tweet_startup_published();

-- Called by the edge function (service_role) after the tweet is posted.
create or replace function public.mark_startup_announced(startup_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.startups
  set announced_at = now()
  where id = startup_id and announced_at is null;
$$;

revoke all on function public.mark_startup_announced(uuid) from public, anon, authenticated;
grant execute on function public.mark_startup_announced(uuid) to service_role;
