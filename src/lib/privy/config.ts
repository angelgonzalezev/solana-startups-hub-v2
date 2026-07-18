export const isPrivyConfigured = () => Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

// https -> wss for the RPC subscriptions endpoint, keeping any provider query
// params (e.g. Helius ?api-key=...) intact.
export const toWssEndpoint = (url: string) => url.replace(/^http/, 'ws');

// Mirror of @solana/client's deriveConnectorId: connector ids for Wallet
// Standard wallets are "wallet-standard:" + the kebab-cased wallet name.
export const walletStandardConnectorId = (walletName: string) =>
  `wallet-standard:${walletName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

type FeatureCarrier = { features: Record<string, unknown> };

// Privy's embedded wallet advertises a proprietary "privy:" feature on top of
// the standard ones - that, not the display name, is its reliable marker.
export const isPrivyStandardWallet = (wallet: FeatureCarrier) =>
  Object.keys(wallet.features).some((feature) => feature.startsWith('privy:'));
