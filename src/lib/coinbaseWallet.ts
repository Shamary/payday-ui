import { apiClient } from './api';

export interface CoinbaseWalletTransferInput {
  withdrawalId: string;
}

/**
 * Triggers a server-side Coinbase embedded wallet transfer.
 *
 * The backend looks up the user's Coinbase embedded wallet and submits a
 * USDC transfer on Base to the destination flow.
 *
 * The on-chain tx hash is returned and stored on the Withdrawal record so
 * Coinbase can reconcile the incoming USDC against the off-ramp request.
 */
export async function initiateCoinbaseWalletTransfer(input: CoinbaseWalletTransferInput): Promise<string> {
  if (!input.withdrawalId) {
    throw new Error('withdrawalId is required to initiate payout transfer');
  }

  const response = await apiClient.post('/wallets/coinbase/payout-initiate-transfer', {
    withdrawalId: input.withdrawalId,
  });

  const txHash = response.data?.blockchainTxHash as string | undefined;
  if (!txHash) {
    throw new Error('Wallet transfer did not return a transaction hash');
  }

  return txHash;
}
