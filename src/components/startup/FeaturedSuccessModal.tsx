'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FEATURED_LISTING_DAYS, USDC_MINT } from '@/services/paymentService';

const DEVNET_USDC_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

interface FeaturedSuccessModalProps {
  startupName: string;
  txSignature: string;
  featuredUntil?: string;
  onClose: () => void;
}

// Celebration shown after a featured-listing purchase verifies: links to the
// on-chain transaction and states when the featured window ends.
const FeaturedSuccessModal: React.FC<FeaturedSuccessModalProps> = ({
  startupName,
  txSignature,
  featuredUntil,
  onClose,
}) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const explorerUrl = `https://solscan.io/tx/${txSignature}${USDC_MINT === DEVNET_USDC_MINT ? '?cluster=devnet' : ''}`;
  const until = featuredUntil
    ? new Date(featuredUntil).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  // Portal to <body> so ancestors with transforms cannot trap the fixed
  // overlay inside their own box.
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md space-y-6 rounded-[30px] border border-amber-400/25 bg-[#0A0A0A] p-8 text-center shadow-[0_0_60px_-15px_rgba(251,191,36,0.45)]">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-3xl text-amber-400">
          ★
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">Congratulations! 🎉</h3>
          <p className="text-white/70">
            <span className="font-bold text-white">{startupName}</span> is now pinned at the top of the marketplace{' '}
            {until ? (
              <>
                until <span className="font-bold text-amber-400">{until}</span>.
              </>
            ) : (
              <>for the next {FEATURED_LISTING_DAYS} days.</>
            )}
          </p>
        </div>

        <div className="space-y-2">
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-md w-full border-amber-400/30 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20">
            View transaction on Solscan ↗
          </a>
          <p className="break-all px-2 text-xs text-white/30">{txSignature}</p>
        </div>

        <button onClick={onClose} className="btn btn-white-dark btn-md w-full">
          Close
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default FeaturedSuccessModal;
