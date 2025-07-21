'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

export function Navigation() {
  const handleLogout = async () => {
    await signOut({
      callbackUrl: '/login',
    });
  };

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white">🏃 Athlete IQ</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-white hover:text-white"
            >
              🚪 Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}