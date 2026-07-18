// Verifies an on-chain USDC payment and grants what it bought, through the
// apply_verified_payment RPC (service_role only).
//
// The client is never trusted: it only supplies {txSignature, sku, targetId}.
// Everything that matters is re-derived server-side — the payer must be the
// wallet bound to the authenticated profile, and the recipient, mint and amount
// are read from the transaction's token balance deltas on chain. Replays are
// stopped by the unique tx_signature in the payments ledger.
//
// Unlike the telegram-* functions this one IS called by the browser with the
// user's JWT — a token minted by the app's Privy exchange (sub = profile id),
// verified here with jose against AUTH_JWT_SECRET (verify_jwt = false in
// config.toml because the platform check is tied to Supabase Auth sessions).
// The JWT is what proves which profile is paying; the fee payer must then be
// one of that profile's linked wallets.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { jwtVerify } from 'npm:jose@6';

// Prices live here, not in the client and not (yet) in a table. Amounts are in
// USDC base units (6 decimals).
const SKUS: Record<string, { amountBaseUnits: bigint }> = {
  featured_listing_7d: { amountBaseUnits: 20_000_000n },
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SIGNATURE_RE = /^[1-9A-HJ-NP-Za-km-z]{64,120}$/;

type TokenBalance = {
  accountIndex: number;
  mint: string;
  owner?: string;
  uiTokenAmount: { amount: string };
};

type RpcTransaction = {
  meta: {
    err: unknown;
    preTokenBalances?: TokenBalance[];
    postTokenBalances?: TokenBalance[];
  };
  transaction: {
    message: { accountKeys: string[] };
  };
};

async function getTransaction(rpcUrl: string, signature: string): Promise<RpcTransaction | null> {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getTransaction',
      params: [signature, { commitment: 'confirmed', maxSupportedTransactionVersion: 0, encoding: 'json' }],
    }),
  });
  if (!response.ok) {
    throw new Error(`RPC responded ${response.status}`);
  }
  const body = await response.json();
  if (body.error) {
    throw new Error(`RPC error: ${body.error.message ?? JSON.stringify(body.error)}`);
  }
  return body.result ?? null;
}

// How much USDC the treasury received in this transaction. Matching on
// owner + mint in the balance deltas (instead of decoding instructions or
// pinning a token account address) covers transfer and transferChecked alike,
// and still works if the treasury ATA was created inside the same transaction
// (no pre balance → it starts at 0).
function treasuryReceived(tx: RpcTransaction, treasuryWallet: string, usdcMint: string): bigint {
  const matches = (b: TokenBalance) => b.owner === treasuryWallet && b.mint === usdcMint;
  const sum = (balances: TokenBalance[] | undefined) =>
    (balances ?? []).filter(matches).reduce((acc, b) => acc + BigInt(b.uiTokenAmount.amount), 0n);
  return sum(tx.meta.postTokenBalances) - sum(tx.meta.preTokenBalances);
}

// The wallets whose USDC balance decreased in this transaction - whoever
// actually funded the payment. Checked instead of the fee payer so gas
// sponsorship (Privy pays the network fee) does not break attribution.
function usdcSenders(tx: RpcTransaction, usdcMint: string): string[] {
  const byOwner = new Map<string, bigint>();
  const add = (balances: TokenBalance[] | undefined, sign: bigint) => {
    for (const b of balances ?? []) {
      if (b.mint !== usdcMint || !b.owner) continue;
      byOwner.set(b.owner, (byOwner.get(b.owner) ?? 0n) + sign * BigInt(b.uiTokenAmount.amount));
    }
  };
  add(tx.meta.preTokenBalances, -1n);
  add(tx.meta.postTokenBalances, 1n);
  return [...byOwner.entries()].filter(([, delta]) => delta < 0n).map(([owner]) => owner);
}

