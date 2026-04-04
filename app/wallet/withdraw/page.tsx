'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
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
    let providerRequestId: string | null = null;

    try {
      // Step 1: Create a Coinbase off-ramp request. The backend initializes
      // the withdrawal with debited balance and returns a URL.
      setStatusMessage('Creating Coinbase payout request...');
      const sessionResponse = await apiClient.post('/wallets/coinbase/payout-request', {
        amountUSDT: Number(formData.amountUSDT),
        destinationCardLast4: formData.destinationCardLast4,
      });

      const createdSession = sessionResponse.data as {
        withdrawalId: string;
        providerRequestId: string;
        offrampUrl: string;
        amountUSDT: number;
        payoutCurrency: string;
        status: string;
      };
      withdrawalId = createdSession.withdrawalId;
      providerRequestId = createdSession.providerRequestId;

      // Redirect to Coinbase hosted off-ramp URL
      window.location.href = createdSession.offrampUrl;
      setStatusMessage('Redirecting to Coinbase. Complete your withdrawal...');
    } catch (error: any) {
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
              Coinbase will open a hosted off-ramp flow where you can complete your withdrawal securely. Your balance is debited immediately and the fiat will be sent to your destination after completion.
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
