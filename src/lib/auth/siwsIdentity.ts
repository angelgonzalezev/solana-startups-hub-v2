import type { UserIdentity } from '@supabase/supabase-js';

type SolanaIdentityClaims = {
  address?: unknown;
  chain?: unknown;
};

type Web3IdentityData = SolanaIdentityClaims & {
  custom_claims?: SolanaIdentityClaims;
};

export const hasVerifiedSolanaIdentity = (identities: UserIdentity[] | undefined, walletAddress: string) =>
  Boolean(
    identities?.some((identity) => {
      if (identity.provider !== 'web3') return false;

      const identityData = identity.identity_data as Web3IdentityData | undefined;
      const claims = identityData?.custom_claims ?? identityData;

      return claims?.chain === 'solana' && claims.address === walletAddress;
    }),
  );
