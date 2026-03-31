'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { openPaybisWidget } from '@/lib/paybis';
import { useAuth } from '@/hooks/useAuth';

export default function TopupPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage(null);
    setStatusMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount) {
      setErrorMessage('Please enter an amount');
      return;
    }

    if (!user?.preferredCurrency) {
      setErrorMessage('User profile is still loading. Please try again.');
      return;
    }

    setLoading(true);
    setStatusMessage('Creating Paybis checkout...');
    setErrorMessage(null);

    try {
      // Ask the backend to create the Paybis request so checkout opens with
      // the wallet address and amount already pre-filled for this user.
      const response = await apiClient.post('/wallets/paybis/request', {
        amountFiat: Number(formData.amount),
        fiatCurrency: user.preferredCurrency,
      });

      openPaybisWidget(response.data.widgetUrl);
      setStatusMessage(
        `Paybis opened. Complete checkout to buy ${formData.amount} ${user.preferredCurrency} of USDT directly into your app wallet.`
      );
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Topup failed');
      setStatusMessage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Add Funds to Wallet</h1>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ({user?.preferredCurrency || 'JMD'}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                step="1"
                min="0"
                className="input-field text-lg"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Amount will be displayed in USD in your wallet
              </p>
            </div>

            <div>
              <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                Paybis will open with your Privy wallet address pre-filled so you can complete checkout without copying any crypto addresses.
              </p>
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

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Enter the amount you want to add</li>
                <li>We create a Paybis request for your wallet</li>
                <li>Complete the Paybis checkout and any required KYC</li>
                <li>USDT is sent directly to your Privy wallet on Polygon</li>
                <li>Your balance updates after the Paybis webhook is confirmed</li>
              </ol>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Quick Add ({user?.preferredCurrency || 'JMD'})</h3>
              <div className="grid grid-cols-4 gap-2">
                {[1000, 5000, 10000, 50000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                    className="py-2 px-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                  >
                    {user?.preferredCurrency || 'JMD'} {amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 text-lg py-3"
            >
              {loading ? 'Preparing checkout...' : 'Launch Paybis'}
            </button>
          </form>
        </div>

        <div className="mt-6 card">
          <h3 className="font-semibold mb-3">On-Ramp flow:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Amount is collected in your profile currency ({user?.preferredCurrency || 'JMD'})</p>
            <p>• Paybis handles checkout + KYC</p>
            <p>• USDT is delivered to your Privy wallet on Polygon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
