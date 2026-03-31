'use client';

import { useAuth } from '@/hooks/useAuth';

export default function ReceivePage() {
  const { user } = useAuth();

  return (
    <div className="container-custom py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Receive Money</h1>

        <div className="space-y-6">
          {/* Your Payment Details */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Your Payment Details</h2>
            
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
              <p className="text-gray-700 mb-4">
                Share your username and wallet address with anyone who wants to send you money:
              </p>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded border border-gray-300 flex justify-between items-center">
                  <code className="font-mono text-lg text-blue-600">@{user?.username || 'your_username'}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user?.username || '');
                      alert('Username copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Copy
                  </button>
                </div>
                <div className="bg-white p-4 rounded border border-gray-300 text-sm text-gray-700">
                  Wallet: {user?.privyWalletAddress || 'Wallet provisioning in progress'}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">How it works:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Share your username with the sender</li>
                  <li>Payday resolves your wallet address in the backend</li>
                  <li>Sender signs transfer with Privy on Polygon</li>
                  <li>You can withdraw or transfer the funds anytime</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">📋 Share Payment Link</h3>
              <p className="text-gray-600 mb-4">
                Generate a shareable link to receive money
              </p>
              <button className="btn-secondary">Generate Link</button>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-2">📊 View Incoming Requests</h3>
              <p className="text-gray-600 mb-4">
                Check for pending payments sent to you
              </p>
              <button className="btn-secondary">View Requests</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
