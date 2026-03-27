'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="container-custom py-16">
      {!user ? (
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Fast, Secure Payments
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Send money instantly using blockchain technology. Transfer funds across the globe with just an email address.
          </p>
          
          <div className="flex gap-4 justify-center mb-12">
            <Link href="/auth/login" className="btn-primary">
              Sign In
            </Link>
            <Link href="/auth/register" className="btn-secondary">
              Create Account
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 my-16">
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">💰 Instant Transfers</h3>
              <p className="text-gray-600">Send and receive money in seconds with minimal fees.</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">🔒 Secure</h3>
              <p className="text-gray-600">Bank-level security with blockchain verification.</p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">🌍 Global</h3>
              <p className="text-gray-600">Send money to anyone, anywhere in the world.</p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Welcome back, {user.firstName || user.username}!
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/dashboard" className="card hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold mb-2">📊 Dashboard</h2>
              <p className="text-gray-600">View your wallet and transaction history</p>
            </Link>
            <Link href="/send" className="card hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold mb-2">📤 Send Money</h2>
              <p className="text-gray-600">Transfer funds to another user</p>
            </Link>
            <Link href="/receive" className="card hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold mb-2">📥 Receive Money</h2>
              <p className="text-gray-600">Share your payment details</p>
            </Link>
            <Link href="/settings" className="card hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold mb-2">⚙️ Settings</h2>
              <p className="text-gray-600">Manage your account and preferences</p>
            </Link>
            {user.role === 'ADMIN' ? (
              <Link href="/admin" className="card hover:shadow-lg transition-shadow">
                <h2 className="text-2xl font-semibold mb-2">🛠️ Admin</h2>
                <p className="text-gray-600">Manage users, roles, and account access</p>
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
