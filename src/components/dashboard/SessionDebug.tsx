"use client";

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { API_BASE_URL } from '@/lib/api';

export function SessionDebug() {
  const { data: session } = useSession();
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const testStravaAuth = async () => {
    if (!session?.accessToken) return;
    
    setTesting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/test/strava-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: session.accessToken,
        }),
      });
      
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ error: error instanceof Error ? error.message : 'Test failed' });
    } finally {
      setTesting(false);
    }
  };

  if (!session) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2">Session Debug</h3>
        <p className="text-red-400">No session found</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold text-white mb-2">Session Debug</h3>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-300">User ID:</span>{' '}
          <span className="text-white">{session.user?.id || 'undefined'}</span>
        </div>
        <div>
          <span className="text-gray-300">Strava ID:</span>{' '}
          <span className="text-white">{session.user?.stravaId || 'undefined'}</span>
        </div>
        <div>
          <span className="text-gray-300">Access Token:</span>{' '}
          <span className="text-white">{session.accessToken ? '✓ Present' : '✗ Missing'}</span>
        </div>
        <div>
          <span className="text-gray-300">Refresh Token:</span>{' '}
          <span className="text-white">{session.refreshToken ? '✓ Present' : '✗ Missing'}</span>
        </div>
        <div>
          <span className="text-gray-300">Expires At:</span>{' '}
          <span className="text-white">{session.expiresAt ? new Date(session.expiresAt * 1000).toLocaleString() : 'undefined'}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10">
        <Button
          onClick={testStravaAuth}
          loading={testing}
          disabled={!session.accessToken || testing}
          size="sm"
          variant="secondary"
        >
          Test Strava API Connection
        </Button>
        
        {testResult && (
          <div className="mt-3 p-3 bg-white/5 rounded-lg text-xs">
            <pre className="text-white whitespace-pre-wrap">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
}