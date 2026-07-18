'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFundWallet, useSignAndSendTransaction, useWallets } from '@privy-io/react-auth/solana';
import { useAuth } from '@/context/AuthContext';
import { isPrivyStandardWallet } from '@/lib/privy/config';
import {
  buildUsdcTransferTransaction,
  getUsdcBalanceBaseUnits,
  signatureBytesToBase58,
} from '@/lib/solana/usdcTransfer';
import { Startup } from '@/interface/startup';
import {
  FEATURED_LISTING_BASE_UNITS,
  FEATURED_LISTING_PRICE_USDC,
  FEATURED_LISTING_SKU,
  PaymentVerificationError,
  paymentService,
  TREASURY_WALLET,
  USDC_MINT,
} from '@/services/paymentService';

export type FeaturedPurchasePhase = 'idle' | 'paying' | 'verifying' | 'done';

export type FeaturedPurchaseSuccess = {
  txSignature: string;
  featuredUntil?: string;
};

// The featured-listing purchase state machine: a USDC transfer to the
// treasury built with @solana/kit and signed/sent through Privy (embedded
// wallets silently, external wallets via their own prompt), then server-side
// verification through the verify-payment edge function. The signature is
// persisted before verification, so a refresh mid-purchase resumes (from
// whichever page mounts this hook for the startup) instead of charging twice.
export const useFeaturedPurchase = (startup: Startup, onFeatured?: () => Promise<void> | void) => {
  const { walletAddress } = useAuth();
  const { wallets } = useWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const { fundWallet } = useFundWallet();
  const [phase, setPhase] = useState<FeaturedPurchasePhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<FeaturedPurchaseSuccess | null>(null);
  const resumeAttempted = useRef(false);

  // Pay with the profile's identity wallet when Privy has it, else whatever
  // wallet the session offers - the server accepts any linked wallet as payer.
  const payerWallet = wallets.find((wallet) => wallet.address === walletAddress) ?? wallets[0] ?? null;
  const payerIsEmbedded = payerWallet ? isPrivyStandardWallet(payerWallet.standardWallet) : false;
  // Gas sponsorship (Privy pays the network fee for embedded wallets). Off
  // until the Privy team activates it for the app; flip the env flag then.
  const sponsorFees = payerIsEmbedded && process.env.NEXT_PUBLIC_ENABLE_GAS_SPONSORSHIP === 'true';

  const verify = useCallback(
    async (txSignature: string) => {
      setPhase('verifying');
      setError(null);
      try {
        const result = await paymentService.verifyPayment({
          sku: FEATURED_LISTING_SKU,
          targetId: startup.id,
          txSignature,
        });
        paymentService.clearPendingSignature(FEATURED_LISTING_SKU, startup.id);
        setPhase('done');
        setSuccess({ txSignature, featuredUntil: result.featuredUntil ?? undefined });
        await onFeatured?.();
      } catch (verifyError) {
        if (verifyError instanceof PaymentVerificationError && !verifyError.retriable) {
          paymentService.clearPendingSignature(FEATURED_LISTING_SKU, startup.id);
        }
        setPhase('idle');
        setError(verifyError instanceof Error ? verifyError.message : 'Payment verification failed.');
      }
    },
    [onFeatured, startup.id],
  );

  // Resume a purchase whose verification never completed (refresh, lost
  // connection): the transfer already happened, only the verify call is redone.
  useEffect(() => {
    if (resumeAttempted.current) return;
    resumeAttempted.current = true;
    const pending = paymentService.readPendingSignature(FEATURED_LISTING_SKU, startup.id);
    if (pending) void verify(pending);
  }, [startup.id, verify]);

  const buy = async () => {
    if (!payerWallet) {
      setError('No wallet is available for this payment. Please sign in again.');
      return;
    }
    setError(null);
    setPhase('paying');
    try {
      // Fail with a clear message before the wallet's cryptic simulation
      // error: an underfunded wallet is the most common first-purchase issue.
      const balance = await getUsdcBalanceBaseUnits(payerWallet.address, USDC_MINT);
      if (balance < BigInt(FEATURED_LISTING_BASE_UNITS)) {
        const held = (Number(balance) / 1_000_000).toFixed(2);
        setPhase('idle');
        setError(
          `Your wallet ${payerWallet.address.slice(0, 4)}…${payerWallet.address.slice(-4)} holds ${held} USDC, but the featured listing costs ${FEATURED_LISTING_BASE_UNITS / 1_000_000} USDC. Top it up and try again.`,
        );
        return;
      }

      const transaction = await buildUsdcTransferTransaction({
        amountBaseUnits: FEATURED_LISTING_BASE_UNITS,
        destinationOwner: TREASURY_WALLET,
        mint: USDC_MINT,
        sender: payerWallet.address,
      });
      const { signature } = await signAndSendTransaction({
        chain: 'solana:mainnet',
        options: sponsorFees ? { sponsor: true } : undefined,
        transaction,
        wallet: payerWallet,
      });
      const txSignature = signatureBytesToBase58(signature);
      paymentService.savePendingSignature(FEATURED_LISTING_SKU, startup.id, txSignature);
      await verify(txSignature);
    } catch (sendError) {
      setPhase('idle');
      setError(sendError instanceof Error ? sendError.message : 'The payment was not sent.');
    }
  };

  return {
    phase,
    error,
    success,
    buy,
    dismissError: () => setError(null),
    dismissSuccess: () => setSuccess(null),
    // Opens Privy's funding flow (card onramp, exchange or wallet transfer)
    // for the paying wallet - the way out of the underfunded error.
    fundPayerWallet: payerWallet
      ? () =>
          void fundWallet({
            address: payerWallet.address,
            options: { amount: String(FEATURED_LISTING_PRICE_USDC), asset: 'USDC' },
          }).catch((fundFailure) => {
            setError(
              /not enabled/i.test(String(fundFailure?.message))
                ? 'Funding is not available yet. Please send USDC to your wallet from an exchange or another wallet.'
                : fundFailure instanceof Error
                  ? fundFailure.message
                  : 'Unable to open the funding flow.',
            );
          })
      : null,
    busy: phase === 'paying' || phase === 'verifying',
    // Paying only needs a Privy session wallet - no Wallet Standard
    // connection state involved.
    canPay: Boolean(payerWallet),
    // The purchase is only offered for listings that are actually live.
    available:
      Boolean(TREASURY_WALLET) && startup.listingStatus === 'published' && startup.verificationStatus === 'verified',
  };
};
