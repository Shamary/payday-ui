'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { DISPLAY_CURRENCY } from '@/lib/format';

export default function TopupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'card',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount) {
      toast.error('Please enter an amount');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/wallets/topup', {
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
      });

      toast.success('Wallet topup initiated!');
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Topup failed');
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
                Amount ({DISPLAY_CURRENCY}) <span className="text-red-500">*</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="input-field"
              >
                <option value="card">Credit/Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Enter the amount you want to add</li>
                <li>Select your preferred payment method</li>
                <li>Complete the payment process</li>
                <li>Funds will be reflected in your wallet balance in USD</li>
              </ol>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Quick Add ({DISPLAY_CURRENCY})</h3>
              <div className="grid grid-cols-4 gap-2">
                {[1000, 5000, 10000, 50000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                    className="py-2 px-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100"
                  >
                    {DISPLAY_CURRENCY} {amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 text-lg py-3"
            >
              {loading ? 'Processing...' : 'Continue to Payment'}
            </button>
          </form>
        </div>

        <div className="mt-6 card">
          <h3 className="font-semibold mb-3">Fees:</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Credit/Debit Card: 2% + processing fee</p>
            <p>• Bank Transfer: 0% (1-2 business days)</p>
            <p>• Mobile Money: 1% + operator fees</p>
          </div>
        </div>
      </div>
    </div>
  );
}
