'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { formatAmount } from '@/lib/format';

export default function SendPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientEmail: '',
    amount: '',
    note: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.recipientEmail || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/transactions/transfer', {
        recipientEmail: formData.recipientEmail,
        amount: parseFloat(formData.amount),
        note: formData.note,
      });

      toast.success('Transfer initiated successfully!');
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Transfer failed');
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
                Enter the email address of the person you want to send money to
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
                  <span className="font-medium">{formatAmount(formData.amount)} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee (0.01%):</span>
                  <span className="font-medium">
                    {formatAmount(parseFloat(formData.amount || '0') * 0.0001)} USDT
                  </span>
                </div>
                <div className="border-t pt-1 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>
                    {formatAmount(parseFloat(formData.amount || '0') * 1.0001)} USDT
                  </span>
                </div>
              </div>
            </div>

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