// Unlike the telegram-* functions this one is called from the browser, so it
// must answer the CORS preflight. The wildcard origin is fine: the JWT in the
// Authorization header is what gates access, not the origin.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const rpcUrl = Deno.env.get('SOLANA_RPC_URL');
  const treasuryWallet = Deno.env.get('TREASURY_WALLET');
  const usdcMint = Deno.env.get('USDC_MINT');
  const jwtSecret = Deno.env.get('AUTH_JWT_SECRET');
  if (!rpcUrl || !treasuryWallet || !usdcMint || !jwtSecret) {
    console.error('SOLANA_RPC_URL, TREASURY_WALLET, USDC_MINT or AUTH_JWT_SECRET secret is not set');
    return json(500, { error: 'missing_config' });
  }

  // The minted JWT's subject is the paying profile id.
  const bearer = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  let profileId: string;
  try {
    const { payload } = await jwtVerify(bearer, new TextEncoder().encode(jwtSecret), {
      algorithms: ['HS256'],
      audience: 'authenticated',
      issuer: 'orbital-privy-exchange',
    });
    if (!payload.sub) throw new Error('missing sub');
    profileId = payload.sub;
  } catch {
    return json(401, { error: 'unauthorized' });
  }

  let payload: { txSignature?: unknown; sku?: unknown; targetId?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const txSignature = typeof payload.txSignature === 'string' ? payload.txSignature : '';
  const sku = typeof payload.sku === 'string' ? payload.sku : '';
  const targetId = typeof payload.targetId === 'string' ? payload.targetId : '';
  if (!SIGNATURE_RE.test(txSignature) || !UUID_RE.test(targetId)) {
    return json(400, { error: 'invalid_request' });
  }
  const price = SKUS[sku];
  if (!price) {
    return json(400, { error: 'unknown_sku' });
  }

  // service_role has no direct table access in this schema, so the payer
  // allowlist (identity wallet + Privy-linked wallets, synced by the session
  // exchange) comes through a definer function keyed by the JWT subject.
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: payerContext, error: payerError } = await admin.rpc('get_payment_payer_context', {
    in_profile_id: profileId,
  });
  if (payerError) {
    console.error('get_payment_payer_context failed', payerError);
    return json(500, { error: 'grant_failed' });
  }
  if (!payerContext) {
    return json(404, { error: 'profile_not_found' });
  }
  const profile = payerContext as { profile_id: string; wallet_address: string; wallets: string[] };

  let tx: RpcTransaction | null;
  try {
    tx = await getTransaction(rpcUrl, txSignature);
  } catch (error) {
    console.error('getTransaction failed', error);
    return json(502, { error: 'rpc_unavailable' });
  }

  // Not visible at confirmed commitment yet — the client retries with backoff.
  if (!tx) {
    return json(409, { error: 'tx_not_found', retry: true });
  }
  if (tx.meta.err !== null) {
    return json(400, { error: 'tx_failed' });
  }

  // Whoever sent the USDC must be one of the wallets linked to the paying
  // profile — paying from someone else's session is rejected. Derived from
  // the token balance deltas, not the fee payer, so sponsored transactions
  // (Privy as fee payer) attribute correctly. wallet_address is the fallback
  // for profiles adopted before their first wallet sync.
  const allowedPayers = new Set([profile.wallet_address, ...(profile.wallets ?? [])]);
  const payerWallet = usdcSenders(tx, usdcMint).find((owner) => allowedPayers.has(owner));
  if (!payerWallet) {
    console.warn('Payer mismatch', { signature: txSignature, profile: profile.profile_id });
    return json(403, { error: 'payer_mismatch' });
  }

  const received = treasuryReceived(tx, treasuryWallet, usdcMint);
  if (received < price.amountBaseUnits) {
    console.warn('Underpayment', { signature: txSignature, received: received.toString() });
    return json(400, { error: 'insufficient_amount' });
  }

  const { data, error } = await admin.rpc('apply_verified_payment', {
    in_tx_signature: txSignature,
    in_payer_wallet: payerWallet,
    in_profile_id: profile.profile_id,
    in_sku: sku,
    in_target_id: targetId,
    in_amount_base_units: Number(received),
    in_mint: usdcMint,
  });

  if (error) {
    // The RPC raises when the target is not owned by the paying profile (and
    // rolls the ledger insert back with it, so the signature stays spendable
    // against the right target).
    if (error.message.includes('not owned')) {
      return json(403, { error: 'target_not_owned' });
    }
    console.error('apply_verified_payment failed', error);
    return json(500, { error: 'grant_failed' });
  }

  // applied: false means the signature was already spent. The client only ever
  // submits signatures it created, so a resubmit after a lost response is
  // success from its point of view.
  console.log('Payment verified', { signature: txSignature, sku, targetId, applied: data?.applied });
  return json(200, data);
});
