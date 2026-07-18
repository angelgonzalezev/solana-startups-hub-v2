import type { ProfileRow } from '@/types/database';

// The seam between the React world (Privy hooks, AuthContext) and the module
// world (supabase-js, services). AuthContext registers a refresher that trades
// the Privy access token for a minted Supabase JWT via /api/auth/session; the
// Supabase browser client pulls tokens from here on every authed request.

export type BridgeSession = {
  expiresAt: number;
  profile: ProfileRow;
  token: string;
};

type Refresher = () => Promise<BridgeSession | null>;

const EXPIRY_MARGIN_SECONDS = 60;

let cached: { expiresAt: number; profileId: string; token: string } | null = null;
let refresher: Refresher | null = null;
let inFlight: Promise<BridgeSession | null> | null = null;

export const registerSessionRefresher = (fn: Refresher) => {
  refresher = fn;
};

export const unregisterSessionRefresher = (fn: Refresher) => {
  if (refresher === fn) refresher = null;
};

export const setBridgeSession = (session: BridgeSession | null) => {
  cached = session
    ? { expiresAt: session.expiresAt, profileId: session.profile.id, token: session.token }
    : null;
};

export const clearBridgeSession = () => {
  cached = null;
  inFlight = null;
};

export const getProfileId = () => cached?.profileId ?? null;

// Single-flight refresh through whatever AuthContext registered. Transient
// failures keep the previous token (it may still be valid); a dead session
// simply yields null and requests fall back to anon.
export const refreshBridgeSession = async (): Promise<BridgeSession | null> => {
  if (!refresher) return null;
  inFlight ??= refresher()
    .catch(() => null)
    .finally(() => {
      inFlight = null;
    });
  const session = await inFlight;
  if (session) setBridgeSession(session);
  return session;
};

export const getSupabaseAccessToken = async (): Promise<string | null> => {
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.expiresAt - EXPIRY_MARGIN_SECONDS > now) return cached.token;
  const refreshed = await refreshBridgeSession();
  return refreshed?.token ?? cached?.token ?? null;
};

// Profile id of the signed-in user, refreshing the session first if needed -
// the replacement for the retired supabase.auth.getUser() call sites.
export const getAuthenticatedProfileId = async (): Promise<string | null> => {
  await getSupabaseAccessToken();
  return getProfileId();
};
