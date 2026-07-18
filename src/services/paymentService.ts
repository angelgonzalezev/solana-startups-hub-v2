import { getSupabaseAccessToken } from '@/lib/auth/tokenBridge';
import { getSupabaseConfig } from '@/lib/supabase/config';

// The single source of truth for prices lives server-side in the verify-payment
// edge function; these mirror it for building the transfer and rendering copy.
export const FEATURED_LISTING_SKU = 'featured_listing_7d';
export const FEATURED_LISTING_PRICE_USDC = 20;
export const FEATURED_LISTING_BASE_UNITS = 20_000_000;
export const FEATURED_LISTING_DAYS = 7;

export const USDC_MINT = process.env.NEXT_PUBLIC_USDC_MINT || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
export const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET || '';

export type VerifyPaymentInput = {
  sku: string;
  targetId: string;
  txSignature: string;
};

export type VerifyPaymentResult = {
  applied: boolean;
  featuredUntil: string | null;
};

// Retriable failures leave the pending signature in place so the purchase can
// resume; a non-retriable one means this transaction will never be accepted
// and the client must build a fresh payment.
export class PaymentVerificationError extends Error {
  readonly retriable: boolean;

  constructor(message: string, retriable: boolean) {
    super(message);
    this.name = 'PaymentVerificationError';
    this.retriable = retriable;
  }
}

// User-facing copy for the edge function's error codes. Codes that are not
// listed here (rpc_unavailable, grant_failed, missing_config...) fall through
// to a generic retry-later message: the payment is on chain and can always be
// re-verified with the same signature.
const VERIFY_ERRORS: Record<string, string> = {
  insufficient_amount: 'The transaction paid less than the listed price. Please start a new payment.',
  payer_mismatch: 'The payment was sent from a different wallet than the one you signed in with.',
  target_not_owned: 'This startup does not belong to your profile.',
  tx_failed: 'The transaction failed on chain, so nothing was charged.',
  unknown_sku: 'This product is no longer available.',
};

const RETRY_DELAY_MS = 2500;
const MAX_ATTEMPTS = 12;

const pendingKey = (sku: string, targetId: string) => `orbital:pending-payment:${sku}:${targetId}`;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const callVerifyPayment = async (input: VerifyPaymentInput) => {
  const accessToken = await getSupabaseAccessToken();
  if (!accessToken) throw new Error('Authentication required.');

  const { url, publishableKey } = getSupabaseConfig();
  return fetch(`${url}/functions/v1/verify-payment`, {
    body: JSON.stringify(input),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      apikey: publishableKey,
    },
    method: 'POST',
  });
};

export const paymentService = {
  // A signature persisted before verification completed — after a refresh or a
  // dropped connection the purchase resumes from here instead of paying again.
  readPendingSignature: (sku: string, targetId: string): string | null => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(pendingKey(sku, targetId));
  },

  savePendingSignature: (sku: string, targetId: string, txSignature: string): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(pendingKey(sku, targetId), txSignature);
  },

  clearPendingSignature: (sku: string, targetId: string): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(pendingKey(sku, targetId));
  },

  // Submits the signature to the verify-payment edge function, retrying while
  // the transaction has not reached confirmed commitment (409). A signature
  // that was already spent counts as success: the client only ever submits
  // signatures it created, so it means a previous attempt landed.
  verifyPayment: async (input: VerifyPaymentInput): Promise<VerifyPaymentResult> => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const response = await callVerifyPayment(input);

      if (response.status === 409) {
        if (attempt === MAX_ATTEMPTS) break;
        await wait(RETRY_DELAY_MS);
        continue;
      }

      const body = (await response.json().catch(() => null)) as {
        applied?: boolean;
        error?: string;
        featured_until?: string;
        reason?: string;
      } | null;

      if (response.ok) {
        if (body?.applied) {
          return { applied: true, featuredUntil: body.featured_until ?? null };
        }
        if (body?.reason === 'tx_already_used') {
          return { applied: false, featuredUntil: null };
        }
        throw new PaymentVerificationError(
          'Unexpected verification response. Please contact support with your transaction signature.',
          true,
        );
      }

      const known = body?.error ? VERIFY_ERRORS[body.error] : undefined;
      throw new PaymentVerificationError(
        known ?? 'We could not verify the payment right now. Your funds are safe — please try again in a moment.',
        !known,
      );
    }

    throw new PaymentVerificationError(
      'The transaction has not confirmed yet. Please try again in a moment — your payment will be picked up from where it left off.',
      true,
    );
  },
};
