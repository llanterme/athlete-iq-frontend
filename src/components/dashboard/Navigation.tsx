'use client';

import { signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({
      callbackUrl: '/login',
    });
  };

  const navigationItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Race Calendar', href: '/races', icon: '🏁' },
    { label: 'Training Plans', href: '/training-plan', icon: '🎯' },
    { label: 'Profile', href: '/profile', icon: '👤' },
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-xl font-bold text-white hover:text-white/80 transition-colors"
            >
              🏃 Athlete IQ
            </button>
            
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(item.href)}
                  className={`text-white/80 hover:text-white hover:bg-white/10 ${
                    pathname === item.href ? 'bg-white/20 text-white' : ''
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            <img
              src="/api_logo_pwrdBy_strava_horiz_orange.png"
              alt="Powered by Strava"
              className="h-6 w-auto"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Mobile menu for navigation */}
            <div className="md:hidden">
              <select
                value={pathname}
                onChange={(e) => router.push(e.target.value)}
                className="bg-white/10 border border-white/20 rounded text-white text-sm p-1 backdrop-blur-sm"
              >
                {navigationItems.map((item) => (
                  <option key={item.href} value={item.href} className="bg-gray-800">
                    {item.icon} {item.label}
                  </option>
                ))}
              </select>
            </div>
            
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