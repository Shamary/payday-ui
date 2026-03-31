import { apiClient } from './api';

export interface PrivyTransferInput {
  withdrawalId: string;
}

/**
 * Triggers a server-side Privy wallet transfer.
 *
 * The backend looks up the user's Privy server wallet (provisioned at
 * registration via the Privy Server Wallets API), builds the USDT ERC-20
 * transfer calldata for the Paybis deposit address, and submits the
 * transaction to Polygon via Privy's eth_sendTransaction RPC endpoint:
 *
 *   POST /v1/wallets/{walletId}/rpc
 *   { "method": "eth_sendTransaction", "caip2": "eip155:137", ... }
 *
 * The on-chain tx hash is returned and stored on the Withdrawal record so
 * Paybis can reconcile the incoming USDT against the off-ramp request.
 *
 * Gas for the Polygon transaction is covered by the Privy wallet's MATIC
 * balance. A paymaster/gas-sponsorship policy can be configured in the
 * Privy dashboard to waive this fee for end-users.
 */
export async function signAndSendPrivyTransfer(input: PrivyTransferInput): Promise<string> {
  if (!input.withdrawalId) {
    throw new Error('withdrawalId is required to initiate Privy transfer');
  }

  const response = await apiClient.post('/wallets/paybis/payout-initiate-transfer', {
    withdrawalId: input.withdrawalId,
  });

  const txHash = response.data?.blockchainTxHash as string | undefined;
  if (!txHash) {
    throw new Error('Privy transfer did not return a transaction hash');
  }

  return txHash;
}
