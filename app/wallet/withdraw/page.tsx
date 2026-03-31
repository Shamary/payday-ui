'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { openPaybisWidget } from '@/lib/paybis';
import { signAndSendPrivyTransfer } from '@/lib/privy';
import { useAuth } from '@/hooks/useAuth';

export default function WithdrawPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amountUSDT: '',
    destinationCardLast4: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amountUSDT || !formData.destinationCardLast4) {
      setErrorMessage('Amount and destination card last 4 are required');
      return;
    }

    if (!user?.preferredCurrency) {
      setErrorMessage('User profile is still loading. Please try again.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    let withdrawalId: string | null = null;
    let paybisRequestId: string | null = null;

    try {
      // Step 1: create a Paybis sell-crypto request. The backend stores the
      // Paybis deposit address and returns a withdrawalId to track the flow.
      setStatusMessage('Creating Paybis payout request...');
      const sessionResponse = await apiClient.post('/wallets/paybis/payout-request', {
        amountUSDT: Number(formData.amountUSDT),
        destinationCardLast4: formData.destinationCardLast4,
      });

      const createdSession = sessionResponse.data as {
        withdrawalId: string;
        paybisRequestId: string;
        depositAddress: string;
        amountUSDT: number;
        widgetUrl: string;
      };
      withdrawalId = createdSession.withdrawalId;
      paybisRequestId = createdSession.paybisRequestId;
      openPaybisWidget(createdSession.widgetUrl);

      // Step 2: the backend uses the user's Privy server wallet to send USDT
      // on Polygon to the Paybis deposit address. All signing happens
      // server-side via the Privy Server Wallets API (eth_sendTransaction).
      setStatusMessage('Sending USDT via Privy server wallet...');
      await signAndSendPrivyTransfer({ withdrawalId: createdSession.withdrawalId });

      setStatusMessage('Withdrawal submitted. Paybis will complete the fiat payout via webhook. Redirecting...');
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (error: any) {
      // If the Privy transfer already started but something else failed,
      // record the failure so it can be investigated.
      if (withdrawalId && paybisRequestId) {
        await apiClient.post('/wallets/paybis/payout-transfer-failed', {
          withdrawalId,
          paybisRequestId,
          failureReason: error?.message || error?.response?.data?.error || 'Transfer failed',
        }).catch(() => undefined);
      }

      setErrorMessage(error.response?.data?.error || error?.message || 'Withdrawal flow failed');
      setStatusMessage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-4xl font-bold">Withdraw to Bank</h1>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Amount (USDT) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amountUSDT"
                value={formData.amountUSDT}
                onChange={handleChange}
                placeholder="125.50"
                step="0.01"
                min="0.01"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Destination Card Last 4 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="destinationCardLast4"
                value={formData.destinationCardLast4}
                onChange={handleChange}
                inputMode="numeric"
                maxLength={4}
                placeholder="4242"
                className="input-field"
                required
              />
            </div>

            <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
              Paybis will provide a deposit address. Your Privy server wallet will send USDT on Polygon to that address, and Paybis will complete the fiat payout after blockchain confirmation.
            </p>

            {errorMessage ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {statusMessage ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                {statusMessage}
              </div>
            ) : null}

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Processing...' : 'Withdraw to Bank'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
