'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { DISPLAY_CURRENCY, formatAmount } from '@/lib/format';

interface Transaction {
  id: string;
  type: string;
  amount: string;
  commissionAmount: string;
  status: string;
  sender: { email: string; username?: string; firstName?: string; lastName?: string };
  receiver: { email: string; username?: string; firstName?: string; lastName?: string };
  createdAt: string;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to be initialized
    if (!authLoading && user) {
      fetchData();
    } else if (!authLoading && !user) {
      // No user after auth initialized, redirect to login
      window.location.href = '/auth/login';
    }
  }, [authLoading, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch wallet
      const walletRes = await apiClient.get('/wallets');
      if (walletRes.data && walletRes.data.length > 0) {
        setWallet(walletRes.data[0]);
      }

      // Fetch transactions
      const txRes = await apiClient.get('/wallets/transactions');
      setTransactions(txRes.data);
    } catch (error: any) {
      setErrorMessage('Failed to fetch dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      {errorMessage ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid md:grid-cols-4 gap-8 mb-12">
        {/* Wallet Balance */}
        <div className="card">
          <h2 className="text-gray-600 text-sm mb-2">Wallet Balance</h2>
          <div className="text-4xl font-bold text-blue-500">
            {formatAmount(wallet?.balance)} {DISPLAY_CURRENCY}
          </div>
          <p className="text-gray-500 text-sm mt-2">
            Status: <span className="capitalize font-semibold">{wallet?.status || 'N/A'}</span>
          </p>
        </div>

        {/* Quick Actions */}
        <Link href="/send" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h2 className="text-gray-600 text-sm mb-2">📤 Send Money</h2>
          <p className="text-lg font-semibold">Transfer funds</p>
        </Link>

        <Link href="/wallet/topup" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h2 className="text-gray-600 text-sm mb-2">💳 Add Funds</h2>
          <p className="text-lg font-semibold">Topup wallet</p>
        </Link>

        <Link href="/wallet/withdraw" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h2 className="text-gray-600 text-sm mb-2">🏦 Withdraw</h2>
          <p className="text-lg font-semibold">Cash out to bank</p>
        </Link>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Recent Transactions</h2>

        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Recipient</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 capitalize text-sm">{tx.type}</td>
                    <td className="py-3 font-semibold">
                      {tx.type === 'transfer' ? '-' : '+'} {formatAmount(tx.amount)} {DISPLAY_CURRENCY}
                    </td>
                    <td className="py-3 text-sm">
                      {tx.type === 'transfer'
                        ? tx.receiver.username || tx.receiver.email
                        : tx.type === 'withdrawal'
                        ? 'Bank Transfer'
                        : 'Topup'}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          tx.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : tx.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
