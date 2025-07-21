'use client';

import { useSession } from 'next-auth/react';

export default function DebugPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2 text-sm">
            <p><strong>NEXTAUTH_URL:</strong> {process.env.NEXTAUTH_URL || 'Not set'}</p>
            <p><strong>STRAVA_CLIENT_ID:</strong> {process.env.STRAVA_CLIENT_ID || 'Not set'}</p>
            <p><strong>STRAVA_CLIENT_SECRET:</strong> {process.env.STRAVA_CLIENT_SECRET ? 'Set' : 'Not set'}</p>
            <p><strong>NEXTAUTH_SECRET:</strong> {process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <p><strong>Status:</strong> {status}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Session Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Expected Strava Settings:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>Authorization Callback Domain:</strong> localhost</li>
            <li>• <strong>Authorization Callback URL:</strong> http://localhost:3000/api/auth/callback/strava</li>
          </ul>
        </div>
      </div>
    </div>
  );
}