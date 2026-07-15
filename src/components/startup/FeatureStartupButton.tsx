'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSplToken } from '@solana/react-hooks';
import { useAuth } from '@/context/AuthContext';
import { Startup } from '@/interface/startup';
import { isCurrentlyFeatured } from '@/utils/featured';
import FeaturedSuccessModal from './FeaturedSuccessModal';
import {
  FEATURED_LISTING_BASE_UNITS,
  FEATURED_LISTING_DAYS,
  FEATURED_LISTING_PRICE_USDC,
  FEATURED_LISTING_SKU,
  PaymentVerificationError,
  paymentService,
  TREASURY_WALLET,
  USDC_MINT,
} from '@/services/paymentService';

type Phase = 'idle' | 'paying' | 'verifying' | 'done';

interface FeatureStartupButtonProps {
  startup: Startup;
  onFeatured?: () => Promise<void> | void;
}

// Buys a featured listing: USDC transfer to the treasury signed by the
// connected wallet, then server-side verification through the verify-payment
// edge function. The signature is persisted before verification, so a refresh
// mid-purchase resumes instead of charging twice.
const FeatureStartupButton: React.FC<FeatureStartupButtonProps> = ({ startup, onFeatured }) => {
  const { isWalletConnected } = useAuth();
  const { send } = useSplToken(USDC_MINT);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ txSignature: string; featuredUntil?: string } | null>(null);
  const resumeAttempted = useRef(false);

  const featured = isCurrentlyFeatured(startup);

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

  const handleBuy = async () => {
    setError(null);
    setPhase('paying');
    try {
      const signature = await send(
        { amount: FEATURED_LISTING_BASE_UNITS, amountInBaseUnits: true, destinationOwner: TREASURY_WALLET },
        { commitment: 'confirmed' },
      );
      paymentService.savePendingSignature(FEATURED_LISTING_SKU, startup.id, String(signature));
      await verify(String(signature));
    } catch (sendError) {
      setPhase('idle');
      setError(sendError instanceof Error ? sendError.message : 'The payment was not sent.');
    }
  };

  if (!TREASURY_WALLET) return null;
  if (startup.listingStatus !== 'published' || startup.verificationStatus !== 'verified') return null;

  const busy = phase === 'paying' || phase === 'verifying';
  const buttonLabel =
    phase === 'paying'
      ? 'Waiting for wallet approval…'
      : phase === 'verifying'
        ? 'Confirming payment…'
        : featured
          ? `Extend ${FEATURED_LISTING_DAYS} more days — $${FEATURED_LISTING_PRICE_USDC} USDC`
          : `★ Feature this startup — $${FEATURED_LISTING_PRICE_USDC} USDC / ${FEATURED_LISTING_DAYS} days`;

  return (
    <div className="space-y-5 rounded-[30px] border border-amber-400/15 bg-[#0A0A0A] p-5 sm:p-6 md:p-8">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-white">
          {featured ? '★ Featured listing active' : 'Get more eyes on your startup'}
        </h3>
        <p className="text-white/60">
          {featured && startup.featuredUntil
            ? `Pinned at the top of the marketplace until ${new Date(startup.featuredUntil).toLocaleDateString()}. Extending adds ${FEATURED_LISTING_DAYS} days to the current window.`
            : `Pin ${startup.name} at the top of the marketplace with a Featured badge for ${FEATURED_LISTING_DAYS} days. Paid on-chain in USDC with your connected wallet.`}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={handleBuy}
          disabled={busy || !isWalletConnected}
          className="btn btn-xl w-full border-amber-400/30 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 disabled:opacity-50 sm:w-auto">
          {buttonLabel}
        </button>
        {!isWalletConnected && <p className="text-sm text-white/40">Reconnect your wallet to pay.</p>}
      </div>

      {phase === 'done' && (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-center font-bold text-amber-400">
          Your startup is featured 🎉
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center font-medium text-red-500">
          {error}
        </div>
      )}

      {success && (
        <FeaturedSuccessModal
          startupName={startup.name}
          txSignature={success.txSignature}
          featuredUntil={success.featuredUntil ?? startup.featuredUntil}
          onClose={() => setSuccess(null)}
        />
      )}
    </div>
  );
};

export default FeatureStartupButton;
