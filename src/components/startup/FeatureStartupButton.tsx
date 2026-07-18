'use client';

import React from 'react';
import { Startup } from '@/interface/startup';
import { isCurrentlyFeatured } from '@/utils/featured';
import { useFeaturedPurchase } from '@/hooks/useFeaturedPurchase';
import FeaturedSuccessModal from './FeaturedSuccessModal';
import PaymentProgressModal from './PaymentProgressModal';
import { FEATURED_LISTING_DAYS, FEATURED_LISTING_PRICE_USDC } from '@/services/paymentService';

interface FeatureStartupButtonProps {
  startup: Startup;
  onFeatured?: () => Promise<void> | void;
}

// The full-width featured-listing offer shown on the verification page; the
// purchase flow itself lives in useFeaturedPurchase (paid through Privy, so
// no wallet-connection state is involved).
const FeatureStartupButton: React.FC<FeatureStartupButtonProps> = ({ startup, onFeatured }) => {
  const { phase, error, success, buy, dismissError, dismissSuccess, busy, available, canPay, fundPayerWallet } =
    useFeaturedPurchase(startup, onFeatured);

  const featured = isCurrentlyFeatured(startup);

  if (!available) return null;

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
          onClick={buy}
          disabled={busy || !canPay}
          className="btn btn-xl w-full border-amber-400/30 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 disabled:opacity-50 sm:w-auto">
          {buttonLabel}
        </button>
      </div>

      {phase === 'done' && (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-center font-bold text-amber-400">
          Your startup is featured 🎉
        </div>
      )}

      <PaymentProgressModal
        phase={phase}
        error={error}
        startupName={startup.name}
        onDismissError={dismissError}
        onFundWallet={fundPayerWallet}
      />

      {success && (
        <FeaturedSuccessModal
          startupName={startup.name}
          txSignature={success.txSignature}
          featuredUntil={success.featuredUntil ?? startup.featuredUntil}
          onClose={dismissSuccess}
        />
      )}
    </div>
  );
};

export default FeatureStartupButton;
