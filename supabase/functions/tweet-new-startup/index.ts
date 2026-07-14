// Posts a launch announcement to X (Twitter) the first time a startup is
// published. Invoked by the `startups_tweet_on_publish` database trigger (see
// the 20260714090000_tweet_startup_published_webhook.sql migration),
// authenticated with the shared secret in the `x-webhook-secret` header
// instead of a JWT. After a successful tweet it stamps `announced_at`, which
// the trigger checks so a startup is never announced twice.

import { createClient } from 'jsr:@supabase/supabase-js@2';

// Overridable so local testing can point at a mock server.
const TWEET_ENDPOINT = Deno.env.get('TWEET_API_URL') ?? 'https://api.twitter.com/2/tweets';
// X counts every URL as 23 characters and some BMP emoji (✅) as 2, so keep a
// margin below the real 280 limit when truncating.
const TWEET_BUDGET = 270;
const URL_WEIGHT = 23;

// The trigger resolves the founder handle and launch number itself because
// service_role has no direct read access to the tables in this schema.
type WebhookPayload = {
  type: string;
  record: {
    id: string;
    name: string;
    one_liner: string;
    announced_at: string | null;
  };
  launch_number: number;
  twitter_handle: string | null;
  display_name: string | null;
};

function percentEncode(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

async function hmacSha1(key: string, data: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// OAuth 1.0a user-context signature. The request body is JSON, so only the
// oauth_* parameters participate in the signature base string.
async function buildOAuthHeader(method: string, url: string): Promise<string> {
  const params: Record<string, string> = {
    oauth_consumer_key: Deno.env.get('TWITTER_API_KEY')!,
    oauth_nonce: crypto.randomUUID().replaceAll('-', ''),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: Deno.env.get('TWITTER_ACCESS_TOKEN')!,
    oauth_version: '1.0',
  };

  const paramString = Object.keys(params)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join('&');
  const baseString = [method.toUpperCase(), percentEncode(url), percentEncode(paramString)].join('&');
  const signingKey = `${percentEncode(Deno.env.get('TWITTER_API_SECRET')!)}&${percentEncode(
    Deno.env.get('TWITTER_ACCESS_TOKEN_SECRET')!,
  )}`;
  params.oauth_signature = await hmacSha1(signingKey, baseString);

  return (
    'OAuth ' +
    Object.keys(params)
      .sort()
      .map((key) => `${percentEncode(key)}="${percentEncode(params[key])}"`)
      .join(', ')
  );
}

function buildTweet(number: number, name: string, oneLiner: string, builder: string, url: string): string {
  const compose = (line: string) =>
    `✅ Startup #${number} launched on Orbital ✅\n\n🪐 ${name}\n\n${line}\n\nBuilt by ${builder} 👏\n\n🔗 ${url}`;

  const overflow = compose(oneLiner).length - url.length + URL_WEIGHT - TWEET_BUDGET;
  if (overflow <= 0) return compose(oneLiner);
  return compose(oneLiner.slice(0, Math.max(0, oneLiner.length - overflow - 1)).trimEnd() + '…');
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  if (req.headers.get('x-webhook-secret') !== Deno.env.get('TWEET_WEBHOOK_SECRET')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = (await req.json()) as WebhookPayload;
  if (!payload.record?.id || payload.record.announced_at) {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 });
  }
  const startup = payload.record;

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const siteUrl = Deno.env.get('SITE_URL');
  if (!siteUrl) {
    console.error('SITE_URL secret is not set');
    return new Response(JSON.stringify({ error: 'missing_site_url' }), { status: 500 });
  }

  const handle = payload.twitter_handle?.replace(/^@/, '');
  const builder = handle ? `@${handle}` : payload.display_name || 'a founder';
  const startupUrl = `${siteUrl.replace(/\/$/, '')}/startups/${startup.id}`;
  const text = buildTweet(payload.launch_number ?? 1, startup.name, startup.one_liner, builder, startupUrl);

  const response = await fetch(TWEET_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: await buildOAuthHeader('POST', TWEET_ENDPOINT),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  const body = await response.json();

  if (!response.ok) {
    console.error('Tweet failed', response.status, JSON.stringify(body));
    return new Response(JSON.stringify({ error: 'tweet_failed', details: body }), { status: 502 });
  }

  const { error: stampError } = await supabase.rpc('mark_startup_announced', {
    startup_id: startup.id,
  });
  if (stampError) {
    console.error('Tweet posted but failed to stamp announced_at', stampError);
  }

  console.log('Tweet posted', body.data?.id);
  return new Response(JSON.stringify({ tweeted: body.data?.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
