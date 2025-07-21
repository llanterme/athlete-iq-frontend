'use client';

import { signIn, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    getSession().then((session) => {
      if (session) {
        router.push('/dashboard');
      }
    });
  }, [router]);

  const handleStravaLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('strava', {
        callbackUrl: '/dashboard',
      });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">🏃 Athlete IQ</h1>
          <p className="text-white/80 text-lg">Your Personal Strava Fitness AI Assistant</p>
        </div>

        <Card glass className="text-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Welcome to Athlete IQ</h2>
              <p className="text-white/80">
                Connect your Strava account to get AI-powered insights about your fitness activities.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Features:</h3>
              <ul className="space-y-2 text-white/80">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-tertiary-500 rounded-full mr-3"></span>
                  View your Strava profile and statistics
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-tertiary-500 rounded-full mr-3"></span>
                  Chat with AI about your activities (coming soon)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-tertiary-500 rounded-full mr-3"></span>
                  Get personalized training insights (coming soon)
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleStravaLogin}
                loading={isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? 'Connecting...' : 'Connect with Strava'}
              </Button>
            </div>

            <p className="text-sm text-white/60">
              🔒 Your data is secure and will only be used within this app.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}