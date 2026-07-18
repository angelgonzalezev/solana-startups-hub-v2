import {
  address,
  appendTransactionMessageInstructions,
  compileTransaction,
  createSolanaRpc,
  createTransactionMessage,
  getBase58Decoder,
  getTransactionEncoder,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from '@solana/kit';
import { findAssociatedTokenPda, getTransferCheckedInstruction, TOKEN_PROGRAM_ADDRESS } from '@solana-program/token';
import { getBrowserRpcEndpoint } from '@/lib/privy/config';

const USDC_DECIMALS = 6;

// Compiles a USDC transfer between the two owners' associated token accounts
// into raw transaction bytes, ready for Privy's signAndSendTransaction. Both
// ATAs are assumed to exist: the sender holds USDC and the treasury has
// received payments before.
export const buildUsdcTransferTransaction = async ({
  amountBaseUnits,
  destinationOwner,
  mint,
  sender,
}: {
  amountBaseUnits: number | bigint;
  destinationOwner: string;
  mint: string;
  sender: string;
}): Promise<Uint8Array> => {
  const senderAddress = address(sender);
  const mintAddress = address(mint);
  const destinationOwnerAddress = address(destinationOwner);

  const [[sourceAta], [destinationAta], { value: latestBlockhash }] = await Promise.all([
    findAssociatedTokenPda({ mint: mintAddress, owner: senderAddress, tokenProgram: TOKEN_PROGRAM_ADDRESS }),
    findAssociatedTokenPda({ mint: mintAddress, owner: destinationOwnerAddress, tokenProgram: TOKEN_PROGRAM_ADDRESS }),
    createSolanaRpc(getBrowserRpcEndpoint()).getLatestBlockhash().send(),
  ]);

  const transfer = getTransferCheckedInstruction({
    amount: BigInt(amountBaseUnits),
    authority: senderAddress,
    decimals: USDC_DECIMALS,
    destination: destinationAta,
    mint: mintAddress,
    source: sourceAta,
  });

  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayer(senderAddress, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstructions([transfer], tx),
  );

  return new Uint8Array(getTransactionEncoder().encode(compileTransaction(message)));
};

export const signatureBytesToBase58 = (signature: Uint8Array): string => getBase58Decoder().decode(signature);

export const getSolBalanceLamports = async (owner: string): Promise<bigint> => {
  const { value } = await createSolanaRpc(getBrowserRpcEndpoint()).getBalance(address(owner)).send();
  return BigInt(value);
};

// Balance of the owner's USDC associated token account, in base units. A
// missing account simply means zero.
export const getUsdcBalanceBaseUnits = async (owner: string, mint: string): Promise<bigint> => {
  const [ata] = await findAssociatedTokenPda({
    mint: address(mint),
    owner: address(owner),
    tokenProgram: TOKEN_PROGRAM_ADDRESS,
  });
  try {
    const { value } = await createSolanaRpc(getBrowserRpcEndpoint()).getTokenAccountBalance(ata).send();
    return BigInt(value.amount);
  } catch {
    return BigInt(0);
  }
};
