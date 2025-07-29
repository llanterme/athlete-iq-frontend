'use client';

import { signIn, getSession } from 'next-auth/react';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

function LoginContent() {
  const searchParams = useSearchParams();
  const isDeleted = searchParams.get('deleted') === 'true';

  return (
    <>
      {/* Data Deletion Confirmation */}
      {isDeleted && (
        <Card glass className="text-center mb-6 border-green-500/30">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-3xl">✅</span>
              <h3 className="text-xl font-semibold text-green-400">Data Successfully Deleted</h3>
            </div>
            <p className="text-white/80">
              All your data has been permanently removed from our systems. 
              You can reconnect with Strava anytime to start fresh.
            </p>
          </div>
        </Card>
      )}
    </>
  );
}

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

        <Suspense fallback={null}>
          <LoginContent />
        </Suspense>

        <Card glass className="text-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Welcome to Athlete IQ</h2>
              <p className="text-white/80">
                Transform your Strava data into actionable insights with AI-powered analytics and personalized coaching.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">🚀 What you'll get:</h3>
              <ul className="space-y-2 text-white/80">
                <li className="flex items-center">
                  <span className="text-2xl mr-3">📊</span>
                  <span className="text-left">Advanced fitness metrics: TSS, CTL, ATL, and TSB tracking</span>
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-3">🤖</span>
                  <span className="text-left">Chat with AI about your training, recovery, and performance</span>
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-3">📈</span>
                  <span className="text-left">Interactive charts showing your fitness trends and progress</span>
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-3">🏆</span>
                  <span className="text-left">Personal records tracking and threshold power estimates</span>
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-3">🎯</span>
                  <span className="text-left">Sport-specific analysis for cycling, running, and more</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={handleStravaLogin}
                disabled={isLoading}
                className="transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center py-3 px-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span className="ml-3 text-white font-medium">Connecting...</span>
                  </div>
                ) : (
                  <img
                    src="/connect-with-strava.png"
                    alt="Connect with Strava"
                    className="h-12 w-auto"
                  />
                )}
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-white/60">
                🔒 Your data is secure and will only be used within this app.
              </p>
              <p className="text-sm text-white/60">
                By connecting, you agree to our{' '}
                <a href="/privacy" className="text-white underline hover:text-white/80 transition-colors">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}