import { PrivyClient, type User as PrivyUser } from '@privy-io/node';

let client: PrivyClient | undefined;

export const isPrivyServerConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID && process.env.PRIVY_APP_SECRET);

export const getPrivyClient = () => {
  if (!isPrivyServerConfigured()) throw new Error('Privy server credentials are not configured.');
  client ??= new PrivyClient({
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
    appSecret: process.env.PRIVY_APP_SECRET!,
    // Optional: the app's verification key (Privy dashboard) skips the JWKS
    // round-trip on every token check.
    jwtVerificationKey: process.env.PRIVY_VERIFICATION_KEY || undefined,
  });
  return client;
};

// Verifies a Privy access token and returns the caller's DID plus the token
// expiry (unix seconds), which caps the lifetime of the Supabase JWT we mint.
export const verifyPrivyAccessToken = async (accessToken: string) => {
  const claims = await getPrivyClient().utils().auth().verifyAccessToken(accessToken);
  return { did: claims.user_id, expiration: claims.expiration };
};

export type PrivySolanaWallet = {
  address: string;
  walletType: 'embedded' | 'external';
};

const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

// The Solana wallets among a Privy user's linked accounts. The embedded wallet
// is the one Privy custodies (wallet_client_type 'privy'); anything else is an
// external wallet the user connected and SIWS-verified with Privy.
export const extractSolanaWallets = (user: PrivyUser): PrivySolanaWallet[] => {
  const wallets: PrivySolanaWallet[] = [];
  for (const account of user.linked_accounts ?? []) {
    if (account.type !== 'wallet') continue;
    if (!('chain_type' in account) || account.chain_type !== 'solana') continue;
    if (!('address' in account) || typeof account.address !== 'string') continue;
    if (!SOLANA_ADDRESS.test(account.address)) continue;
    const isEmbedded =
      ('wallet_client_type' in account && account.wallet_client_type === 'privy') ||
      ('connector_type' in account && account.connector_type === 'embedded');
    wallets.push({ address: account.address, walletType: isEmbedded ? 'embedded' : 'external' });
  }
  return wallets;
};

// Fetches the full Privy user. The identity token (privy-id-token cookie) is a
// free local parse; the REST lookup by DID is the fallback when the cookie is
// absent or belongs to a different user than the verified access token.
export const getPrivyUser = async (did: string, identityToken?: string | null): Promise<PrivyUser> => {
  const privy = getPrivyClient();
  if (identityToken) {
    try {
      const user = await privy.users().get({ id_token: identityToken });
      if (user.id === did) return user;
    } catch {
      // Fall through to the REST lookup.
    }
  }
  return privy.users()._get(did);
};
