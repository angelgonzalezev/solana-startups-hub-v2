import { jwtVerify, SignJWT } from 'jose';

// Supabase Auth is retired: sessions are JWTs we mint ourselves after
// verifying the caller's Privy access token. PostgREST/Storage accept any
// project-secret-signed token, so RLS keeps working with sub = profiles.id
// (auth.uid() resolves to the profile id).
//
// AUTH_JWT_SECRET holds the Supabase project's (legacy) JWT secret - locally
// the CLI demo secret, in production Dashboard -> Settings -> JWT Keys. The
// name avoids the reserved SUPABASE_ prefix so the same variable can be set as
// an edge-function secret. Never revoke that secret while this exchange
// depends on it.

const ISSUER = 'orbital-privy-exchange';
const AUDIENCE = 'authenticated';
// Privy access tokens live 1h; stay under it so a minted token can never
// outlive the Privy session that produced it.
const MAX_LIFETIME_SECONDS = 55 * 60;

const getSecret = () => {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) throw new Error('AUTH_JWT_SECRET is not configured.');
  return new TextEncoder().encode(secret);
};

export const isJwtMintingConfigured = () => Boolean(process.env.AUTH_JWT_SECRET);

export const mintSupabaseAccessToken = async ({
  privyDid,
  privyExpiration,
  profileId,
}: {
  privyDid: string;
  privyExpiration: number;
  profileId: string;
}) => {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = Math.min(privyExpiration, now + MAX_LIFETIME_SECONDS);
  const token = await new SignJWT({ privy_did: privyDid, role: 'authenticated' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(profileId)
    .setAudience(AUDIENCE)
    .setIssuer(ISSUER)
    .setIssuedAt(now)
    .setExpirationTime(expiresAt)
    .sign(getSecret());

  return { expiresAt, token };
};

// Server-side check of a token we minted (used by API routes that need the
// caller's profile id without a Supabase session).
export const verifyMintedAccessToken = async (token: string) => {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: ['HS256'],
    audience: AUDIENCE,
    issuer: ISSUER,
  });
  if (!payload.sub) throw new Error('Minted token is missing its subject.');
  return { privyDid: typeof payload.privy_did === 'string' ? payload.privy_did : null, profileId: payload.sub };
};
