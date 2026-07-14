# tweet-new-startup

Posts a launch announcement to the Orbital X (Twitter) account the first time
a startup transitions to `listing_status = 'published'`. Wired up by a database
trigger (`startups_tweet_on_publish`, see
`supabase/migrations/20260714090000_tweet_startup_published_webhook.sql`)
that calls this function through `pg_net`.

Tweet format:

```
✅ Startup #12 launched on Orbital ✅

🪐 Acme Protocol

The fastest way to do X on Solana.

Built by @founder 👏

🔗 https://<site>/startups/<id>
```

- `#12` is the launch number: startups already announced + 1, in publish order.
- The builder handle comes from `profiles.twitter_handle`, falling back to
  `display_name`.
- The one-liner is truncated with `…` if the tweet would exceed the 280-char limit.
- After a successful tweet the function stamps `startups.announced_at`; the
  trigger skips rows where it is already set, so re-publishing an archived
  startup never tweets twice.

## One-time setup

### 1. X (Twitter) app credentials

In the [X developer portal](https://developer.x.com), create an app with
**Read and Write** permissions while logged in as the account that should
publish the tweets, then generate:

- API Key + API Key Secret (consumer keys)
- Access Token + Access Token Secret (regenerate them **after** switching the
  app to Read and Write, or they stay read-only)

### 2. Edge function secrets

```sh
supabase secrets set \
  TWITTER_API_KEY=... \
  TWITTER_API_SECRET=... \
  TWITTER_ACCESS_TOKEN=... \
  TWITTER_ACCESS_TOKEN_SECRET=... \
  TWEET_WEBHOOK_SECRET="$(openssl rand -hex 32)" \
  SITE_URL=https://your-production-domain.com
```

### 3. Vault secrets (used by the database trigger)

Run once in the SQL editor of the hosted project, using the same value chosen
for `TWEET_WEBHOOK_SECRET` above:

```sql
select vault.create_secret('https://<project-ref>.supabase.co/functions/v1', 'edge_functions_url');
select vault.create_secret('<same value as TWEET_WEBHOOK_SECRET>', 'tweet_webhook_secret');
```

If these Vault secrets are missing (e.g. locally), the trigger is a no-op and
publishing works normally without tweeting.

### 4. Deploy

```sh
supabase db push
supabase functions deploy tweet-new-startup --no-verify-jwt
```

(`verify_jwt = false` is also set in `supabase/config.toml`; the flag makes it
explicit regardless of CLI version.)

## Testing locally

With the local stack running, serve the function against a mock X API
(`TWEET_API_URL`) so nothing is actually posted:

```sh
# env file with fake credentials
cat > /tmp/tweet-test.env <<'EOF'
TWITTER_API_KEY=test
TWITTER_API_SECRET=test
TWITTER_ACCESS_TOKEN=test
TWITTER_ACCESS_TOKEN_SECRET=test
TWEET_WEBHOOK_SECRET=local-secret
SITE_URL=http://localhost:3000
TWEET_API_URL=http://host.docker.internal:9998/2/tweets
EOF

supabase functions serve tweet-new-startup --env-file /tmp/tweet-test.env --no-verify-jwt
```

Then point the trigger at the locally served function:

```sql
select vault.create_secret('http://host.docker.internal:54321/functions/v1', 'edge_functions_url');
select vault.create_secret('local-secret', 'tweet_webhook_secret');
```

Publishing a verified startup (`select public.publish_startup('<id>')`, or an
`update ... set listing_status = 'published'`) now hits the mock server.
Failures are logged in the function logs (`supabase functions logs tweet-new-startup`
in production); a failed tweet never blocks publishing.
