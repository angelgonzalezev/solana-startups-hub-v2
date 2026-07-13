import { describe, expect, it } from 'vitest';
import type { UserIdentity } from '@supabase/supabase-js';
import { hasVerifiedSolanaIdentity } from './siwsIdentity';

const walletAddress = '7YWHMfk9JZe0LM0g1ZauHuiSxhI8TbX5MZVZVbFpE4Ke';

const identity = (identityData: Record<string, unknown>, provider = 'web3') =>
  ({ identity_data: identityData, provider }) as UserIdentity;

describe('hasVerifiedSolanaIdentity', () => {
  it('accepts the current nested Supabase Web3 claims format', () => {
    expect(
      hasVerifiedSolanaIdentity(
        [identity({ custom_claims: { address: walletAddress, chain: 'solana' } })],
        walletAddress,
      ),
    ).toBe(true);
  });

  it('accepts the direct claims format used by earlier Supabase versions', () => {
    expect(hasVerifiedSolanaIdentity([identity({ address: walletAddress, chain: 'solana' })], walletAddress)).toBe(
      true,
    );
  });

  it('rejects another wallet, chain, or identity provider', () => {
    expect(
      hasVerifiedSolanaIdentity(
        [identity({ custom_claims: { address: '11111111111111111111111111111111', chain: 'solana' } })],
        walletAddress,
      ),
    ).toBe(false);
    expect(
      hasVerifiedSolanaIdentity(
        [identity({ custom_claims: { address: walletAddress, chain: 'ethereum' } })],
        walletAddress,
      ),
    ).toBe(false);
    expect(
      hasVerifiedSolanaIdentity(
        [identity({ custom_claims: { address: walletAddress, chain: 'solana' } }, 'email')],
        walletAddress,
      ),
    ).toBe(false);
  });
});
