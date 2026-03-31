'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { DISPLAY_CURRENCY, formatAmount } from '@/lib/format';
import { useAuth } from '@/hooks/useAuth';

export default function SendPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    recipientEmail: '',
    amount: '',
    note: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage(null);
    setStatusMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.recipientEmail || !formData.amount) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setStatusMessage('Sending USDT via Privy server wallet...');

    try {
      // The backend resolves the recipient wallet, sends USDT via the
      // user's Privy server wallet on Polygon, and records the transfer.
      await apiClient.post('/transactions/privy-transfer', {
        recipientEmail: formData.recipientEmail,
        amount: parseFloat(formData.amount),
        note: formData.note || undefined,
      });

      setStatusMessage('Transfer complete. Redirecting to dashboard...');
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Transfer failed');
      setStatusMessage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Send Money</h1>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="recipientEmail"
                value={formData.recipientEmail}
                onChange={handleChange}
                placeholder="recipient@example.com"
                className="input-field"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the Payday account email address of the person you want to pay
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USDT) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="input-field"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                A fee of 0.01% will be deducted from your account
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Add a note for the recipient..."
                rows={4}
                className="input-field"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Transfer Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{formatAmount(formData.amount)} {DISPLAY_CURRENCY}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee (0.01%):</span>
                  <span className="font-medium">
                    {formatAmount(parseFloat(formData.amount || '0') * 0.0001)} {DISPLAY_CURRENCY}
                  </span>
                </div>
                <div className="border-t pt-1 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>
                    {formatAmount(parseFloat(formData.amount || '0') * 1.0001)} {DISPLAY_CURRENCY}
                  </span>
                </div>
              </div>
            </div>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Send Money'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
